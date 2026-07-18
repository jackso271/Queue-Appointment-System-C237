const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// All routes below require a valid, DB-verified session
router.use(ensureAuthenticated);

router.get('/profile', userController.showProfile);

router.get('/edit', userController.showEditForm);
router.post('/edit', userController.updateProfile);

router.get('/change-password', userController.showChangePasswordForm);
router.post('/change-password', userController.changePassword);

module.exports = router;