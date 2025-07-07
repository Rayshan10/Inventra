const Barang = require('../models/Barang');

// Ambil semua barang
exports.getAllBarang = async (req, res) => {
    try {
    const data = await Barang.find().sort({ kode_barang: 1 });
    res.json({ success: true, data });
    } catch (err) {
    res.status(500).json({ message: 'Gagal ambil data', error: err.message });
    }
};

// Tambah barang baru
exports.createBarang = async (req, res) => {
    try {
    const barang = new Barang(req.body);
    await barang.save();
    res.status(201).json({ message: 'Barang ditambahkan' });
    } catch (err) {
    res.status(400).json({ message: 'Gagal tambah barang', error: err.message });
    }
};

// Edit barang
exports.updateBarang = async (req, res) => {
    try {
    await Barang.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Barang diperbarui' });
    } catch (err) {
    res.status(400).json({ message: 'Gagal update barang', error: err.message });
    }
};

// Hapus barang
exports.deleteBarang = async (req, res) => {
    try {
    await Barang.findByIdAndDelete(req.params.id);
    res.json({ message: 'Barang dihapus' });
    } catch (err) {
    res.status(400).json({ message: 'Gagal hapus barang', error: err.message });
    }
};
