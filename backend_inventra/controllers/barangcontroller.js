const Barang = require('../models/barang'); // Note: Lowercase 'barang' untuk consistency dengan file name
const mongoose = require('mongoose');

// Ambil semua barang
exports.getAllBarang = async (req, res) => {
  try {
    const { skip = 0, limit = 50, kategori, search } = req.query;

    // Build query
    const query = {};
    if (kategori) {
      query.kategori = kategori;
    }
    if (search) {
      query.$or = [
        { nama_barang: { $regex: search, $options: 'i' } },
        { kode_barang: { $regex: search, $options: 'i' } }
      ];
    }

    // Dapatkan total
    const total = await Barang.countDocuments(query);

    // Dapatkan data dengan pagination
    const data = await Barang.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ tgljam: -1 })
      .lean();

    res.json({
      success: true,
      data: data,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error getAllBarang:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan data barang',
      error: err.message
    });
  }
};

// Export laporan barang dalam format CSV
exports.exportBarangCsv = async (req, res) => {
  try {
    const data = await Barang.find().sort({ kode_barang: 1 }).lean();
    const escapeCsv = (value) => {
      const text = value == null ? '' : String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const rows = [
      ['Kode Barang', 'Nama Barang', 'Kategori', 'Harga Satuan', 'Harga Pak', 'Stok', 'Tanggal'],
      ...data.map((barang) => [
        barang.kode_barang,
        barang.nama_barang,
        barang.kategori,
        barang.harga_satuan,
        barang.harga_pak,
        barang.stok,
        barang.tgljam ? new Date(barang.tgljam).toISOString() : ''
      ])
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-barang.csv"');
    res.send(`\ufeff${csv}`);
  } catch (err) {
    console.error('Error export barang:', err);
    res.status(500).json({ success: false, message: 'Gagal mengekspor laporan barang' });
  }
};

// Tambah barang baru
exports.createBarang = async (req, res) => {
  try {
    const { kode_barang, nama_barang, kategori, harga_satuan, harga_pak, stok } = req.body;

    // Validasi input
    const requiredFields = ['kode_barang', 'nama_barang', 'kategori', 'harga_satuan', 'harga_pak', 'stok'];
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Field berikut harus diisi: ' + missingFields.join(', ')
      });
    }

    // Validasi tipe data numerik
    if (isNaN(harga_satuan) || isNaN(harga_pak) || isNaN(stok)) {
      return res.status(400).json({
        success: false,
        message: 'Harga dan stok harus berupa angka'
      });
    }

    if (Number(stok) < 0 || Number(harga_satuan) < 0 || Number(harga_pak) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Harga dan stok tidak boleh negatif'
      });
    }

    // Cek duplikasi kode barang
    const existingBarang = await Barang.findOne({ kode_barang });
    if (existingBarang) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah ada'
      });
    }

    // Buat barang baru
    const barang = new Barang({
      kode_barang,
      nama_barang,
      kategori,
      harga_satuan: Number(harga_satuan),
      harga_pak: Number(harga_pak),
      stok: Number(stok)
    });

    await barang.save();

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: barang
    });

  } catch (err) {
    console.error('Error createBarang:', err);

    // Handle error spesifik
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah ada',
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan barang',
      error: err.message
    });
  }
};

// Edit barang
exports.updateBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID tidak valid'
      });
    }

    const updateData = {};
    const allowedFields = ['nama_barang', 'kategori', 'harga_satuan', 'harga_pak', 'stok'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Validasi dan normalisasi nilai numerik sebelum update.
    if (updateData.harga_satuan !== undefined && isNaN(updateData.harga_satuan)) {
      return res.status(400).json({
        success: false,
        message: 'Harga satuan harus berupa angka'
      });
    }

    if (updateData.harga_pak !== undefined && isNaN(updateData.harga_pak)) {
      return res.status(400).json({
        success: false,
        message: 'Harga pak harus berupa angka'
      });
    }

    if (updateData.stok !== undefined && isNaN(updateData.stok)) {
      return res.status(400).json({
        success: false,
        message: 'Stok harus berupa angka'
      });
    }

    for (const field of ['harga_satuan', 'harga_pak', 'stok']) {
      if (updateData[field] !== undefined) {
        updateData[field] = Number(updateData[field]);
      }
    }

    // Update dengan validasi
    const updated = await Barang.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Barang berhasil diperbarui',
      data: updated
    });

  } catch (err) {
    console.error('Error updateBarang:', err);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Data barang tidak valid',
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui barang',
      error: err.message
    });
  }
};

// Hapus barang
exports.deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID tidak valid'
      });
    }

    // Eksekusi Delete
    const deletedBarang = await Barang.findOneAndDelete({
      _id: id
    });

    // Handle jika barang tidak ditemukan
    if (!deletedBarang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    // Response sukses
    res.status(200).json({
      success: true,
      message: 'Barang berhasil dihapus',
      data: {
        _id: deletedBarang._id,
        kode_barang: deletedBarang.kode_barang,
        nama_barang: deletedBarang.nama_barang
      }
    });

  } catch (error) {
    console.error('Error deleteBarang:', error);

    // Handle error khusus
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format ID tidak valid'
      });
    }

    // Error umum
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus barang',
      error: error.message
    });
  }
};
