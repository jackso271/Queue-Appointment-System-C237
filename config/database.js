require('dotenv').config();

const mysql = require('mysql2/promise');

const sslOption = process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'c237_001_teamaplus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: sslOption
});

module.exports = pool;

