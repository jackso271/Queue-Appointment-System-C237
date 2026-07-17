const db = require('../config/database');
const queueModel = require('../models/queueModel');

const createdQueueIds = [];
let originalQueueCount = null;
let cleanupCountMatched = false;

function printResult(status, stage, message) {
    console.log(`[${status}] ${stage} - ${message}`);
}

function fail(stage, message) {
    printResult('FAIL', stage, message);
    throw new Error(`${stage}: ${message}`);
}

async function findApprovedAppointmentWithoutQueue() {
    // This read-only query finds one approved appointment that is safe for temporary queue testing.
    const sql = `
        SELECT a.appointmentID
        FROM appointments a
        LEFT JOIN \`queue\` q ON a.appointmentID = q.appointmentID
        WHERE a.status = ?
        AND q.queueID IS NULL
        ORDER BY a.appointmentID
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, ['Approved']);
    return rows[0] || null;
}

async function getQueueCount() {
    // This read-only query counts the queue table before and after the test.
    const sql = `
        SELECT COUNT(*) AS total
        FROM \`queue\`
    `;

    const [rows] = await db.execute(sql);
    return rows[0].total;
}

async function findQueueById(queueID) {
    // This read-only query verifies only the temporary queue row tracked by queueID.
    const sql = `
        SELECT *
        FROM \`queue\`
        WHERE queueID = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [queueID]);
    return rows[0] || null;
}

async function deleteTemporaryQueueRow(queueID) {
    // This cleanup query deletes only the exact temporary queue row created by this script.
    const sql = `
        DELETE FROM \`queue\`
        WHERE queueID = ?
    `;

    const [result] = await db.execute(sql, [queueID]);
    return result.affectedRows;
}

function trackQueueId(queueID) {
    createdQueueIds.push(queueID);
    printResult('PASS', 'Track queueID', `Tracking temporary queueID ${queueID}.`);
}

function untrackQueueId(queueID) {
    const index = createdQueueIds.indexOf(queueID);

    if (index !== -1) {
        createdQueueIds.splice(index, 1);
    }
}

async function cleanupTrackedRows() {
    if (createdQueueIds.length === 0) {
        printResult('CLEANUP', 'Temporary queue rows', 'No tracked temporary rows remain.');
        return;
    }

    const idsToClean = [...createdQueueIds];

    for (const queueID of idsToClean) {
        try {
            const affectedRows = await deleteTemporaryQueueRow(queueID);

            if (affectedRows === 1) {
                untrackQueueId(queueID);
                printResult('CLEANUP', 'Temporary queue row', `Deleted temporary queueID ${queueID}.`);
            } else {
                printResult('CLEANUP', 'Temporary queue row', `queueID ${queueID} was not deleted because it was not found.`);
                untrackQueueId(queueID);
            }
        } catch (error) {
            printResult('CLEANUP', 'Temporary queue row', `Failed to delete queueID ${queueID}. This row may remain. ${error.message}`);
        }
    }
}

async function deleteAndVerify(queueID, stage) {
    const affectedRows = await deleteTemporaryQueueRow(queueID);

    if (affectedRows !== 1) {
        fail(stage, `Expected to delete queueID ${queueID}, but affected rows was ${affectedRows}.`);
    }

    untrackQueueId(queueID);
    printResult('CLEANUP', stage, `Deleted temporary queueID ${queueID}.`);
}

async function createTemporaryQueueEntry(appointmentID, stage) {
    // This stage creates a temporary Waiting queue entry through the queue model.
    const queueNumber = await queueModel.getNextQueueNumber();
    const queueID = await queueModel.createQueueEntry(appointmentID, queueNumber);
    trackQueueId(queueID);

    printResult('PASS', stage, `Created temporary queueID ${queueID} with queue number ${queueNumber}.`);
    return queueID;
}

async function verifyStatus(queueID, expectedStatus, stage) {
    // This stage reads the tracked temporary row and checks its queue status.
    const queueEntry = await findQueueById(queueID);

    if (!queueEntry) {
        fail(stage, `Temporary queueID ${queueID} was not found.`);
    }

    if (queueEntry.queueStatus !== expectedStatus) {
        fail(stage, `Expected queueID ${queueID} to be ${expectedStatus}, but found ${queueEntry.queueStatus}.`);
    }

    printResult('PASS', stage, `queueID ${queueID} status is ${expectedStatus}.`);
}

