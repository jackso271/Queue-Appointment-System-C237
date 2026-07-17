const queueModel = require('../models/queueModel');

/**
 * Gets the authenticated customer's user ID after authentication is integrated.
 * Input: Express request object.
 * Output: the authenticated user ID, or null until the auth teammate connects the session.
 */
function getAuthenticatedUserId(req) {
    // TODO: Replace this with the authentication teammate's real session user ID.
    return null;
}

/**
 * Sends a clear response when customer authentication is not connected yet.
 * Input: Express response object.
 * Output: HTTP 403 JSON response.
 */
function sendMissingAuthResponse(res) {
    return res.status(403).render('queue/customer-status', {
        title: 'My Queue Status',
        queueEntry: null,
        customersAhead: null,
        success: null,
        error: 'Queue customer access is blocked until authentication provides a verified user ID.'
    });
}

/**
 * Checks whether a value is a valid positive integer ID.
 * Input: value from route parameters.
 * Output: true when the value is a positive integer, otherwise false.
 */
function isValidId(value) {
    return Number.isInteger(Number(value)) && Number(value) > 0;
}

/**
 * Builds a safe redirect URL with one encoded message.
 * Input: base path, query key and message text.
 * Output: redirect URL with encoded query value.
 */
function redirectWithMessage(res, path, key, message) {
    return res.redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

/**
 * Reads query messages for browser pages.
 * Input: Express request object.
 * Output: success and error message values.
 */
function getPageMessages(req) {
    return {
        success: req.query.success || null,
        error: req.query.error || null
    };
}

/**
 * Counts active queue statuses for the admin summary cards.
 * Input: array of queue entries.
 * Output: total, waiting and serving counts.
 */
function getAdminQueueSummary(queueEntries) {
    return {
        totalActive: queueEntries.length,
        waitingCount: queueEntries.filter((entry) => entry.queueStatus === 'Waiting').length,
        servingCount: queueEntries.filter((entry) => entry.queueStatus === 'Serving').length
    };
}

/**
 * Sends a safe server error without exposing database details.
 * Input: Express response object and short message.
 * Output: HTTP 500 plain response.
 */
function sendServerError(res, message) {
    return res.status(500).type('text/plain').send(message);
}

/**
 * Allows a customer to check in for an approved appointment.
 * Input: appointmentID from route params and authenticated user ID after auth integration.
 * Output: creates a Waiting queue record and redirects or renders a browser response.
 */
async function checkIn(req, res) {
    try {
        const { appointmentID } = req.params;
        const userID = getAuthenticatedUserId(req);

        // Validate route input before querying the database.
        if (!isValidId(appointmentID)) {
            return res.status(400).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: null,
                customersAhead: null,
                success: null,
                error: 'Invalid appointment ID.'
            });
        }

        // Block customer actions until auth integration provides a verified user ID.
        if (!userID) {
            return sendMissingAuthResponse(res);
        }

        // Check that the appointment exists.
        const appointment = await queueModel.findAppointmentForQueue(appointmentID);

        if (!appointment) {
            return res.status(404).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: null,
                customersAhead: null,
                success: null,
                error: 'Appointment not found.'
            });
        }

        // Check that the appointment belongs to the logged-in customer.
        if (Number(appointment.userID) !== Number(userID)) {
            return res.status(403).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: null,
                customersAhead: null,
                success: null,
                error: 'You can only check in for your own appointment.'
            });
        }

        // Allow check-in only when the appointment is approved.
        if (appointment.status !== 'Approved') {
            return res.status(400).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: null,
                customersAhead: null,
                success: null,
                error: 'Only approved appointments can check in.'
            });
        }

        // Prevent duplicate queue records for the same appointment.
        const existingQueue = await queueModel.findByAppointmentId(appointmentID);

        if (existingQueue) {
            const customersAhead = existingQueue.queueStatus === 'Waiting'
                ? await queueModel.countCustomersAhead(existingQueue.queueNumber)
                : 0;

            return res.status(409).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: existingQueue,
                customersAhead,
                success: null,
                error: 'This appointment has already checked in.'
            });
        }

        // Generate the next queue number and create the Waiting queue entry.
        const queueNumber = await queueModel.getNextQueueNumber();
        await queueModel.createQueueEntry(appointmentID, queueNumber);

        return redirectWithMessage(res, `/queue/status/${appointmentID}`, 'success', `Check-in successful. Your queue number is Q${String(queueNumber).padStart(3, '0')}.`);
    } catch (error) {
        console.error('Queue check-in error:', error);
        return sendServerError(res, 'Something went wrong during queue check-in.');
    }
}

/**
 * Shows a customer's queue status for one appointment.
 * Input: appointmentID from route params and authenticated user ID after auth integration.
 * Output: renders the customer queue status page.
 */
