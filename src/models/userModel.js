import pool from '../config/db.js';

// Initialize the users table if it doesn't exist
export const initUserTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            company_name VARCHAR(255),
            mobile_number VARCHAR(20) UNIQUE NOT NULL,
            email VARCHAR(255),
            role VARCHAR(50) DEFAULT 'shipper',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Users table initialized');
    } catch (err) {
        console.error('❌ Error initializing users table:', err.message);
    }
};

export const createUser = async (userData) => {
    const { full_name, company_name, mobile_number, email, role } = userData;
    const query = `
        INSERT INTO users (full_name, company_name, mobile_number, email, role)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [full_name, company_name, mobile_number, email, role || 'shipper'];
    
    try {
        const [result] = await pool.query(query, values);
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        return rows[0];
    } catch (err) {
        throw err;
    }
};

export const getUserByMobile = async (mobile_number) => {
    const query = `SELECT * FROM users WHERE mobile_number = ?;`;
    const [rows] = await pool.query(query, [mobile_number]);
    return rows[0];
};
