const MutasiStok = require('../models/mutasi');
const Barang = require('../models/barang');
const mongoose = require('mongoose');

// Validasi dan normalisasi nama model/collection
// Perhatian: Pastikan case-sensitive di Linux
const TIPE_MUTASI = ['masuk', 'keluar', 'opname', 'retur'];

// ===== Tambah Mutasi Stok =====
exports.createMutasi = async (req, res) => {
    try {
        const { barang_id, tipe, jumlah, keterangan, tanggal_mutasi } = req.body;
        const user_id = req.userId;

        // Validasi input
        if (!barang_id || !tipe || !jumlah || !keterangan) {
            return res.status(400).json({
                success: false,
                message: 'Field berikut harus diisi: barang_id, tipe, jumlah, keterangan'
            });
        }

        if (!TIPE_MUTASI.includes(tipe)) {
            return res.status(400).json({
                success: false,
                message: `Tipe mutasi harus salah satu dari: ${TIPE_MUTASI.join(', ')}`
            });
        }

        if (jumlah <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Jumlah harus lebih besar dari 0'
            });
        }

        // Validasi ObjectId
        if (!mongoose.Types.ObjectId.isValid(barang_id)) {
            return res.status(400).json({
                success: false,
                message: 'Format barang_id tidak valid'
            });
        }

        // Cari barang
        const barang = await Barang.findById(barang_id);
        if (!barang) {
            return res.status(404).json({
                success: false,
                message: 'Barang tidak ditemukan'
            });
        }

        // Hitung stok baru
        let stok_baru = barang.stok;
        if (tipe === 'masuk' || tipe === 'retur') {
            stok_baru += jumlah;
        } else if (tipe === 'keluar' || tipe === 'opname') {
            stok_baru -= jumlah;
            // Validasi stok tidak boleh negatif
            if (stok_baru < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Stok tidak cukup. Stok saat ini: ${barang.stok}, diminta keluar: ${jumlah}`
                });
            }
        }

        // Buat record mutasi
        const mutasi = new MutasiStok({
            barang_id,
            tipe,
            jumlah,
            keterangan,
            stok_sebelum: barang.stok,
            stok_sesudah: stok_baru,
            created_by: user_id,
            tanggal_mutasi: tanggal_mutasi || Date.now()
        });

        await mutasi.save();

        // Update stok barang
        barang.stok = stok_baru;
        await barang.save();

        // Return dengan data mutasi & barang terbaru
        res.status(201).json({
            success: true,
            message: `Mutasi stok tipe ${tipe} berhasil dicatat`,
            data: {
                mutasi: {
                    _id: mutasi._id,
                    barang_id: mutasi.barang_id,
                    tipe: mutasi.tipe,
                    jumlah: mutasi.jumlah,
                    keterangan: mutasi.keterangan,
                    stok_sebelum: mutasi.stok_sebelum,
                    stok_sesudah: mutasi.stok_sesudah,
                    tanggal_mutasi: mutasi.tanggal_mutasi,
                    created_at: mutasi.created_at
                },
                barang: {
                    _id: barang._id,
                    nama_barang: barang.nama_barang,
                    stok: barang.stok
                }
            }
        });

    } catch (err) {
        console.error('Error createMutasi:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat mutasi stok',
            error: err.message
        });
    }
};

// ===== Dapatkan Riwayat Mutasi Stok =====
exports.getMutasiByBarang = async (req, res) => {
    try {
        const { barang_id } = req.params;
        const { skip = 0, limit = 50, tipe } = req.query;

        if (!mongoose.Types.ObjectId.isValid(barang_id)) {
            return res.status(400).json({
                success: false,
                message: 'Format barang_id tidak valid'
            });
        }

        // Cek barang ada atau tidak
        const barang = await Barang.findById(barang_id);
        if (!barang) {
            return res.status(404).json({
                success: false,
                message: 'Barang tidak ditemukan'
            });
        }

        // Build query
        const query = { barang_id: barang_id };
        if (tipe && TIPE_MUTASI.includes(tipe)) {
            query.tipe = tipe;
        }

        // Dapatkan total
        const total = await MutasiStok.countDocuments(query);

        // Dapatkan data dengan pagination
        const mutasiList = await MutasiStok.find(query)
            .populate('created_by', 'nama email -_id')
            .sort({ tanggal_mutasi: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: mutasiList,
            pagination: {
                total,
                skip: parseInt(skip),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('Error getMutasiByBarang:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan riwayat mutasi',
            error: err.message
        });
    }
};

// ===== Dapatkan Semua Mutasi Stok =====
exports.getAllMutasi = async (req, res) => {
    try {
        const { skip = 0, limit = 50, tipe, barang_id } = req.query;

        // Build query
        const query = {};
        if (tipe && TIPE_MUTASI.includes(tipe)) {
            query.tipe = tipe;
        }
        if (barang_id && mongoose.Types.ObjectId.isValid(barang_id)) {
            query.barang_id = barang_id;
        }

        // Dapatkan total
        const total = await MutasiStok.countDocuments(query);

        // Dapatkan data dengan pagination
        const mutasiList = await MutasiStok.find(query)
            .populate('barang_id', 'nama_barang kode_barang')
            .populate('created_by', 'nama email -_id')
            .sort({ tanggal_mutasi: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: mutasiList,
            pagination: {
                total,
                skip: parseInt(skip),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('Error getAllMutasi:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan data mutasi',
            error: err.message
        });
    }
};

// ===== Dapatkan Statistik Stok =====
exports.getStokStats = async (req, res) => {
    try {
        // Stok yang habis
        const stokHabis = await Barang.countDocuments({ stok: 0 });

        // Stok menipis (< 10)
        const stokMenipis = await Barang.countDocuments({ stok: { $gt: 0, $lt: 10 } });

        // Total barang
        const totalBarang = await Barang.countDocuments();

        // Total nilai stok
        const nilaiStok = await Barang.aggregate([
            {
                $group: {
                    _id: null,
                    totalNilai: {
                        $sum: { $multiply: ['$harga_satuan', '$stok'] }
                    },
                    totalStok: { $sum: '$stok' }
                }
            }
        ]);

        // Barang terbaru ditambahkan
        const barangTerbaru = await Barang.find()
            .sort({ tgljam: -1 })
            .limit(5)
            .select('nama_barang stok harga_satuan tgljam -_id')
            .lean();

        res.json({
            success: true,
            data: {
                totalBarang,
                stokHabis,
                stokMenipis,
                nilaiStok: nilaiStok[0] || { totalNilai: 0, totalStok: 0 },
                barangTerbaru
            }
        });

    } catch (err) {
        console.error('Error getStokStats:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan statistik stok',
            error: err.message
        });
    }
};
