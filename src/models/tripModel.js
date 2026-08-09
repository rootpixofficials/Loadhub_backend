import pool from '../config/db.js';

export const initTripTable = async () => {
    // 1. Safely rename the table if it exists as 'loads'
    try {
        const [loadsExists] = await pool.query("SHOW TABLES LIKE 'loads'");
        if (loadsExists.length > 0) {
            await pool.query('ALTER TABLE loads RENAME TO trips;');
            console.log('✅ Renamed table loads to trips');
        }
    } catch (e) {
        // Ignore if error
    }

    // 2. Create the table if it doesn't exist (fresh install)
    const query = `
        CREATE TABLE IF NOT EXISTS trips (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            pickup_location VARCHAR(255) NOT NULL,
            pickup_lat DECIMAL(10, 8) NOT NULL,
            pickup_lng DECIMAL(11, 8) NOT NULL,
            drop_location VARCHAR(255) NOT NULL,
            drop_lat DECIMAL(10, 8) NOT NULL,
            drop_lng DECIMAL(11, 8) NOT NULL,
            vehicle_type_id INT,
            trip_type VARCHAR(255),
            approx_weight VARCHAR(255),
            goods_image VARCHAR(255),
            driver_id INT,
            estimated_fare DECIMAL(10, 2),
            price DECIMAL(10, 2),
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Trips table initialized');
        
        // 3. Fallbacks for migrating existing columns
        try {
            await pool.query('ALTER TABLE trips RENAME COLUMN load_type TO trip_type;');
            console.log('✅ Renamed load_type to trip_type');
        } catch (e) {}

        try {
            await pool.query('ALTER TABLE trips ADD COLUMN goods_image VARCHAR(255);');
        } catch (e) {}

        try {
            await pool.query('ALTER TABLE trips ADD COLUMN price DECIMAL(10, 2);');
            console.log('✅ Added price column to trips table');
        } catch (e) {}

    } catch (err) {
        console.error('❌ Error initializing Trips table:', err.message);
    }
};

export const createTrip = async (data) => {
    const { 
        user_id, pickup_location, pickup_lat, pickup_lng, 
        drop_location, drop_lat, drop_lng, vehicle_type_id, 
        trip_type, approx_weight, goods_image, driver_id, estimated_fare, price
    } = data;

    const query = `
        INSERT INTO trips (
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            trip_type, approx_weight, goods_image, driver_id, estimated_fare, price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        user_id || null, 
        pickup_location, pickup_lat, pickup_lng, 
        drop_location, drop_lat, drop_lng, 
        vehicle_type_id || null, 
        trip_type || null, approx_weight || null, goods_image || null,
        driver_id || null, estimated_fare || null, price || null
    ];
    
    try {
        const [result] = await pool.query(query, values);
        const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [result.insertId]);
        return rows[0];
    } catch (err) {
        throw err;
    }
};

export const getAllTrips = async () => {
    const query = `SELECT * FROM trips ORDER BY id DESC;`;
    const [rows] = await pool.query(query);
    return rows;
};

export const getTripsByUserId = async (user_id) => {
    const query = `SELECT * FROM trips WHERE user_id = ? ORDER BY id DESC;`;
    const [rows] = await pool.query(query, [user_id]);
    return rows;
};

export const getMatchingVehiclesForTrip = async (trip_id) => {
    // 1. Get the trip's vehicle requirement
    const [trips] = await pool.query('SELECT vehicle_type_id FROM trips WHERE id = ?', [trip_id]);
    if (!trips.length) {
        throw new Error('Trip not found');
    }
    const trip = trips[0];
    const { vehicle_type_id } = trip;

    // 2. Query vehicles matching the trip's vehicle_type_id
    let query = `
        SELECT 
            u.id AS driver_id, u.full_name, u.mobile_number, u.current_lat, u.current_lng,
            dv.id AS vehicle_id, dv.registration_number, dv.vehicle_model, dv.status AS vehicle_status,
            vt.id AS vehicle_type_id, vt.name AS vehicle_name, vt.capacity AS max_weight
        FROM users u
        JOIN driver_vehicles dv ON u.id = dv.driver_id
        JOIN vehicle_types vt ON dv.vehicle_type_id = vt.id
        WHERE u.role = 'merchant partner'
    `;
    
    const queryParams = [];

    if (vehicle_type_id) {
        query += ` AND dv.vehicle_type_id = ?`;
        queryParams.push(vehicle_type_id);
    }

    query += ` ORDER BY dv.id DESC`;

    const [rows] = await pool.query(query, queryParams);
    return rows;
};
