const db = require('../config/appointmentDB');

const Appointment = {
    // UPDATED: Uses a JOIN to fetch customer data from the users table
    getAll: (callback) => {
        const sql = `
            SELECT 
                a.appointmentID,
                u.fullName AS customer_name,   -- Fetches name from users table
                u.email AS customer_email,     -- Fetches email from users table
                a.appointmentDate,
                a.appointmentTime,
                a.remarks,
                a.status
            FROM appointments a
            LEFT JOIN users u ON a.userID = u.id
            ORDER BY a.appointmentDate, a.appointmentTime
        `;
        db.query(sql, callback);
    },

    // Create
    create: (data, callback) => {
        const sql = `INSERT INTO appointments (userID, serviceID, staffID, appointmentDate, appointmentTime, remarks, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'Pending')`;
        db.query(sql, [data.userID, data.serviceID, data.staffID || null, data.appointmentDate, data.appointmentTime, data.remarks], callback);
    },

    // Get Single Record
    getById: (id, callback) => {
        const sql = 'SELECT * FROM appointments WHERE appointmentID = ?';
        db.query(sql, [id], callback);
    },

    // Update
    update: (id, data, callback) => {
        const sql = `UPDATE appointments 
                     SET appointmentDate = ?, appointmentTime = ?, remarks = ?, status = ? 
                     WHERE appointmentID = ?`;
        db.query(sql, [data.appointmentDate, data.appointmentTime, data.remarks, data.status, id], callback);
    },

    // Soft Delete / Cancel
    cancel: (id, callback) => {
        const sql = "UPDATE appointments SET status = 'Cancelled' WHERE appointmentID = ?";
        db.query(sql, [id], callback);
    }
};

module.exports = Appointment;