const db = require('../config/database');

async function getUserByEmail(email) {
  const sql = `
    SELECT userID, fullName, email, password, phone, role, accountStatus
    FROM Users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [email]);
  return rows[0] || null;
}

async function getUserById(userId) {
  const sql = `
    SELECT userID, fullName, email, phone, role, accountStatus
    FROM Users
    WHERE userID = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [userId]);
  return rows[0] || null;
}

async function createUser(fullName, email, hashedPassword, phone) {
  const sql = `
    INSERT INTO Users
        (fullName, email, password, phone, role, accountStatus)
    VALUES
        (?, ?, ?, ?, 'Customer', 'Active')
  `;

  const [result] = await db.execute(sql, [fullName, email, hashedPassword, phone]);
  return result.insertId;
}

async function updatePassword(userId, hashedPassword) {
  const sql = `
    UPDATE Users
    SET password = ?
    WHERE userID = ?
  `;

  const [result] = await db.execute(sql, [hashedPassword, userId]);
  return result.affectedRows === 1;
}

async function updateProfile(userId, fullName, phone) {
  const sql = `
    UPDATE Users
    SET fullName = ?, phone = ?
    WHERE userID = ?
  `;

  const [result] = await db.execute(sql, [fullName, phone, userId]);
  return result.affectedRows === 1;
}

async function getRoleAndStatus(userId) {
  const sql = `
    SELECT role, accountStatus
    FROM Users
    WHERE userID = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [userId]);
  return rows[0] || null;
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updatePassword,
  updateProfile,
  getRoleAndStatus
};
