const pool = require('../database');

// ------------------------------------------------------------------
// 1. Create a new customer account
// ------------------------------------------------------------------
async function createUser(fullName, email, hashedPassword, phone) {
  const [result] = await pool.query(
    `INSERT INTO Users (fullName, email, password, phone, role)
     VALUES (?, ?, ?, ?, 'Customer')`,
    [fullName, email, hashedPassword, phone]
  );
  return result.insertId;
}

// ------------------------------------------------------------------
// 2. Read a user by email (used during login + duplicate-email check)
// ------------------------------------------------------------------
async function getUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM Users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

// ------------------------------------------------------------------
// 3. Read a user by ID (used during session validation)
// ------------------------------------------------------------------
async function getUserById(userID) {
  const [rows] = await pool.query(
    `SELECT userID, fullName, email, phone, role, accountStatus
     FROM Users
     WHERE userID = ?`,
    [userID]
  );
  return rows[0] || null;
}

// ------------------------------------------------------------------
// 4. Update the user's hashed password
// ------------------------------------------------------------------
async function updatePassword(userID, newHashedPassword) {
  const [result] = await pool.query(
    'UPDATE Users SET password = ? WHERE userID = ?',
    [newHashedPassword, userID]
  );
  return result.affectedRows === 1;
}

// ------------------------------------------------------------------
// 5. Update the user's profile information
// ------------------------------------------------------------------
async function updateProfile(userID, fullName, phone) {
  const [result] = await pool.query(
    'UPDATE Users SET fullName = ?, phone = ? WHERE userID = ?',
    [fullName, phone, userID]
  );
  return result.affectedRows === 1;
}

// ------------------------------------------------------------------
// 6. Read the user's role and account status (used for authorization)
// ------------------------------------------------------------------
async function getRoleAndStatus(userID) {
  const [rows] = await pool.query(
    'SELECT role, accountStatus FROM Users WHERE userID = ?',
    [userID]
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
