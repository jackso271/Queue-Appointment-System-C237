const db = require('../config/database');

async function getAppointmentsByStatus() {
    const sql = `
        SELECT
            status,
            COUNT(*) AS total
        FROM appointments
        GROUP BY status
        ORDER BY status
    `;

    const [rows] = await db.execute(sql);
    return rows;
}

async function getAppointmentsByService() {
    const sql = `
        SELECT
            s.serviceID,
            s.serviceName,
            COUNT(a.appointmentID) AS totalAppointments
        FROM services s
        LEFT JOIN appointments a
            ON s.serviceID = a.serviceID
        GROUP BY
            s.serviceID,
            s.serviceName
        ORDER BY totalAppointments DESC
    `;

    const [rows] = await db.execute(sql);
    return rows;
}

async function getFeedbackSummary() {
    const sql = `
        SELECT
            COUNT(*) AS totalFeedback,
            COALESCE(AVG(rating), 0) AS averageRating,
            MIN(rating) AS lowestRating,
            MAX(rating) AS highestRating
        FROM feedback
    `;

    const [rows] = await db.execute(sql);
    return rows[0];
}

async function getMonthlyAppointments() {
    const sql = `
        SELECT
            DATE_FORMAT(appointmentDate, '%Y-%m') AS reportMonth,
            COUNT(*) AS totalAppointments
        FROM appointments
        GROUP BY DATE_FORMAT(appointmentDate, '%Y-%m')
        ORDER BY reportMonth DESC
    `;

    const [rows] = await db.execute(sql);
    return rows;
}

module.exports = {
    getAppointmentsByStatus,
    getAppointmentsByService,
    getFeedbackSummary,
    getMonthlyAppointments
};