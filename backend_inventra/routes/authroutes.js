const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontrollers');
const verifyToken = require('../middleware/authmiddleware');

// Middleware untuk menangani CORS secara spesifik
const handleCors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
};

// Terapkan middleware CORS untuk semua route
router.use(handleCors);

// OPTIONS handler untuk preflight requests
router.options('*', (req, res) => {
  res.status(204).send();
});

// Route untuk register
router.post('/register', async (req, res, next) => {
  try {
    await authController.register(req, res);
  } catch (error) {
    next(error);
  }
});

// Route untuk login
router.post('/login', async (req, res, next) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

// Route untuk verifikasi OTP
router.post('/verify', async (req, res, next) => {
  try {
    await authController.verifyOtp(req, res);
  } catch (error) {
    next(error);
  }
});

// Route untuk mengirim ulang OTP
router.post('/resend', async (req, res, next) => {
  try {
    await authController.resendOtp(req, res);
  } catch (error) {
    next(error);
  }
});

// Route untuk mendapatkan semua user (dilindungi token)
router.get('/users', verifyToken, async (req, res, next) => {
  try {
    await authController.getAllUsers(req, res);
  } catch (error) {
    next(error);
  }
});

// Route untuk mendapatkan profile user (dilindungi token)
// PERBAIKAN: Gunakan verifyToken yang sudah diimport, bukan authMiddleware.verifyToken
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    await authController.getProfile(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;