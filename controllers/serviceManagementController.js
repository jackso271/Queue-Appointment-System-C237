const ServiceManagementModel =
    require('../models/serviceManagementModel');

exports.displayServices = (req, res) => {
    ServiceManagementModel.getAllServices((error, services) => {
        if (error) {
            console.error('Unable to retrieve services:', error);

            return res.status(500).send(
                'Unable to retrieve services from the database.'
            );
        }

        return res.render('serviceManagement/serviceList', {
            services
        });
    });
};