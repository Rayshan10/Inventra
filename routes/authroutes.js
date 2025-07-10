const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontrollers');
const verifyToken = require('../middleware/authmiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);
router.post('/verify', authController.verifyOtp);
router.post('/resend', authController.resendOtp);


module.exports = router;
