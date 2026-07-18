const Appointment = require('../models/appointmentModel');

exports.getAllAppointments = (req, res) => {
    Appointment.getAll((err, results) => {
        if (err) return res.status(500).send('Database error');
        res.render('appointments/index', { appointments: results });
    });
};

exports.showBookForm = (req, res) => {
    res.render('appointments/book');
};

exports.createAppointment = (req, res) => {
    // For testing purposes, if you haven't linked auth yet, ensure userID 1 and serviceID 1 exist in your DB!
    const appointmentData = {
        userID: req.body.userID || 1, 
        serviceID: req.body.serviceID || 1,
        staffID: req.body.staffID || null,
        appointmentDate: req.body.appointmentDate,
        appointmentTime: req.body.appointmentTime,
        remarks: req.body.remarks
    };

    Appointment.create(appointmentData, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving appointment. Ensure User ID and Service ID exist.');
        }
        res.redirect('/');
    });
};

exports.showEditForm = (req, res) => {
    const id = req.params.id;
    Appointment.getById(id, (err, results) => {
        if (err) return res.status(500).send('Database error');
        if (results.length === 0) return res.status(404).send('Appointment not found');
        res.render('appointments/edit', { appointment: results[0] });
    });
};

exports.updateAppointment = (req, res) => {
    const id = req.params.id;
    Appointment.update(id, req.body, (err, result) => {
        if (err) return res.status(500).send('Error updating appointment');
        res.redirect('/');
    });
};

exports.cancelAppointment = (req, res) => {
    const id = req.params.id;
    Appointment.cancel(id, (err, result) => {
        if (err) return res.status(500).send('Error canceling appointment');
        res.redirect('/');
    });
};