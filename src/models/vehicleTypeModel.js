import pool from '../config/db.js';

export const initVehicleTypeTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS vehicle_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            capacity VARCHAR(255) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Vehicle Types table initialized');
    } catch (err) {
        console.error('❌ Error initializing Vehicle Types table:', err.message);
    }
};

export const createVehicleType = async (data) => {
    const { name, capacity, description, image_url } = data;
    const query = `
        INSERT INTO vehicle_types (name, capacity, description, image_url)
        VALUES (?, ?, ?, ?)
    `;
    const values = [name, capacity, description, image_url];
    
    try {
        const [result] = await pool.query(query, values);
        const [rows] = await pool.query('SELECT * FROM vehicle_types WHERE id = ?', [result.insertId]);
        return rows[0];
    } catch (err) {
        throw err;
    }
};

export const getAllVehicleTypes = async () => {
    const query = `SELECT * FROM vehicle_types WHERE is_active = true ORDER BY id ASC;`;
    const [rows] = await pool.query(query);
    return rows;
};
