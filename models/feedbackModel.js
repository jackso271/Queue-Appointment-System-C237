const db = require('../config/database');

/**
 * Creates feedback for a completed appointment.
 */
async function createFeedback(feedbackData) {
    const sql = `
        INSERT INTO feedback (
            appointmentID,
            userID,
            rating,
            comments,
            submittedDate
        )
        VALUES (?, ?, ?, ?, NOW())
    `;

    const values = [
        feedbackData.appointmentID,
        feedbackData.userID,
        feedbackData.rating,
        feedbackData.comments || null
    ];

    const [result] = await db.execute(sql, values);
    return result.insertId;
}

/**
 * Reads all feedback with customer and service information.
 *
 * Important: the current database SQL uses users.id, not users.userID.
 */
async function getAllFeedback() {
    const sql = `
        SELECT
            f.feedbackID,
            f.appointmentID,
            f.userID,
            f.rating,
            f.comments,
            f.submittedDate,
            u.username AS customerName,
            s.serviceName,
            a.appointmentDate,
            a.appointmentTime
        FROM feedback f
        INNER JOIN users u
            ON f.userID = u.id
        INNER JOIN appointments a
            ON f.appointmentID = a.appointmentID
        INNER JOIN services s
            ON a.serviceID = s.serviceID
        ORDER BY f.submittedDate DESC
    `;

    const [rows] = await db.execute(sql);
    return rows;
}

/**
 * Reads one feedback entry.
 */
async function getFeedbackById(feedbackID) {
    const sql = `
        SELECT
            f.feedbackID,
            f.appointmentID,
            f.userID,
            f.rating,
            f.comments,
            f.submittedDate,
            u.fullName AS customerName,
            s.serviceName,
            a.appointmentDate,
            a.appointmentTime
        FROM feedback f
        INNER JOIN users u
            ON f.userID = u.id
        INNER JOIN appointments a
            ON f.appointmentID = a.appointmentID
        INNER JOIN services s
            ON a.serviceID = s.serviceID
        WHERE f.feedbackID = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [feedbackID]);
    return rows[0] || null;
}

/**
 * Checks that the appointment belongs to the customer,
 * is completed and has not already received feedback.
 */
async function getEligibleAppointment(appointmentID, userID) {
    const sql = `
        SELECT
            a.appointmentID,
            a.userID,
            a.status,
            a.appointmentDate,
            a.appointmentTime,
            s.serviceName
        FROM appointments a
        INNER JOIN services s
            ON a.serviceID = s.serviceID
        LEFT JOIN feedback f
            ON a.appointmentID = f.appointmentID
        WHERE a.appointmentID = ?
        AND a.userID = ?
        AND a.status = 'Completed'
        AND f.feedbackID IS NULL
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [
        appointmentID,
        userID
    ]);

    return rows[0] || null;
}

/**
 * Updates feedback belonging to a customer.
 */
async function updateFeedback(
    feedbackID,
    userID,
    rating,
    comments
) {
    const sql = `
        UPDATE feedback
        SET
            rating = ?,
            comments = ?
        WHERE feedbackID = ?
        AND userID = ?
    `;

    const [result] = await db.execute(sql, [
        rating,
        comments || null,
        feedbackID,
        userID
    ]);

    return result.affectedRows === 1;
}

/**
 * Deletes feedback belonging to a customer.
 */
async function deleteFeedback(feedbackID, userID) {
    const sql = `
        DELETE FROM feedback
        WHERE feedbackID = ?
        AND userID = ?
    `;

    const [result] = await db.execute(sql, [
        feedbackID,
        userID
    ]);

    return result.affectedRows === 1;
}
// Get completed appointment eligible for feedback
async function getEligibleAppointment(appointmentID, userID) {
    const sql = `
        SELECT
            a.appointmentID,
            a.userID,
            a.status,
            a.appointmentDate,
            a.appointmentTime,
            s.serviceName,
            f.feedbackID
        FROM appointments a
        INNER JOIN services s
            ON a.serviceID = s.serviceID
        LEFT JOIN feedback f
            ON a.appointmentID = f.appointmentID
        WHERE a.appointmentID = ?
          AND a.userID = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [appointmentID, userID]);
    return rows[0];
}

// Create feedback
async function createFeedback({ appointmentID, userID, rating, comments }) {
    const sql = `
        INSERT INTO feedback (
            appointmentID,
            userID,
            rating,
            comments
        )
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
        appointmentID,
        userID,
        rating,
        comments
    ]);

    return result.insertId;
}

module.exports = {
    createFeedback,
    getAllFeedback,
    getFeedbackById,
    getEligibleAppointment,
    createFeedback,
    updateFeedback,
    deleteFeedback
};