const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true, 
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection silently
db.getConnection((err, connection) => {
    if (err) console.error('Database connection failed:', err.message);
    else {
        console.log('Connected to Azure MySQL Pool successfully.');
        connection.release();
    }
});

module.exports = db;