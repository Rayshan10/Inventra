const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangcontroller');
const verifyToken = require('../middleware/authmiddleware');
router.get('/', verifyToken, barangController.getAllBarang);
router.post('/', barangController.createBarang);
router.put('/:id', barangController.updateBarang);
router.delete('/:id', verifyToken, barangController.deleteBarang);

module.exports = router;
