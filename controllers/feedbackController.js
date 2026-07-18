const feedbackModel = require('../models/feedbackModel');

// Temporary authentication until login module is ready
function getAuthenticatedUserId(req) {
    return 1;
}

// ==============================
// Display all feedback
// ==============================
async function displayFeedback(req, res) {
    try {
        const feedback = await feedbackModel.getAllFeedback();

        res.render('feedback/feedbackList', {
            feedback
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Unable to retrieve feedback.");
    }
}

// ==============================
// Display Add Feedback Form
// ==============================
async function displayAddFeedback(req, res) {

    try {

        const appointmentID = req.params.appointmentID;

        res.render('feedback/addFeedback', {
            appointmentID
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Unable to load page.");

    }

}

// ==============================
// Create Feedback
// ==============================
async function createFeedback(req, res) {

    try {

        const userID = getAuthenticatedUserId(req);

        const appointmentID = req.params.appointmentID;

        const rating = req.body.rating;

        const comments = req.body.comments;

        await feedbackModel.createFeedback({

            appointmentID,

            userID,

            rating,

            comments

        });

        res.redirect('/feedback');

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Unable to submit feedback.");

    }

}

// ==============================
// Display one feedback
// ==============================
async function displayFeedbackDetails(req, res) {

    try {

        const feedbackID = req.params.feedbackID;

        const feedback = await feedbackModel.getFeedbackById(feedbackID);

        if (!feedback) {

            return res.status(404).send("Feedback not found.");

        }

        res.render('feedback/feedbackDetails', {

            feedback

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Unable to load feedback.");

    }

}

// ==============================
// Display Edit Form
// ==============================
async function displayEditFeedback(req, res) {

    try {

        const feedbackID = req.params.feedbackID;

        const feedback = await feedbackModel.getFeedbackById(feedbackID);

        if (!feedback) {

            return res.status(404).send("Feedback not found.");

        }

        res.render('feedback/editFeedback', {

            feedback

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Unable to load edit page.");

    }

}

// ==============================
// Update Feedback
// ==============================
async function updateFeedback(req, res) {

    try {

        const userID = getAuthenticatedUserId(req);

        const feedbackID = req.params.feedbackID;

        const {

            rating,

            comments

        } = req.body;

        await feedbackModel.updateFeedback(

            feedbackID,

            userID,

            rating,

            comments

        );

        res.redirect('/feedback');

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Unable to update feedback.");

    }

}

// ==============================
// Delete Feedback
// ==============================
async function deleteFeedback(req, res) {

    try {

        const userID = getAuthenticatedUserId(req);

        const feedbackID = req.params.feedbackID;

        await feedbackModel.deleteFeedback(

            feedbackID,

            userID

        );

        res.redirect('/feedback');

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Unable to delete feedback.");

    }

}

module.exports = {

    displayFeedback,

    displayAddFeedback,

    createFeedback,

    displayFeedbackDetails,

    displayEditFeedback,

    updateFeedback,

    deleteFeedback

};