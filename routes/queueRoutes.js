const express = require('express');
const queueController = require('../controllers/queueController');

const router = express.Router();

// TODO: Add customer authentication middleware here when the authentication feature is ready.
router.post('/queue/check-in/:appointmentID', queueController.checkIn);
router.get('/queue/status/:appointmentID', queueController.customerQueueStatus);

// TODO: Add administrator authorization middleware here when the authorization feature is ready.
// These routes are functional but not secure until administrator middleware is integrated.
router.get('/queue/admin', queueController.adminQueue);
router.post('/queue/admin/:queueID/serving', queueController.markAsServing);
router.post('/queue/admin/:queueID/completed', queueController.markAsCompleted);
router.post('/queue/admin/:queueID/cancel', queueController.cancelQueue);

module.exports = router;

