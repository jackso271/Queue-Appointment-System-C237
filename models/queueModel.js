const db = require('../config/database');

/**
 * Gets the next queue number.
 * Input: none.
 * Output: the next number after the highest queueNumber currently stored.
 */
async function getNextQueueNumber() {
    // This SQL reads the highest queue number so the next customer gets the next number.
    const sql = `
        SELECT COALESCE(MAX(queueNumber), 0) + 1 AS nextQueueNumber
        FROM \`queue\`
    `;

    const [rows] = await db.execute(sql);
    return rows[0].nextQueueNumber;
}

/**
 * Finds a queue entry by appointment ID.
 * Input: appointmentID.
 * Output: one queue row if it exists, otherwise null.
 */
async function findByAppointmentId(appointmentID) {
    // This SQL reads one queue record for the selected appointment.
    const sql = `
        SELECT *
        FROM \`queue\`
        WHERE appointmentID = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [appointmentID]);
    return rows[0] || null;
}

/**
 * Creates a new queue entry when a customer checks in.
 * Input: appointmentID and queueNumber.
 * Output: the inserted queue record ID.
 */
async function createQueueEntry(appointmentID, queueNumber) {
    // This SQL creates a Waiting queue record for an approved appointment.
    const sql = `
        INSERT INTO \`queue\`
            (appointmentID, queueNumber, queueStatus, checkInTime)
        VALUES
            (?, ?, 'Waiting', NOW())
    `;

    const [result] = await db.execute(sql, [appointmentID, queueNumber]);
    return result.insertId;
}

/**
 * Gets all queue records that administrators should monitor.
 * Input: none.
 * Output: a list of Waiting and Serving queue records with appointment details.
 */
async function getWaitingQueue() {
    // This SQL reads current queue records with appointment, service and staff details for the admin page.
    const sql = `
        SELECT
            q.*,
            a.userID,
            a.serviceID,
            a.staffID,
            a.appointmentDate,
            a.appointmentTime,
            a.status AS appointmentStatus,
            s.serviceName,
            st.fullName AS staffName
        FROM \`queue\` q
        INNER JOIN appointments a ON q.appointmentID = a.appointmentID
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        WHERE q.queueStatus IN ('Waiting', 'Serving')
        ORDER BY
            CASE q.queueStatus
                WHEN 'Serving' THEN 1
                WHEN 'Waiting' THEN 2
                ELSE 3
            END,
            q.queueNumber
    `;

    const [rows] = await db.execute(sql);
    return rows;
}

/**
 * Gets a customer's queue status for one appointment.
 * Input: appointmentID and authenticated userID.
 * Output: the queue record if it belongs to the customer, otherwise null.
 */
async function getCustomerQueueStatus(appointmentID, userID) {
    // This SQL reads a queue record only when the appointment belongs to the logged-in customer.
    const sql = `
        SELECT
            q.*,
            a.userID,
            a.serviceID,
            a.staffID,
            a.appointmentDate,
            a.appointmentTime,
            a.status AS appointmentStatus,
            s.serviceName,
            st.fullName AS staffName
        FROM \`queue\` q
        INNER JOIN appointments a ON q.appointmentID = a.appointmentID
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        WHERE q.appointmentID = ?
        AND a.userID = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [appointmentID, userID]);
    return rows[0] || null;
}

/**
 * Changes a queue entry from Waiting to Serving.
 * Input: queueID.
 * Output: true when one row was updated, otherwise false.
 */
async function markAsServing(queueID) {
    // This SQL updates only Waiting records so invalid status changes are rejected.
    const sql = `
        UPDATE \`queue\`
        SET queueStatus = 'Serving',
            calledTime = NOW()
        WHERE queueID = ?
        AND queueStatus = 'Waiting'
    `;

    const [result] = await db.execute(sql, [queueID]);
    return result.affectedRows === 1;
}

/**
 * Changes a queue entry from Serving to Completed.
 * Input: queueID.
 * Output: true when one row was updated, otherwise false.
 */
async function markAsCompleted(queueID) {
    // This SQL updates only Serving records so customers cannot be completed before being called.
    const sql = `
        UPDATE \`queue\`
        SET queueStatus = 'Completed',
            completedTime = NOW()
        WHERE queueID = ?
        AND queueStatus = 'Serving'
    `;

    const [result] = await db.execute(sql, [queueID]);
    return result.affectedRows === 1;
}

/**
 * Cancels a queue entry that is still active.
 * Input: queueID.
 * Output: true when one row was updated, otherwise false.
 */
async function cancelQueueEntry(queueID) {
    // This SQL cancels only Waiting or Serving records and keeps finished records unchanged.
    const sql = `
        UPDATE \`queue\`
        SET queueStatus = 'Cancelled',
            completedTime = CASE
                WHEN completedTime IS NULL THEN NOW()
                ELSE completedTime
            END
        WHERE queueID = ?
        AND queueStatus IN ('Waiting', 'Serving')
    `;

    const [result] = await db.execute(sql, [queueID]);
    return result.affectedRows === 1;
}

/**
 * Counts how many Waiting customers are ahead of one queue record.
 * Input: queueNumber.
 * Output: the number of Waiting queue records with smaller queue numbers.
 */
async function countCustomersAhead(queueNumber) {
    // This SQL counts Waiting customers with queue numbers before the selected customer.
    const sql = `
        SELECT COUNT(*) AS customersAhead
        FROM \`queue\`
        WHERE queueStatus = 'Waiting'
        AND queueNumber < ?
    `;

    const [rows] = await db.execute(sql, [queueNumber]);
    return rows[0].customersAhead;
}

/**
 * Finds appointment details needed before queue check-in.
 * Input: appointmentID.
 * Output: one appointment row if it exists, otherwise null.
 */
async function findAppointmentForQueue(appointmentID) {
    // This SQL reads appointment details needed to validate queue check-in.
    const sql = `
        SELECT
            a.appointmentID,
            a.userID,
            a.serviceID,
            a.staffID,
            a.appointmentDate,
            a.appointmentTime,
            a.status,
            a.remarks,
            s.serviceName,
            st.fullName AS staffName
        FROM appointments a
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        WHERE a.appointmentID = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [appointmentID]);
    return rows[0] || null;
}

module.exports = {
    getNextQueueNumber,
    findByAppointmentId,
    createQueueEntry,
    getWaitingQueue,
    getCustomerQueueStatus,
    markAsServing,
    markAsCompleted,
    cancelQueueEntry,
    countCustomersAhead,
    findAppointmentForQueue
};

