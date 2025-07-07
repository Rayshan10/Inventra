const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangcontroller');

router.get('/', barangController.getAllBarang);
router.post('/', barangController.createBarang);
router.put('/:id', barangController.updateBarang);
router.delete('/:id', barangController.deleteBarang);

module.exports = router;
