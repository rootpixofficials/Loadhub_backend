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

export const getTripsByUserId = async (user_id, date) => {
    let query = `SELECT * FROM trips WHERE user_id = ?`;
    const params = [user_id];
    
    if (date) {
        query += ` AND DATE(created_at) = ?`;
        params.push(date);
    }
    
    query += ` ORDER BY id DESC;`;
    const [rows] = await pool.query(query, params);
    return rows;
};

export const getMatchingVehicles = async (pickup_lat, pickup_lng, drop_lat, drop_lng, vehicle_type_id, radius_km = 50) => {
    // 1. Calculate the delivery distance in Node.js to save SQL complexity
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const delivery_distance = haversineDistance(pickup_lat, pickup_lng, drop_lat, drop_lng);

    // 2. Query vehicles near the pickup location
    let query = `
        SELECT 
            u.id AS driver_id, u.full_name, u.mobile_number,
            dv.id AS vehicle_id, dv.registration_number, dv.vehicle_model, dv.status AS vehicle_status, dv.per_km_rate, dv.latitude, dv.longitude,
            vt.id AS vehicle_type_id, vt.name AS vehicle_name, vt.capacity AS max_weight,
            (6371 * acos(cos(radians(?)) * cos(radians(dv.latitude)) * cos(radians(dv.longitude) - radians(?)) + sin(radians(?)) * sin(radians(dv.latitude)))) AS distance_to_pickup
        FROM users u
        JOIN driver_vehicles dv ON u.id = dv.driver_id
        JOIN vehicle_types vt ON dv.vehicle_type_id = vt.id
        WHERE dv.latitude IS NOT NULL AND dv.longitude IS NOT NULL
        AND dv.is_active = 'online'
    `;
    
    const queryParams = [pickup_lat, pickup_lng, pickup_lat];

    if (vehicle_type_id) {
        query += ` AND dv.vehicle_type_id = ?`;
        queryParams.push(vehicle_type_id);
    }

    query += ` HAVING distance_to_pickup <= ? ORDER BY distance_to_pickup ASC`;
    queryParams.push(radius_km);

    const [rows] = await pool.query(query, queryParams);

    // 3. Map the results to add the total distance and calculated price
    return rows.map(row => {
        const total_distance = row.distance_to_pickup + delivery_distance;
        // Use vehicle's per_km_rate. Default to 0 if not set.
        const rate = parseFloat(row.per_km_rate) || 0;
        const estimated_price = total_distance * rate;
        
        return {
            ...row,
            delivery_distance: parseFloat(delivery_distance.toFixed(2)),
            distance_to_pickup: parseFloat(row.distance_to_pickup.toFixed(2)),
            total_distance: parseFloat(total_distance.toFixed(2)),
            estimated_price: parseFloat(estimated_price.toFixed(2))
        };
    });
};

export const updateTripStatus = async (id, status) => {
    const query = `UPDATE trips SET status = ? WHERE id = ?`;
    await pool.query(query, [status, id]);
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [id]);
    return rows[0];
};
