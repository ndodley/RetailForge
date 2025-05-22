const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);    // ✅ Login route
router.post('/logout', authController.logout);  // ✅ Logout route
router.get('/me', authController.getUserSession); // ✅ New route to check session data

module.exports = router;
