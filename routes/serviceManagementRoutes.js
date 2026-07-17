const express = require('express');

const serviceManagementController =
    require('../controllers/serviceManagementController');

const router = express.Router();

router.get(
    '/',
    serviceManagementController.displayServices
);

module.exports = router;