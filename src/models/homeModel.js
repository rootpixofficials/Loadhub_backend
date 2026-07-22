import pool from '../config/db.js';

export const fetchData = async () => {
    // This is where you write your SQL queries.
    // Example: Fetching all rows from a hypothetical 'users' table
    
    // const query = 'SELECT * FROM users';
    // const [rows] = await pool.query(query);
    // return rows;

    // For now, returning mock data since the table might not exist yet
    return [
        { id: 1, name: 'Item 1 from DB Model' },
        { id: 2, name: 'Item 2 from DB Model' }
    ];
};
