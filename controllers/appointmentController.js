const Appointment = require('../models/appointmentModel');

// GET / -> Show all appointments on dashboard
exports.getAllAppointments = (req, res) => {
    Appointment.getAll((err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.render('index', { appointments: results });
    });
};

// GET /book -> Render the blank booking form
exports.showBookForm = (req, res) => {
    res.render('book');
};

// POST /book -> Process the form submission data
exports.createAppointment = (req, res) => {
    Appointment.create(req.body, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving appointment');
        }
        res.redirect('/');
    });
};

// GET /edit/:id -> Grab target data and render the pre-filled edit form
exports.showEditForm = (req, res) => {
    const id = req.params.id;
    Appointment.getById(id, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(404).send('Appointment not found');
        }
        res.render('edit', { appointment: results[0] });
    });
};

// POST /edit/:id -> Process the changes made to an appointment
exports.updateAppointment = (req, res) => {
    const id = req.params.id;
    Appointment.update(id, req.body, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating appointment');
        }
        res.redirect('/');
    });
};

// POST /delete/:id -> Remove an appointment
exports.deleteAppointment = (req, res) => {
    const id = req.params.id;
    Appointment.delete(id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting appointment');
        }
        res.redirect('/');
    });
};

exports.cancelAppointment = (req, res) => {
    const id = req.params.id;
    Appointment.cancel(id, (err, result) => {
        if (err) return res.status(500).send('Error canceling appointment');
        res.redirect('/'); // Refresh dashboard
    });
};