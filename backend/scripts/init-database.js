const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config(); // Load .env file

(async function initDatabase() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Testing database connection...');
        await pool.query('SELECT 1'); // Test connection
        console.log('✅ Connection successful!');

        const sqlFile = await fs.readFile(
            path.join(__dirname, '../config/init_users.sql'),
            'utf8'
        );
        const queries = sqlFile.split(';').filter(q => q.trim());
        for (let query of queries) {
            console.log('Executing query:', query.trim().slice(0, 50) + '...');
            await pool.query(query.trim());
        }

        console.log('✅ Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
