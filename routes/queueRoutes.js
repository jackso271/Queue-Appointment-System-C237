const express = require('express');
const queueController = require('../controllers/queueController');
const { ensureAuthenticated, ensureCustomer, ensureAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Customer routes — must be logged in as a Customer with an active account
router.post('/queue/check-in/:appointmentID', ensureAuthenticated, ensureCustomer, queueController.checkIn);
router.get('/queue/status/:appointmentID', ensureAuthenticated, ensureCustomer, queueController.customerQueueStatus);

// Admin routes — must be logged in as an Admin with an active account
router.get('/queue/admin', ensureAuthenticated, ensureAdmin, queueController.adminQueue);
router.post('/queue/admin/:queueID/serving', ensureAuthenticated, ensureAdmin, queueController.markAsServing);
router.post('/queue/admin/:queueID/completed', ensureAuthenticated, ensureAdmin, queueController.markAsCompleted);
router.post('/queue/admin/:queueID/cancel', ensureAuthenticated, ensureAdmin, queueController.cancelQueue);

module.exports = router;