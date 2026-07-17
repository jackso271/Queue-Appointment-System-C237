const db = require('../config/database');
const queueModel = require('../models/queueModel');

function logResult(status, testName, message) {
    console.log(`[${status}] ${testName} - ${message}`);
}

async function runTest(testName, testFunction) {
    try {
        await testFunction();
    } catch (error) {
        logResult('FAIL', testName, error.message);
    }
}

async function findSampleAppointment() {
    // This read-only query finds one appointment so the script can test model lookups without changing data.
    const sql = `
        SELECT appointmentID, userID
        FROM appointments
        ORDER BY appointmentID
        LIMIT 1
    `;

    const [rows] = await db.execute(sql);
    return rows[0] || null;
}

async function main() {
    let sampleQueueEntry = null;
    let sampleAppointment = null;

    console.log('Queue model read-only test started.');
    console.log('No inserts, updates, cancels, deletes, or schema changes will be performed.');

    await runTest('Database connectivity', async () => {
        // This read-only query confirms that the MySQL connection works.
        const [rows] = await db.execute('SELECT 1 AS connected');

        if (rows[0] && rows[0].connected === 1) {
            logResult('PASS', 'Database connectivity', 'Connected to MySQL successfully.');
            return;
        }

        logResult('FAIL', 'Database connectivity', 'Connection test returned an unexpected result.');
    });

    await runTest('getNextQueueNumber', async () => {
        // This test calls the model function that reads the next available queue number.
        const nextQueueNumber = await queueModel.getNextQueueNumber();

        if (Number.isInteger(Number(nextQueueNumber)) && Number(nextQueueNumber) >= 1) {
            logResult('PASS', 'getNextQueueNumber', `Next queue number is ${nextQueueNumber}.`);
            return;
        }

        logResult('FAIL', 'getNextQueueNumber', 'The function did not return a valid queue number.');
    });

    await runTest('getWaitingQueue', async () => {
        // This test reads active Waiting and Serving queue records.
        const queueEntries = await queueModel.getWaitingQueue();

        if (queueEntries.length === 0) {
            logResult('EMPTY', 'getWaitingQueue', 'No active Waiting or Serving queue records exist.');
            return;
        }

        sampleQueueEntry = queueEntries[0];
        logResult('PASS', 'getWaitingQueue', `Found ${queueEntries.length} active queue record(s).`);
    });

    await runTest('find sample appointment', async () => {
        // This test finds one existing appointment to use for read-only model lookups.
        sampleAppointment = sampleQueueEntry || await findSampleAppointment();

        if (!sampleAppointment) {
            logResult('EMPTY', 'find sample appointment', 'No appointment records exist, so appointment-based tests will be skipped.');
            return;
        }

        logResult('PASS', 'find sample appointment', `Using appointmentID ${sampleAppointment.appointmentID} for read-only checks.`);
    });

    await runTest('findAppointmentForQueue', async () => {
        // This test reads appointment details needed for queue validation.
        if (!sampleAppointment) {
            logResult('EMPTY', 'findAppointmentForQueue', 'Skipped because no appointment records exist.');
            return;
        }

        const appointment = await queueModel.findAppointmentForQueue(sampleAppointment.appointmentID);

        if (!appointment) {
            logResult('EMPTY', 'findAppointmentForQueue', 'No appointment was returned for the sample appointment ID.');
            return;
        }

        logResult('PASS', 'findAppointmentForQueue', `Read appointment ${appointment.appointmentID} with status ${appointment.status}.`);
    });

    await runTest('findByAppointmentId', async () => {
        // This test checks whether a queue record exists for the sample appointment.
        if (!sampleAppointment) {
            logResult('EMPTY', 'findByAppointmentId', 'Skipped because no appointment records exist.');
            return;
        }

        const queueEntry = await queueModel.findByAppointmentId(sampleAppointment.appointmentID);

        if (!queueEntry) {
            logResult('EMPTY', 'findByAppointmentId', 'No queue record exists for the sample appointment. This is valid when test queue data is missing.');
            return;
        }

        sampleQueueEntry = queueEntry;
        logResult('PASS', 'findByAppointmentId', `Found queueID ${queueEntry.queueID} for appointmentID ${sampleAppointment.appointmentID}.`);
    });

    await runTest('getCustomerQueueStatus', async () => {
        // This test reads a queue record only when appointmentID and userID match.
        if (!sampleAppointment) {
            logResult('EMPTY', 'getCustomerQueueStatus', 'Skipped because no appointment records exist.');
            return;
        }

        const queueStatus = await queueModel.getCustomerQueueStatus(sampleAppointment.appointmentID, sampleAppointment.userID);

        if (!queueStatus) {
            logResult('EMPTY', 'getCustomerQueueStatus', 'No matching customer queue record exists. This is valid when test queue data is missing.');
            return;
        }

        sampleQueueEntry = queueStatus;
        logResult('PASS', 'getCustomerQueueStatus', `Read queue status ${queueStatus.queueStatus} for appointmentID ${sampleAppointment.appointmentID}.`);
    });

    await runTest('countCustomersAhead', async () => {
        // This test counts waiting customers ahead of a known queue number.
        if (!sampleQueueEntry) {
            logResult('EMPTY', 'countCustomersAhead', 'Skipped because no queue record exists to provide a queue number.');
            return;
        }

        const customersAhead = await queueModel.countCustomersAhead(sampleQueueEntry.queueNumber);

        if (Number.isInteger(Number(customersAhead)) && Number(customersAhead) >= 0) {
            logResult('PASS', 'countCustomersAhead', `${customersAhead} waiting customer(s) are ahead of queue number ${sampleQueueEntry.queueNumber}.`);
            return;
        }

        logResult('FAIL', 'countCustomersAhead', 'The function did not return a valid count.');
    });
}

main()
    .catch((error) => {
        logResult('FAIL', 'Queue model read-only test', error.message);
    })
    .finally(async () => {
        // Always close the MySQL pool so the script can exit cleanly.
        await db.end();
        console.log('MySQL pool closed.');
    });

