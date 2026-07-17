const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'c237-eaint-mysql.mysql.database.azure.com', // Replace with your Azure MySQL host
    user: 'c237_001',     
    password: 'c237001@2026!', 
    database: 'c237_001_teamaplus',
    dateStrings: true // Essential for EJS date HTML inputs
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to the Azure MySQL database.');
    
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            notes TEXT
            status VARCHAR(50) DEFAULT 'Booked'
        )
    `;
    db.query(createTableSql, (err) => {
        if (err) console.error('Error creating table:', err.message);
    });
});

module.exports = db;