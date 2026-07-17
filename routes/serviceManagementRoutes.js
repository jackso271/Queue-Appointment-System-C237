const express = require('express');

const serviceManagementController =
    require('../controllers/serviceManagementController');

const router = express.Router();

router.get(
    '/',
    serviceManagementController.displayServices
);

router.get(
    '/add',
    serviceManagementController.displayAddService
);

router.post(
    '/add',
    serviceManagementController.createService
);

router.get(
    '/:serviceID/edit',
    serviceManagementController.displayEditService
);

router.post(
    '/:serviceID/edit',
    serviceManagementController.updateService
);

router.post(
    '/:serviceID/delete',
    serviceManagementController.deleteService
);

router.get(
    '/:serviceID',
    serviceManagementController.displayServiceDetails
);

module.exports = router;