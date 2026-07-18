const dashboardModel = require('../models/dashboardModel');

async function displayDashboard(req, res) {
    try {
        const [
            statistics,
            appointmentStatuses,
            ratingBreakdown,
            recentFeedback
        ] = await Promise.all([
            dashboardModel.getDashboardStatistics(),
            dashboardModel.getAppointmentStatusBreakdown(),
            dashboardModel.getRatingBreakdown(),
            dashboardModel.getRecentFeedback()
        ]);

        return res.status(200).render('dashboard/dashboard', {
            title: 'Operational Dashboard',
            statistics,
            appointmentStatuses,
            ratingBreakdown,
            recentFeedback
        });
    } catch (error) {
        console.error('Dashboard error:', error);

        return res.status(500).send(
            'Unable to load the dashboard.'
        );
    }
}

module.exports = {
    displayDashboard
};