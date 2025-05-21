const { Pool } = require('pg');
//require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'department_store1',
    password: 'Post123$',
    port: 5432,
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

// Test the connection
(async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0]);
    } catch (error) {
        console.error('Database connection test failed:', error);
    }
})();

module.exports = pool;
