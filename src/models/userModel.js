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
            role VARCHAR(50) DEFAULT 'merchant partner',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Users table initialized');

        const tempQuery = `
            CREATE TABLE IF NOT EXISTS temp_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                mobile_number VARCHAR(20) UNIQUE NOT NULL,
                otp VARCHAR(10) NOT NULL,
                user_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(tempQuery);
        console.log('✅ Temp Users table initialized');
    } catch (err) {
        console.error('❌ Error initializing tables:', err.message);
    }
};

export const createUser = async (userData) => {
    const { full_name, company_name, mobile_number, email, role } = userData;
    const query = `
        INSERT INTO users (full_name, company_name, mobile_number, email, role)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [full_name, company_name, mobile_number, email, role || 'merchant partner'];
    
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

export const createTempUser = async (userData, otp) => {
    const { mobile_number } = userData;
    // Use REPLACE to overwrite if the user requests a new OTP
    const query = `
        REPLACE INTO temp_users (mobile_number, otp, user_data)
        VALUES (?, ?, ?)
    `;
    await pool.query(query, [mobile_number, otp, JSON.stringify(userData)]);
};

export const getTempUserByMobile = async (mobile_number) => {
    const query = `SELECT * FROM temp_users WHERE mobile_number = ?;`;
    const [rows] = await pool.query(query, [mobile_number]);
    return rows[0];
};

export const deleteTempUser = async (mobile_number) => {
    const query = `DELETE FROM temp_users WHERE mobile_number = ?;`;
    await pool.query(query, [mobile_number]);
};

export const updateUser = async (id, updateData) => {
    const { full_name, company_name, email } = updateData;
    const query = `
        UPDATE users 
        SET full_name = COALESCE(?, full_name),
            company_name = COALESCE(?, company_name),
            email = COALESCE(?, email)
        WHERE id = ?
    `;
    
    await pool.query(query, [full_name || null, company_name || null, email || null, id]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};
