import pool from '../config/db.js';

export const initLoadTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS loads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            pickup_location VARCHAR(255) NOT NULL,
            pickup_lat DECIMAL(10, 8) NOT NULL,
            pickup_lng DECIMAL(11, 8) NOT NULL,
            drop_location VARCHAR(255) NOT NULL,
            drop_lat DECIMAL(10, 8) NOT NULL,
            drop_lng DECIMAL(11, 8) NOT NULL,
            vehicle_type_id INT,
            load_type VARCHAR(255),
            approx_weight VARCHAR(255),
            goods_image VARCHAR(255),
            driver_id INT,
            estimated_fare DECIMAL(10, 2),
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Loads table initialized');
        
        try {
            await pool.query('ALTER TABLE loads ADD COLUMN goods_image VARCHAR(255);');
            console.log('✅ Added goods_image column to loads table');
        } catch (e) {
            // Ignore error if column already exists
        }
    } catch (err) {
        console.error('❌ Error initializing Loads table:', err.message);
    }
};

export const createLoad = async (data) => {
    const { 
        user_id, pickup_location, pickup_lat, pickup_lng, 
        drop_location, drop_lat, drop_lng, vehicle_type_id, 
        load_type, approx_weight, goods_image, driver_id, estimated_fare 
    } = data;

    const query = `
        INSERT INTO loads (
            user_id, pickup_location, pickup_lat, pickup_lng, 
            drop_location, drop_lat, drop_lng, vehicle_type_id, 
            load_type, approx_weight, goods_image, driver_id, estimated_fare
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        user_id || null, 
        pickup_location, pickup_lat, pickup_lng, 
        drop_location, drop_lat, drop_lng, 
        vehicle_type_id || null, 
        load_type || null, approx_weight || null, goods_image || null,
        driver_id || null, estimated_fare || null
    ];
    
    try {
        const [result] = await pool.query(query, values);
        const [rows] = await pool.query('SELECT * FROM loads WHERE id = ?', [result.insertId]);
        return rows[0];
    } catch (err) {
        throw err;
    }
};

export const getAllLoads = async () => {
    const query = `SELECT * FROM loads ORDER BY id DESC;`;
    const [rows] = await pool.query(query);
    return rows;
};

export const getLoadsByUserId = async (user_id) => {
    const query = `SELECT * FROM loads WHERE user_id = ? ORDER BY id DESC;`;
    const [rows] = await pool.query(query, [user_id]);
    return rows;
};

export const getMatchingVehiclesForLoad = async (load_id) => {
    // 1. Get the load's vehicle requirement
    const [loads] = await pool.query('SELECT vehicle_type_id FROM loads WHERE id = ?', [load_id]);
    if (!loads.length) {
        throw new Error('Load not found');
    }
    const load = loads[0];
    const { vehicle_type_id } = load;

    // 2. Query vehicles matching the load's vehicle_type_id
    let query = `
        SELECT 
            u.id AS driver_id, u.full_name, u.mobile_number, u.current_lat, u.current_lng,
            dv.id AS vehicle_id, dv.registration_number, dv.vehicle_model, dv.status AS vehicle_status,
            vt.id AS vehicle_type_id, vt.name AS vehicle_name, vt.capacity AS max_weight
        FROM users u
        JOIN driver_vehicles dv ON u.id = dv.driver_id
        JOIN vehicle_types vt ON dv.vehicle_type_id = vt.id
        WHERE u.role = 'merchant partner' -- Currently everyone is a merchant partner based on previous requests
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
