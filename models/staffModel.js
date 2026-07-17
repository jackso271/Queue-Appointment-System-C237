const db = require('../config/database');

/**
 * Gets all staff records.
 * Input: optional search and filter values.
 * Output: a list of matching staff records.
 */
async function getAllStaff(search, position, availabilityStatus) {
    let sql = `
        SELECT *
        FROM staff
        WHERE 1 = 1
    `;

    const values = [];

    // Search using the staff member's name or email.
    if (search) {
        sql += `
            AND (
                fullName LIKE ?
                OR email LIKE ?
            )
        `;

        values.push(`%${search}%`, `%${search}%`);
    }

    // Filter using the staff position.
    if (position) {
        sql += `
            AND position LIKE ?
        `;

        values.push(`%${position}%`);
    }

    // Filter using the availability status.
    if (availabilityStatus) {
        sql += `
            AND availabilityStatus = ?
        `;

        values.push(availabilityStatus);
    }

    sql += `
        ORDER BY fullName
    `;

    const [rows] = await db.execute(sql, values);
    return rows;
}

/**
 * Finds one staff member by staff ID.
 * Input: staffID.
 * Output: one staff record if found, otherwise null.
 */
async function findById(staffID) {
    const sql = `
        SELECT *
        FROM staff
        WHERE staffID = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [staffID]);
    return rows[0] || null;
}

/**
 * Checks whether a staff email already exists.
 * Input: email and optional staffID to exclude.
 * Output: true when the email exists, otherwise false.
 */
async function emailExists(email, excludedStaffID = null) {
    let sql = `
        SELECT staffID
        FROM staff
        WHERE email = ?
    `;

    const values = [email];

    // Ignore the current staff member when editing.
    if (excludedStaffID) {
        sql += `
            AND staffID != ?
        `;

        values.push(excludedStaffID);
    }

    sql += `
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, values);
    return rows.length > 0;
}

/**
 * Creates a new staff record.
 * Input: staff form data.
 * Output: the inserted staff record ID.
 */
async function createStaff(staffData) {
    const sql = `
        INSERT INTO staff (
            fullName,
            email,
            phone,
            position,
            availabilityStatus
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        staffData.fullName,
        staffData.email,
        staffData.phone || null,
        staffData.position,
        staffData.availabilityStatus
    ];

    const [result] = await db.execute(sql, values);
    return result.insertId;
}

/**
 * Updates an existing staff record.
 * Input: staffID and updated staff form data.
 * Output: true when one record was updated.
 */
async function updateStaff(staffID, staffData) {
    const sql = `
        UPDATE staff
        SET
            fullName = ?,
            email = ?,
            phone = ?,
            position = ?,
            availabilityStatus = ?
        WHERE staffID = ?
    `;

    const values = [
        staffData.fullName,
        staffData.email,
        staffData.phone || null,
        staffData.position,
        staffData.availabilityStatus,
        staffID
    ];

    const [result] = await db.execute(sql, values);
    return result.affectedRows === 1;
}

/**
 * Deletes an unavailable staff record.
 * Input: staffID.
 * Output: true when one record was deleted.
 */
async function deleteStaff(staffID) {
    const sql = `
        DELETE FROM staff
        WHERE staffID = ?
        AND availabilityStatus = 'Unavailable'
    `;

    const [result] = await db.execute(sql, [staffID]);
    return result.affectedRows === 1;
}

module.exports = {
    getAllStaff,
    findById,
    emailExists,
    createStaff,
    updateStaff,
    deleteStaff
};