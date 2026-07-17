const express = require('express');

const staffController =
    require('../controllers/staffController');

const router = express.Router();

// TODO: Add administrator authorization middleware
// when the authentication feature is ready.

router.get(
    '/',
    staffController.getAllStaff
);

router.get(
    '/create',
    staffController.showCreateStaff
);

router.post(
    '/create',
    staffController.createStaff
);

router.get(
    '/:staffID/edit',
    staffController.showEditStaff
);

router.post(
    '/:staffID/edit',
    staffController.updateStaff
);

router.post(
    '/:staffID/delete',
    staffController.deleteStaff
);

router.get(
    '/:staffID',
    staffController.getStaffDetails
);

module.exports = router;