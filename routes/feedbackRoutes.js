const express = require('express');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// Display all feedback
router.get('/', feedbackController.displayFeedback);

// Display feedback submission form
router.get('/add/:appointmentID', feedbackController.displayAddFeedback);

// Submit feedback
router.post('/add/:appointmentID', feedbackController.createFeedback);

router.get(
    "/add/:appointmentID",
    feedbackController.displayAddFeedback
);

router.post(
    "/add/:appointmentID",
    feedbackController.createFeedback
);

// Display one feedback entry
router.get('/:feedbackID', feedbackController.displayFeedbackDetails);

// Display edit form
router.get('/:feedbackID/edit', feedbackController.displayEditFeedback);

// Update feedback
router.post('/:feedbackID/edit', feedbackController.updateFeedback);

// Delete feedback
router.post('/:feedbackID/delete', feedbackController.deleteFeedback);

module.exports = router;