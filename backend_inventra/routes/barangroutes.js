const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangcontroller');
const verifyToken = require('../middleware/authmiddleware');

// Semua route barang memerlukan autentikasi
router.get('/', verifyToken, barangController.getAllBarang);
router.get('/export', verifyToken, barangController.exportBarangCsv);
router.post('/', verifyToken, barangController.createBarang);
router.put('/:id', verifyToken, barangController.updateBarang);
router.delete('/:id', verifyToken, barangController.deleteBarang);

module.exports = router;
