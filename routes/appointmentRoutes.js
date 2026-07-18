const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/appointments', appointmentController.getAllAppointments);
router.get('/book', appointmentController.showBookForm);
router.post('/book', appointmentController.createAppointment);
router.get('/edit/:id', appointmentController.showEditForm);
router.post('/edit/:id', appointmentController.updateAppointment);

router.post('/cancel/:id', appointmentController.cancelAppointment); 

module.exports = router;