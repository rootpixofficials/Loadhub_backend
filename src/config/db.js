import mysql from 'mysql2/promise';

// Create a new pool using environment variables
const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to test the connection when server starts
export const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to the MySQL database');
        connection.release(); // release the connection back to the pool
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        // Depending on your need, you might want to process.exit(1) here 
        // if the app cannot run without a database connection.
    }
};

export default pool;
