import 'dotenv/config';
import pool from './src/config/db.js';

async function run() {
    try {
        console.log('Connecting to DB and deleting first 10 rows...');
        const [result] = await pool.query('DELETE FROM vehicle_types ORDER BY id ASC LIMIT 10');
        console.log(`Deleted ${result.affectedRows} rows from vehicle_types.`);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
run();
