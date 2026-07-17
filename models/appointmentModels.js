const db = require('../config/db');

const Appointment = {
    // 1. Fetch all appointments
    getAll: (callback) => {
        const sql = 'SELECT * FROM appointments ORDER BY appointment_date, appointment_time';
        db.query(sql, callback);
    },

    // 2. Insert a new appointment
    create: (data, callback) => {
        const sql = `INSERT INTO appointments (customer_name, customer_email, appointment_date, appointment_time, notes) 
                     VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [data.customer_name, data.customer_email, data.appointment_date, data.appointment_time, data.notes], callback);
    },

    // 3. Find one specific appointment by its ID
    getById: (id, callback) => {
        const sql = 'SELECT * FROM appointments WHERE id = ?';
        db.query(sql, [id], callback);
    },

    // 4. Update an existing appointment
    update: (id, data, callback) => {
        const sql = `UPDATE appointments 
                     SET customer_name = ?, customer_email = ?, appointment_date = ?, appointment_time = ?, notes = ? 
                     WHERE id = ?`;
        db.query(sql, [data.customer_name, data.customer_email, data.appointment_date, data.appointment_time, data.notes, id], callback);
    },

    // 5. Delete an appointment
    cancel: (id, callback) => {
        const sql = `UPDATE appointments SET status = 'cancelled' WHERE id = ?`;
        db.query(sql, [id], callback);
    }
};

module.exports = Appointment;