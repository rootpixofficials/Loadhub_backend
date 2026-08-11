import pool from '../config/db.js';

export const initDriverVehicleTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS driver_vehicles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id INT NOT NULL,
            vehicle_type_id INT NOT NULL,
            registration_number VARCHAR(100) NOT NULL,
            vehicle_model VARCHAR(255) NOT NULL,
            insurance_certificate VARCHAR(255),
            rc_certificate VARCHAR(255),
            per_km_rate DECIMAL(10, 2),
            location VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            is_active VARCHAR(50) DEFAULT 'offline',
            status VARCHAR(50) DEFAULT 'pending',
            basic_location VARCHAR(255),
            basic_latitude DECIMAL(10, 8),
            basic_longitude DECIMAL(11, 8),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Driver Vehicles table initialized');
        
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN per_km_rate DECIMAL(10,2);'); } catch (e) {}
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN location VARCHAR(255);'); } catch (e) {}
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN latitude DECIMAL(10,8);'); } catch (e) {}
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN longitude DECIMAL(11,8);'); } catch (e) {}
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN is_active VARCHAR(50) DEFAULT "offline";'); } catch (e) {}
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN basic_location VARCHAR(255);'); } catch (e) {}
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN basic_latitude DECIMAL(10,8);'); } catch (e) {}
        try { await pool.query('ALTER TABLE driver_vehicles ADD COLUMN basic_longitude DECIMAL(11,8);'); } catch (e) {}
        console.log('✅ Ensured all new columns exist in driver_vehicles');
    } catch (err) {
        console.error('❌ Error initializing Driver Vehicles table:', err.message);
    }
};

export const addDriverVehicle = async (data) => {
    const { 
        driver_id, vehicle_type_id, registration_number, 
        vehicle_model, insurance_valid_until, insurance_certificate, rc_certificate, per_km_rate,
        location, latitude, longitude, status, basic_location, basic_latitude, basic_longitude
    } = data;

    const query = `
        INSERT INTO driver_vehicles (
            driver_id, vehicle_type_id, registration_number, 
            vehicle_model, insurance_valid_until, insurance_certificate, rc_certificate, per_km_rate,
            location, latitude, longitude, status, basic_location, basic_latitude, basic_longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        driver_id, vehicle_type_id, registration_number, 
        vehicle_model, insurance_valid_until || null, 
        insurance_certificate || null, rc_certificate || null, per_km_rate || null,
        location || null, latitude || null, longitude || null, status || 'pending',
        basic_location || null, basic_latitude || null, basic_longitude || null
    ];
    
    try {
        const [result] = await pool.query(query, values);
        const [rows] = await pool.query('SELECT * FROM driver_vehicles WHERE id = ?', [result.insertId]);
        return rows[0];
    } catch (err) {
        throw err;
    }
};

export const getVehiclesByDriverId = async (driver_id) => {
    const query = `SELECT * FROM driver_vehicles WHERE driver_id = ? ORDER BY id DESC;`;
    const [rows] = await pool.query(query, [driver_id]);
    return rows;
};

export const updateDriverVehicle = async (id, updateData) => {
    const { 
        vehicle_type_id, registration_number, vehicle_model, 
        insurance_valid_until, insurance_certificate, rc_certificate, per_km_rate, status,
        location, latitude, longitude, basic_location, basic_latitude, basic_longitude
    } = updateData;

    const query = `
        UPDATE driver_vehicles 
        SET vehicle_type_id = COALESCE(?, vehicle_type_id),
            registration_number = COALESCE(?, registration_number),
            vehicle_model = COALESCE(?, vehicle_model),
            insurance_valid_until = COALESCE(?, insurance_valid_until),
            insurance_certificate = COALESCE(?, insurance_certificate),
            rc_certificate = COALESCE(?, rc_certificate),
            per_km_rate = COALESCE(?, per_km_rate),
            location = COALESCE(?, location),
            latitude = COALESCE(?, latitude),
            longitude = COALESCE(?, longitude),
            status = COALESCE(?, status),
            basic_location = COALESCE(?, basic_location),
            basic_latitude = COALESCE(?, basic_latitude),
            basic_longitude = COALESCE(?, basic_longitude)
        WHERE id = ?
    `;
    
    await pool.query(query, [
        vehicle_type_id || null, registration_number || null, 
        vehicle_model || null, insurance_valid_until || null, 
        insurance_certificate || null, rc_certificate || null, 
        per_km_rate || null, location || null, latitude || null, longitude || null, status || null, 
        basic_location || null, basic_latitude || null, basic_longitude || null, id
    ]);
    
    const [rows] = await pool.query('SELECT * FROM driver_vehicles WHERE id = ?', [id]);
    return rows[0];
};

export const deleteDriverVehicle = async (id) => {
    const query = `DELETE FROM driver_vehicles WHERE id = ?;`;
    await pool.query(query, [id]);
};

export const updateVehicleActiveStatus = async (id, is_active) => {
    const query = `
        UPDATE driver_vehicles 
        SET is_active = ?
        WHERE id = ?
    `;
    await pool.query(query, [is_active, id]);
    const [rows] = await pool.query('SELECT * FROM driver_vehicles WHERE id = ?', [id]);
    return rows[0];
};

export const updateVehicleLocation = async (id, latitude, longitude, location) => {
    const query = `
        UPDATE driver_vehicles 
        SET latitude = ?, longitude = ?, location = COALESCE(?, location)
        WHERE id = ?
    `;
    await pool.query(query, [latitude, longitude, location || null, id]);
    const [rows] = await pool.query('SELECT * FROM driver_vehicles WHERE id = ?', [id]);
    return rows[0];
};
