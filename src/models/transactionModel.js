import pool from '../config/db.js';

export const initTransactionTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            trip_id INT NOT NULL,
            payment_type VARCHAR(50),
            amount DECIMAL(10, 2),
            status VARCHAR(50) DEFAULT 'Processing',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_trip_transaction (trip_id)
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Transactions table initialized');
    } catch (err) {
        console.error('❌ Error initializing Transactions table:', err.message);
    }
};

export const upsertTransaction = async (data) => {
    const { trip_id, payment_type, amount, status } = data;

    const query = `
        INSERT INTO transactions (trip_id, payment_type, amount, status)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            payment_type = VALUES(payment_type), 
            amount = VALUES(amount), 
            status = VALUES(status)
    `;
    
    await pool.query(query, [trip_id, payment_type || null, amount || 0, status || 'Processing']);
    const [rows] = await pool.query('SELECT * FROM transactions WHERE trip_id = ?', [trip_id]);
    return rows[0];
};

export const getDriverEarnings = async (driver_id) => {
    // 1. Get Aggregated Stats
    const statsQuery = `
        SELECT 
            COALESCE(SUM(CASE WHEN tx.status = 'Paid' THEN tx.amount ELSE 0 END), 0) AS total_wallet_balance,
            COALESCE(SUM(CASE WHEN tx.status = 'Paid' AND tx.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN tx.amount ELSE 0 END), 0) AS this_week_earnings,
            COUNT(DISTINCT CASE WHEN t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN t.id END) AS this_month_trips
        FROM trips t
        LEFT JOIN transactions tx ON t.id = tx.trip_id
        WHERE t.driver_id = ?
    `;
    
    const [statsRows] = await pool.query(statsQuery, [driver_id]);
    const stats = statsRows[0];

    // 2. Get Recent Payouts
    const payoutsQuery = `
        SELECT 
            t.pickup_location, t.drop_location, 
            CONCAT('LOAD-', t.id) AS formatted_trip_id, 
            tx.created_at, tx.amount, tx.status
        FROM trips t
        JOIN transactions tx ON t.id = tx.trip_id
        WHERE t.driver_id = ?
        ORDER BY tx.created_at DESC
        LIMIT 10
    `;
    
    const [payoutRows] = await pool.query(payoutsQuery, [driver_id]);

    return {
        total_wallet_balance: parseFloat(stats.total_wallet_balance).toFixed(2),
        this_week_earnings: parseFloat(stats.this_week_earnings).toFixed(2),
        this_month_trips: stats.this_month_trips,
        recent_payouts: payoutRows
    };
};