async function main() {
    console.log('Queue model write-operation test started.');
    console.log('Only temporary queue rows created by this script will be deleted.');

    // This setup stage finds one approved appointment that does not already have a queue row.
    const appointment = await findApprovedAppointmentWithoutQueue();

    if (!appointment) {
        fail('Setup', 'No Approved appointment without a queue row was found. Add test data before running write-operation tests.');
    }

    const appointmentID = appointment.appointmentID;
    printResult('PASS', 'Setup', `Using Approved appointmentID ${appointmentID}.`);

    // This setup stage records the original queue count for the final cleanup check.
    originalQueueCount = await getQueueCount();
    printResult('PASS', 'Original queue count', `Queue table started with ${originalQueueCount} row(s).`);

    // This stage tests Waiting -> Serving -> Completed.
    const completedFlowQueueID = await createTemporaryQueueEntry(appointmentID, 'Create completed-flow row');
    await verifyStatus(completedFlowQueueID, 'Waiting', 'Verify completed-flow Waiting');

    const servingUpdated = await queueModel.markAsServing(completedFlowQueueID);
    if (!servingUpdated) {
        fail('Waiting to Serving', `queueModel.markAsServing returned false for queueID ${completedFlowQueueID}.`);
    }
    printResult('PASS', 'Waiting to Serving', `queueID ${completedFlowQueueID} was updated.`);
    await verifyStatus(completedFlowQueueID, 'Serving', 'Verify Serving');

    const completedUpdated = await queueModel.markAsCompleted(completedFlowQueueID);
    if (!completedUpdated) {
        fail('Serving to Completed', `queueModel.markAsCompleted returned false for queueID ${completedFlowQueueID}.`);
    }
    printResult('PASS', 'Serving to Completed', `queueID ${completedFlowQueueID} was updated.`);
    await verifyStatus(completedFlowQueueID, 'Completed', 'Verify Completed');

    await deleteAndVerify(completedFlowQueueID, 'Delete completed-flow row');

    // This stage reuses the same appointment after cleanup to test cancellation.
    const cancelledFlowQueueID = await createTemporaryQueueEntry(appointmentID, 'Create cancel-flow row');
    await verifyStatus(cancelledFlowQueueID, 'Waiting', 'Verify cancel-flow Waiting');

    const cancelledUpdated = await queueModel.cancelQueueEntry(cancelledFlowQueueID);
    if (!cancelledUpdated) {
        fail('Cancel queue entry', `queueModel.cancelQueueEntry returned false for queueID ${cancelledFlowQueueID}.`);
    }
    printResult('PASS', 'Cancel queue entry', `queueID ${cancelledFlowQueueID} was cancelled.`);
    await verifyStatus(cancelledFlowQueueID, 'Cancelled', 'Verify Cancelled');

    await deleteAndVerify(cancelledFlowQueueID, 'Delete cancel-flow row');

    const finalQueueCount = await getQueueCount();
    cleanupCountMatched = Number(finalQueueCount) === Number(originalQueueCount);

    if (!cleanupCountMatched) {
        fail('Final queue count', `Expected ${originalQueueCount} row(s), but found ${finalQueueCount}.`);
    }

    printResult('PASS', 'Final queue count', `Queue table returned to ${finalQueueCount} row(s).`);
}

main()
    .catch((error) => {
        console.error(`Stopped after failure: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await cleanupTrackedRows();

        if (originalQueueCount !== null) {
            try {
                const finalQueueCount = await getQueueCount();
                cleanupCountMatched = Number(finalQueueCount) === Number(originalQueueCount);

                if (cleanupCountMatched) {
                    printResult('PASS', 'Cleanup count check', `Queue count is back to ${finalQueueCount}.`);
                } else {
                    printResult('FAIL', 'Cleanup count check', `Original count was ${originalQueueCount}, final count is ${finalQueueCount}.`);
                }
            } catch (error) {
                printResult('FAIL', 'Cleanup count check', error.message);
            }
        }

        if (createdQueueIds.length > 0) {
            printResult('FAIL', 'Temporary rows remaining', `These queueID value(s) may remain: ${createdQueueIds.join(', ')}.`);
        } else {
            printResult('CLEANUP', 'Temporary rows remaining', 'No tracked temporary queue rows remain.');
        }

        await db.end();
        console.log('MySQL pool closed.');
    });

