const mongoose = require('mongoose');

const barangSchema = new mongoose.Schema({
    kode_barang: { type: String, required: true, unique: true },
    nama_barang: { type: String, required: true },
    kategori: { type: String, required: true },
    harga_satuan: { type: Number, required: true },
    harga_pak: { type: Number, required: true },
    stok: { type: Number, required: true },
    tgljam: { type: Date, default: Date.now }
}, {
    collection: 'barang',
});

module.exports = mongoose.model('Barang', barangSchema);
