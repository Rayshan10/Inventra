const mongoose = require('mongoose');

const mutasiStokSchema = new mongoose.Schema({
    barang_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barang',
        required: true
    },
    tipe: {
        type: String,
        enum: ['masuk', 'keluar', 'opname', 'retur'],
        required: true
    },
    jumlah: {
        type: Number,
        required: true,
        min: 1
    },
    keterangan: {
        type: String,
        required: true
    },
    stok_sebelum: {
        type: Number,
        required: true
    },
    stok_sesudah: {
        type: Number,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tanggal_mutasi: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'mutasi_stok'
});

// Index untuk query cepat
mutasiStokSchema.index({ barang_id: 1, tanggal_mutasi: -1 });
mutasiStokSchema.index({ created_by: 1 });

module.exports = mongoose.model('MutasiStok', mutasiStokSchema);
