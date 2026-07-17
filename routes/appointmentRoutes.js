const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Map clean paths directly to their controller actions
router.get('/', appointmentController.getAllAppointments);
router.get('/book', appointmentController.showBookForm);
router.post('/book', appointmentController.createAppointment);
router.get('/edit/:id', appointmentController.showEditForm);
router.post('/edit/:id', appointmentController.updateAppointment);
router.post('/delete/:id', appointmentController.deleteAppointment);
router.post('/cancel/:id', appointmentController.cancelAppointment);

module.exports = router;