import pool from '../config/db.js';

export const initDriverKycTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS driver_kyc (
            id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id INT NOT NULL UNIQUE,
            aadhaar_number VARCHAR(100),
            aadhaar_image VARCHAR(255),
            pan_number VARCHAR(100),
            pan_image VARCHAR(255),
            license_number VARCHAR(100),
            license_expiry VARCHAR(100),
            license_image VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Driver KYC table initialized');
    } catch (err) {
        console.error('❌ Error initializing Driver KYC table:', err.message);
    }
};

export const addDriverKyc = async (data) => {
    const { 
        driver_id, aadhaar_number, aadhaar_image, pan_number, 
        pan_image, license_number, license_expiry, license_image, status 
    } = data;

    const query = `
        INSERT INTO driver_kyc (
            driver_id, aadhaar_number, aadhaar_image, pan_number, 
            pan_image, license_number, license_expiry, license_image, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        driver_id, aadhaar_number || null, aadhaar_image || null, 
        pan_number || null, pan_image || null, license_number || null, 
        license_expiry || null, license_image || null, status || 'pending'
    ];
    
    try {
        const [result] = await pool.query(query, values);
        const [rows] = await pool.query('SELECT * FROM driver_kyc WHERE id = ?', [result.insertId]);
        return rows[0];
    } catch (err) {
        throw err;
    }
};

export const getKycByDriverId = async (driver_id) => {
    const query = `SELECT * FROM driver_kyc WHERE driver_id = ?;`;
    const [rows] = await pool.query(query, [driver_id]);
    return rows[0];
};

export const updateDriverKyc = async (driver_id, updateData) => {
    const { 
        aadhaar_number, aadhaar_image, pan_number, 
        pan_image, license_number, license_expiry, license_image, status 
    } = updateData;

    const query = `
        UPDATE driver_kyc 
        SET aadhaar_number = COALESCE(?, aadhaar_number),
            aadhaar_image = COALESCE(?, aadhaar_image),
            pan_number = COALESCE(?, pan_number),
            pan_image = COALESCE(?, pan_image),
            license_number = COALESCE(?, license_number),
            license_expiry = COALESCE(?, license_expiry),
            license_image = COALESCE(?, license_image),
            status = COALESCE(?, status)
        WHERE driver_id = ?
    `;
    
    await pool.query(query, [
        aadhaar_number || null, aadhaar_image || null, pan_number || null, 
        pan_image || null, license_number || null, license_expiry || null, 
        license_image || null, status || null, driver_id
    ]);
    
    const [rows] = await pool.query('SELECT * FROM driver_kyc WHERE driver_id = ?', [driver_id]);
    return rows[0];
};
