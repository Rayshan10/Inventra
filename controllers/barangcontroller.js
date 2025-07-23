const Barang = require('../models/Barang');
const mongoose = require('mongoose');

// Ambil semua barang
exports.getAllBarang = async (req, res) => {
  try {
    const data = await Barang.find();
    res.json(data);  // Langsung kirim array, tanpa wrapper { data }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tambah barang baru
exports.createBarang = async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    // Validasi manual
    const requiredFields = ['kode_barang', 'nama_barang', 'kategori', 'harga_satuan', 'harga_pak', 'stok'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Field berikut harus diisi: ' + missingFields.join(', '),
        receivedData: req.body
      });
    }

    // Pastikan tipe data numerik
    if (isNaN(req.body.harga_satuan) || isNaN(req.body.harga_pak) || isNaN(req.body.stok)) {
      return res.status(400).json({ 
        success: false,
        message: 'Harga dan stok harus berupa angka'
      });
    }

    const barang = new Barang(req.body);
    await barang.save();
    
    res.status(201).json({
      success: true,
      data: barang
    });
  } catch (err) {
    console.error('Error:', err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah ada',
        error: err.message
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: 'Gagal tambah barang',
      error: err.message,
      errors: err.errors 
    });
  }
};

// Edit barang
exports.updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Barang.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) throw new Error("Barang tidak ditemukan");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Hapus barang
exports.deleteBarang = async (req, res) => {
  try {
    // 1. Validasi ID
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Format ID tidak valid"
      });
    }

    // 2. Eksekusi Delete
    const deletedBarang = await Barang.findOneAndDelete({ 
      _id: req.params.id 
    });

    // 3. Handle jika barang tidak ditemukan
    if (!deletedBarang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan"
      });
    }

    // 4. Response sukses
    res.status(200).json({
      success: true,
      message: "Barang berhasil dihapus",
      data: {
        kode_barang: deletedBarang.kode_barang,
        nama: deletedBarang.nama_barang
      }
    });

  } catch (error) {
    console.error("Error dalam deleteBarang:", error);
    
    // 5. Handle error khusus
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Format ID tidak valid"
      });
    }

    // 6. Error umum
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};
