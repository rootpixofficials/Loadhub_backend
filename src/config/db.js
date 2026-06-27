import pg from 'pg';

const { Pool } = pg;

// Create a new pool using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Function to test the connection when server starts
export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to the PostgreSQL database');
        client.release(); // release the client back to the pool
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        // Depending on your need, you might want to process.exit(1) here 
        // if the app cannot run without a database connection.
    }
};

export default pool;