async function customerQueueStatus(req, res) {
    try {
        const { appointmentID } = req.params;
        const userID = getAuthenticatedUserId(req);
        const messages = getPageMessages(req);

        // Validate route input before querying the database.
        if (!isValidId(appointmentID)) {
            return res.status(400).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: null,
                customersAhead: null,
                success: null,
                error: 'Invalid appointment ID.'
            });
        }

        // Block customer status viewing until auth integration provides a verified user ID.
        if (!userID) {
            return sendMissingAuthResponse(res);
        }

        // Load only a queue record that belongs to the authenticated customer.
        const queueEntry = await queueModel.getCustomerQueueStatus(appointmentID, userID);

        if (!queueEntry) {
            return res.status(404).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: null,
                customersAhead: null,
                success: messages.success,
                error: 'No queue record was found for this appointment.'
            });
        }

        // Count customers ahead only when the customer is still waiting.
        const customersAhead = queueEntry.queueStatus === 'Waiting'
            ? await queueModel.countCustomersAhead(queueEntry.queueNumber)
            : 0;

        return res.status(200).render('queue/customer-status', {
            title: 'My Queue Status',
            queueEntry,
            customersAhead,
            success: messages.success,
            error: messages.error
        });
    } catch (error) {
        console.error('Customer queue status error:', error);
        return sendServerError(res, 'Something went wrong while loading the queue status.');
    }
}

/**
 * Shows the active queue records for administrators.
 * Input: none.
 * Output: renders the admin queue dashboard.
 */
async function adminQueue(req, res) {
    try {
        // TODO: Add administrator authorization middleware before this controller is used in production.
        const queueEntries = await queueModel.getWaitingQueue();
        const summary = getAdminQueueSummary(queueEntries);
        const messages = getPageMessages(req);

        return res.status(200).render('queue/admin-queue', {
            title: 'Queue Management',
            queueEntries,
            ...summary,
            success: messages.success,
            error: messages.error,
            authWarning: 'Admin queue routes are not secure until administrator middleware is integrated.'
        });
    } catch (error) {
        console.error('Admin queue error:', error);
        return sendServerError(res, 'Something went wrong while loading the admin queue.');
    }
}

/**
 * Changes a queue entry from Waiting to Serving.
 * Input: queueID from route params.
 * Output: HTTP JSON response showing whether the status update succeeded.
 */
async function markAsServing(req, res) {
    try {
        const { queueID } = req.params;

        // TODO: Add administrator authorization middleware before this controller is used in production.
        if (!isValidId(queueID)) {
            return redirectWithMessage(res, '/queue/admin', 'error', 'Invalid queue ID.');
        }

        // Update only if the current status is Waiting.
        const updated = await queueModel.markAsServing(queueID);

        if (!updated) {
            return redirectWithMessage(res, '/queue/admin', 'error', 'Only Waiting queue entries can be marked as Serving.');
        }

        return redirectWithMessage(res, '/queue/admin', 'success', 'Customer has been called.');
    } catch (error) {
        console.error('Mark as Serving error:', error);
        return sendServerError(res, 'Something went wrong while marking the queue entry as Serving.');
    }
}

/**
 * Changes a queue entry from Serving to Completed.
 * Input: queueID from route params.
 * Output: HTTP JSON response showing whether the status update succeeded.
 */
async function markAsCompleted(req, res) {
    try {
        const { queueID } = req.params;

        // TODO: Add administrator authorization middleware before this controller is used in production.
        if (!isValidId(queueID)) {
            return redirectWithMessage(res, '/queue/admin', 'error', 'Invalid queue ID.');
        }

        // Update only if the current status is Serving.
        const updated = await queueModel.markAsCompleted(queueID);

        if (!updated) {
            return redirectWithMessage(res, '/queue/admin', 'error', 'Only Serving queue entries can be marked as Completed.');
        }

        return redirectWithMessage(res, '/queue/admin', 'success', 'Customer queue entry has been completed.');
    } catch (error) {
        console.error('Mark as Completed error:', error);
        return sendServerError(res, 'Something went wrong while marking the queue entry as Completed.');
    }
}

/**
 * Cancels an active queue entry.
 * Input: queueID from route params.
 * Output: HTTP JSON response showing whether cancellation succeeded.
 */
async function cancelQueue(req, res) {
    try {
        const { queueID } = req.params;

        // TODO: Add administrator authorization middleware before this controller is used in production.
        if (!isValidId(queueID)) {
            return redirectWithMessage(res, '/queue/admin', 'error', 'Invalid queue ID.');
        }

        // Cancel only Waiting or Serving queue entries.
        const updated = await queueModel.cancelQueueEntry(queueID);

        if (!updated) {
            return redirectWithMessage(res, '/queue/admin', 'error', 'Only Waiting or Serving queue entries can be cancelled.');
        }

        return redirectWithMessage(res, '/queue/admin', 'success', 'Queue entry has been cancelled.');
    } catch (error) {
        console.error('Cancel queue error:', error);
        return sendServerError(res, 'Something went wrong while cancelling the queue entry.');
    }
}

module.exports = {
    checkIn,
    customerQueueStatus,
    adminQueue,
    markAsServing,
    markAsCompleted,
    cancelQueue
};
