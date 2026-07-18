// Run with: node setup-database.js path/to/DatabaseQueue.sql
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sqlFilePath = process.argv[2];
  if (!sqlFilePath) {
    console.error('Usage: node setup-database.js path/to/file.sql');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.resolve(sqlFilePath), 'utf8');

  const sslOption = process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: true }
    : undefined;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: sslOption
  });

  try {
    await connection.query(sql);
    console.log(`Successfully ran ${sqlFilePath} against ${process.env.DB_NAME}.`);
  } finally {
    await connection.end();
  }
}

main().catch(err => {
  console.error('Schema setup failed:', err.message);
  process.exit(1);
});