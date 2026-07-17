const ServiceManagementModel =
    require('../models/serviceManagementModel');

function validateServiceForm(body) {
    const serviceName = body.serviceName?.trim();
    const description = body.description?.trim() || '';
    const duration = Number(body.duration);
    const price = Number(body.price);
    const status = body.status;

    if (!serviceName) {
        return {
            error: 'Service name is required.'
        };
    }

    if (!Number.isInteger(duration) || duration <= 0) {
        return {
            error: 'Duration must be a whole number greater than 0.'
        };
    }

    if (!Number.isFinite(price) || price < 0) {
        return {
            error: 'Price must be 0 or greater.'
        };
    }

    if (!['Available', 'Unavailable'].includes(status)) {
        return {
            error: 'Please select a valid service status.'
        };
    }

    return {
        serviceData: {
            serviceName,
            description,
            duration,
            price,
            status
        }
    };
}

exports.displayServices = (req, res) => {
    ServiceManagementModel.getAllServices((error, services) => {
        if (error) {
            console.error('Unable to retrieve services:', error);

            return res.status(500).send(
                'Unable to retrieve services from the database.'
            );
        }

        return res.render('serviceManagement/serviceList', {
            services,
            successMessage: req.query.success || null
        });
    });
};

exports.displayAddService = (req, res) => {
    return res.render('serviceManagement/addService', {
        errorMessage: null,
        formData: {
            serviceName: '',
            description: '',
            duration: '',
            price: '',
            status: 'Available'
        }
    });
};

exports.createService = (req, res) => {
    const validation = validateServiceForm(req.body);

    if (validation.error) {
        return res.status(400).render(
            'serviceManagement/addService',
            {
                errorMessage: validation.error,
                formData: req.body
            }
        );
    }

    ServiceManagementModel.createService(
        validation.serviceData,
        error => {
            if (error) {
                console.error('Unable to create service:', error);

                const message =
                    error.code === 'ER_DUP_ENTRY'
                        ? 'A service with that name already exists.'
                        : 'Unable to create the service.';

                return res.status(500).render(
                    'serviceManagement/addService',
                    {
                        errorMessage: message,
                        formData: req.body
                    }
                );
            }

            return res.redirect(
                '/service-management?success=Service added successfully.'
            );
        }
    );
};

exports.displayServiceDetails = (req, res) => {
    const serviceID = Number(req.params.serviceID);

    if (!Number.isInteger(serviceID)) {
        return res.status(400).send('Invalid service ID.');
    }

    ServiceManagementModel.getServiceById(
        serviceID,
        (error, services) => {
            if (error) {
                console.error('Unable to retrieve service:', error);

                return res.status(500).send(
                    'Unable to retrieve the service.'
                );
            }

            if (services.length === 0) {
                return res.status(404).send('Service not found.');
            }

            return res.render(
                'serviceManagement/serviceDetails',
                {
                    service: services[0]
                }
            );
        }
    );
};

exports.displayEditService = (req, res) => {
    const serviceID = Number(req.params.serviceID);

    if (!Number.isInteger(serviceID)) {
        return res.status(400).send('Invalid service ID.');
    }

    ServiceManagementModel.getServiceById(
        serviceID,
        (error, services) => {
            if (error) {
                console.error('Unable to retrieve service:', error);

                return res.status(500).send(
                    'Unable to retrieve the service.'
                );
            }

            if (services.length === 0) {
                return res.status(404).send('Service not found.');
            }

            return res.render('serviceManagement/editService', {
                service: services[0],
                errorMessage: null
            });
        }
    );
};

exports.updateService = (req, res) => {
    const serviceID = Number(req.params.serviceID);
    const validation = validateServiceForm(req.body);

    if (!Number.isInteger(serviceID)) {
        return res.status(400).send('Invalid service ID.');
    }

    if (validation.error) {
        return res.status(400).render(
            'serviceManagement/editService',
            {
                errorMessage: validation.error,
                service: {
                    serviceID,
                    ...req.body
                }
            }
        );
    }

    ServiceManagementModel.updateService(
        serviceID,
        validation.serviceData,
        error => {
            if (error) {
                console.error('Unable to update service:', error);

                const message =
                    error.code === 'ER_DUP_ENTRY'
                        ? 'A service with that name already exists.'
                        : 'Unable to update the service.';

                return res.status(500).render(
                    'serviceManagement/editService',
                    {
                        errorMessage: message,
                        service: {
                            serviceID,
                            ...req.body
                        }
                    }
                );
            }

            return res.redirect(
                `/service-management/${serviceID}`
            );
        }
    );
};

exports.deleteService = (req, res) => {
    const serviceID = Number(req.params.serviceID);

    if (!Number.isInteger(serviceID)) {
        return res.status(400).send('Invalid service ID.');
    }

    ServiceManagementModel.deleteService(
        serviceID,
        (error, result) => {
            if (error) {
                console.error('Unable to delete service:', error);

                if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(409).send(
                        'This service cannot be deleted because it is being used by an appointment.'
                    );
                }

                return res.status(500).send(
                    'Unable to delete the service.'
                );
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Service not found.');
            }

            return res.redirect(
                '/service-management?success=Service deleted successfully.'
            );
        }
    );
};