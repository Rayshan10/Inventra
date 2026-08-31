const express = require('express');
const router = express.Router();
const mutasiController = require('../controllers/mutasicontroller');
const verifyToken = require('../middleware/authmiddleware');

// Semua route mutasi stok memerlukan autentikasi
router.use(verifyToken);

// ===== Mutasi Stok Routes =====

// Buat mutasi stok baru (masuk/keluar/opname/retur)
router.post('/', mutasiController.createMutasi);

// Dapatkan semua mutasi stok dengan pagination & filter
router.get('/', mutasiController.getAllMutasi);

// Dapatkan riwayat mutasi untuk barang spesifik
router.get('/barang/:barang_id', mutasiController.getMutasiByBarang);

// Dapatkan statistik stok
router.get('/stats', mutasiController.getStokStats);

module.exports = router;
