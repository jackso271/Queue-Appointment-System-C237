const db = require('../config/database');

async function getDashboardStatistics() {
    const sql = `
        SELECT
            (SELECT COUNT(*)
             FROM users) AS totalUsers,

            (SELECT COUNT(*)
             FROM services
             WHERE status = 'Available') AS availableServices,

            (SELECT COUNT(*)
             FROM appointments) AS totalAppointments,

            (SELECT COUNT(*)
             FROM appointments
             WHERE status = 'Completed') AS completedAppointments,

            (SELECT COUNT(*)
             FROM queue
             WHERE queueStatus = 'Waiting') AS waitingCustomers,

            (SELECT COUNT(*)
             FROM feedback) AS totalFeedback,

            (SELECT COALESCE(AVG(rating), 0)
             FROM feedback) AS averageRating
    `;

    const [rows] = await db.execute(sql);
    return rows[0];
}

async function getAppointmentStatusBreakdown() {
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

async function getRatingBreakdown() {
    const sql = `
        SELECT
            rating,
            COUNT(*) AS total
        FROM feedback
        GROUP BY rating
        ORDER BY rating
    `;

    const [rows] = await db.execute(sql);
    return rows;
}

async function getRecentFeedback() {
    const sql = `
        SELECT
            f.feedbackID,
            f.rating,
            f.comments,
            f.submittedDate,
            u.username AS customerName,
            s.serviceName
        FROM feedback f
        INNER JOIN users u
            ON f.userID = u.id
        INNER JOIN appointments a
            ON f.appointmentID = a.appointmentID
        INNER JOIN services s
            ON a.serviceID = s.serviceID
        ORDER BY f.submittedDate DESC
        LIMIT 5
    `;

    const [rows] = await db.execute(sql);
    return rows;
}

module.exports = {
    getDashboardStatistics,
    getAppointmentStatusBreakdown,
    getRatingBreakdown,
    getRecentFeedback
};