import pool from '../config/db.js';

// Initialize the users table if it doesn't exist
export const initUserTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            company_name VARCHAR(255),
            mobile_number VARCHAR(20) NOT NULL,
            email VARCHAR(255),
            role VARCHAR(50) DEFAULT 'merchant partner',
            current_lat DECIMAL(10, 8),
            current_lng DECIMAL(11, 8),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_mobile_role (mobile_number, role)
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Users table initialized');
        
        // Safely add columns if they don't exist
        try {
            await pool.query('ALTER TABLE users ADD COLUMN current_lat DECIMAL(10, 8);');
            await pool.query('ALTER TABLE users ADD COLUMN current_lng DECIMAL(11, 8);');
            console.log('✅ Added location columns to users table');
        } catch (e) {
            // Ignore if columns already exist
        }

        try {
            // Attempt to drop the default UNIQUE constraint created on just mobile_number
            await pool.query('ALTER TABLE users DROP INDEX mobile_number;');
            console.log('✅ Dropped old unique constraint on mobile_number');
        } catch (e) {}
        
        try {
            // Attempt to add the composite unique constraint
            await pool.query('ALTER TABLE users ADD UNIQUE KEY unique_mobile_role (mobile_number, role);');
            console.log('✅ Added composite unique constraint on (mobile_number, role)');
        } catch (e) {}

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

export const getUserByMobileAndRole = async (mobile_number, role) => {
    const query = `SELECT * FROM users WHERE mobile_number = ? AND role = ?;`;
    const [rows] = await pool.query(query, [mobile_number, role]);
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

export const getUserById = async (id) => {
    const query = `
        SELECT 
            u.*,
            (SELECT COUNT(*) FROM trips t WHERE t.user_id = u.id) AS trips_posted,
            COALESCE((SELECT SUM(price) FROM trips t WHERE t.user_id = u.id), 0) AS total_spend,
            5.0 AS average_rating
        FROM users u
        WHERE u.id = ?;
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

export const deleteUser = async (id) => {
    const query = `DELETE FROM users WHERE id = ?;`;
    await pool.query(query, [id]);
};

export const updateUserLocation = async (id, lat, lng) => {
    const query = `
        UPDATE users 
        SET current_lat = ?, current_lng = ?
        WHERE id = ?
    `;
    await pool.query(query, [lat, lng, id]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};
