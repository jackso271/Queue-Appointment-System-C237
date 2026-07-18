// Run with: node check-schema.js
// Prints every table name, then the full column list for each one.
// Uses your existing pool — no separate MySQL client needed.

const pool = require('./config/database');

async function main() {
  const [tables] = await pool.query('SHOW TABLES');
  const tableKey = Object.keys(tables[0] || {})[0];

  if (!tables.length) {
    console.log('No tables found in this database.');
    process.exit(0);
  }

  for (const row of tables) {
    const tableName = row[tableKey];
    console.log(`\n=== ${tableName} ===`);
    const [columns] = await pool.query(`DESCRIBE \`${tableName}\``);
    columns.forEach(col => {
      console.log(`  ${col.Field}  (${col.Type})  ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? '[' + col.Key + ']' : ''}`);
    });
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Schema check failed:', err);
  process.exit(1);
});