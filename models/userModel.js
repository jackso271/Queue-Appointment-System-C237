const pool = require('../config/database');

// ------------------------------------------------------------------
// 1. Create a new customer account
// ------------------------------------------------------------------
async function createUser(username, email, hashedPassword, address, contact) {
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password, address, contact, role)
     VALUES (?, ?, ?, ?, ?, 'Customer')`,
    [username, email, hashedPassword, address, contact]
  );
  return result.insertId;
}

// ------------------------------------------------------------------
// 2. Read a user by email (used during login + duplicate-email check)
// ------------------------------------------------------------------
async function getUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

// ------------------------------------------------------------------
// 3. Read a user by ID (used during session validation)
// ------------------------------------------------------------------
async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, username, email, address, contact, role, accountStatus
     FROM users
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

// ------------------------------------------------------------------
// 4. Update the user's hashed password
// ------------------------------------------------------------------
async function updatePassword(id, newHashedPassword) {
  const [result] = await pool.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [newHashedPassword, id]
  );
  return result.affectedRows === 1;
}

// ------------------------------------------------------------------
// 5. Update the user's profile information
// ------------------------------------------------------------------
async function updateProfile(id, username, address, contact) {
  const [result] = await pool.query(
    'UPDATE users SET username = ?, address = ?, contact = ? WHERE id = ?',
    [username, address, contact, id]
  );
  return result.affectedRows === 1;
}

// ------------------------------------------------------------------
// 6. Read the user's role and account status (used for authorization)
// ------------------------------------------------------------------
async function getRoleAndStatus(id) {
  const [rows] = await pool.query(
    'SELECT role, accountStatus FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updatePassword,
  updateProfile,
  getRoleAndStatus
};