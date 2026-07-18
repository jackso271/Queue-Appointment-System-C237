const reportModel = require('../models/reportModel');

async function displayOperationalReport(req, res) {
    try {
        const [
            appointmentsByStatus,
            appointmentsByService,
            feedbackSummary,
            monthlyAppointments
        ] = await Promise.all([
            reportModel.getAppointmentsByStatus(),
            reportModel.getAppointmentsByService(),
            reportModel.getFeedbackSummary(),
            reportModel.getMonthlyAppointments()
        ]);

        return res.status(200).render(
            'reports/operationalReport',
            {
                title: 'Operational Report',
                appointmentsByStatus,
                appointmentsByService,
                feedbackSummary,
                monthlyAppointments
            }
        );
    } catch (error) {
        console.error('Report error:', error);

        return res.status(500).send(
            'Unable to generate the operational report.'
        );
    }
}

module.exports = {
    displayOperationalReport
};