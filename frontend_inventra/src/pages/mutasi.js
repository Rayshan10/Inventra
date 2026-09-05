import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import '../styles/dashboard.css';

function MutasiStok() {
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [barangList, setBarangList] = useState([]);
    const [mutasiList, setMutasiList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        barang_id: '',
        tipe: 'masuk',
        jumlah: '',
        keterangan: '',
        tanggal_mutasi: new Date().toISOString().split('T')[0]
    });

    // Fetch barang list
    const fetchBarang = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/barang?limit=1000', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setBarangList(res.data.data);
            }
        } catch (err) {
            console.error('Error fetch barang:', err);
        }
    };

    // Fetch mutasi history
    const fetchMutasi = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/mutasi?limit=50', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setMutasiList(res.data.data);
            }
        } catch (err) {
            console.error('Error fetch mutasi:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) {
            window.location.href = '/';
            return;
        }
        fetchBarang();
        fetchMutasi();
    }, [user]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validasi
        if (!form.barang_id || !form.tipe || !form.jumlah || !form.keterangan) {
            setError('Semua field harus diisi');
            return;
        }

        if (form.jumlah <= 0) {
            setError('Jumlah harus lebih besar dari 0');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/mutasi', {
                barang_id: form.barang_id,
                tipe: form.tipe,
                jumlah: Number(form.jumlah),
                keterangan: form.keterangan,
                tanggal_mutasi: form.tanggal_mutasi
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setMessage(res.data.message);
                setForm({
                    barang_id: '',
                    tipe: 'masuk',
                    jumlah: '',
                    keterangan: '',
                    tanggal_mutasi: new Date().toISOString().split('T')[0]
                });
                setShowForm(false);
                fetchMutasi(); // Refresh list
            }
        } catch (err) {
            console.error('Error create mutasi:', err);
            setError(err.response?.data?.message || 'Gagal membuat mutasi stok');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get tipe badge
    const getTipeBadge = (tipe) => {
        const tipeBadges = {
            masuk: { label: 'Masuk', class: 'badge-success' },
            keluar: { label: 'Keluar', class: 'badge-warning' },
            opname: { label: 'Opname', class: 'badge-info' },
            retur: { label: 'Retur', class: 'badge-secondary' }
        };
        const badge = tipeBadges[tipe] || { label: tipe, class: 'badge-default' };
        return <span className={`badge ${badge.class}`}>{badge.label}</span>;
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="content">
                {/* Header */}
                <div className="content-header">
                    <h2>Mutasi Stok</h2>
                    <span className="user-greeting">Halo, {user?.nama}</span>
                </div>

                {/* Alert Messages */}
                {message && (
                    <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                        ✅ {message}
                    </div>
                )}
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                        ❌ {error}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-tabs">
                        <button
                            className={`tab-button ${!showForm ? 'active' : ''}`}
                            onClick={() => setShowForm(false)}
                        >
                            📊 Riwayat Mutasi
                        </button>
                        <button
                            className={`tab-button ${showForm ? 'active' : ''}`}
                            onClick={() => setShowForm(true)}
                        >
                            ➕ Buat Mutasi Baru
                        </button>
                    </div>
                </div>

                {/* Form Mutasi */}
                {showForm && (
                    <div className="card form-container" style={{ marginBottom: '30px' }}>
                        <h3>Buat Mutasi Stok Baru</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                {/* Barang Selection */}
                                <div className="form-group">
                                    <label htmlFor="barang_id">Pilih Barang *</label>
                                    <select
                                        id="barang_id"
                                        className="form-control"
                                        value={form.barang_id}
                                        onChange={(e) => setForm({ ...form, barang_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Pilih Barang --</option>
                                        {barangList.map(barang => (
                                            <option key={barang._id} value={barang._id}>
                                                {barang.kode_barang} - {barang.nama_barang} (Stok: {barang.stok})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tipe Mutasi */}
                                <div className="form-group">
                                    <label htmlFor="tipe">Tipe Mutasi *</label>
                                    <select
                                        id="tipe"
                                        className="form-control"
                                        value={form.tipe}
                                        onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                                        required
                                    >
                                        <option value="masuk">🟢 Barang Masuk</option>
                                        <option value="keluar">🔴 Barang Keluar</option>
                                        <option value="opname">📊 Opname Stok</option>
                                        <option value="retur">🔄 Retur Barang</option>
                                    </select>
                                </div>

                                {/* Jumlah */}
                                <div className="form-group">
                                    <label htmlFor="jumlah">Jumlah *</label>
                                    <input
                                        id="jumlah"
                                        type="number"
                                        className="form-control"
                                        placeholder="Masukkan jumlah"
                                        value={form.jumlah}
                                        onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                                        min="1"
                                        required
                                    />
                                </div>

                                {/* Tanggal Mutasi */}
                                <div className="form-group">
                                    <label htmlFor="tanggal_mutasi">Tanggal Mutasi</label>
                                    <input
                                        id="tanggal_mutasi"
                                        type="date"
                                        className="form-control"
                                        value={form.tanggal_mutasi}
                                        onChange={(e) => setForm({ ...form, tanggal_mutasi: e.target.value })}
                                    />
                                </div>

                                {/* Keterangan */}
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label htmlFor="keterangan">Keterangan *</label>
                                    <textarea
                                        id="keterangan"
                                        className="form-control"
                                        placeholder="Masukkan alasan atau keterangan mutasi"
                                        value={form.keterangan}
                                        onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="btn-group">
                                <button type="submit" className="btn btn-primary">
                                    💾 Simpan Mutasi
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setForm({
                                            barang_id: '',
                                            tipe: 'masuk',
                                            jumlah: '',
                                            keterangan: '',
                                            tanggal_mutasi: new Date().toISOString().split('T')[0]
                                        });
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Riwayat Mutasi */}
                {!showForm && (
                    <div className="card">
                        <div className="card-header">
                            <h3>📊 Riwayat Mutasi Stok</h3>
                            <button
                                onClick={() => setShowForm(true)}
                                className="btn btn-sm btn-primary"
                            >
                                ➕ Buat Mutasi Baru
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '30px' }}>
                                <p>Memuat riwayat mutasi...</p>
                            </div>
                        ) : mutasiList.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Barang</th>
                                            <th>Tipe</th>
                                            <th>Jumlah</th>
                                            <th>Stok Sebelum</th>
                                            <th>Stok Sesudah</th>
                                            <th>Keterangan</th>
                                            <th>Oleh</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mutasiList.map(mutasi => (
                                            <tr key={mutasi._id}>
                                                <td>{formatDate(mutasi.tanggal_mutasi)}</td>
                                                <td>
                                                    <strong>{mutasi.barang_id.kode_barang}</strong><br />
                                                    <small>{mutasi.barang_id.nama_barang}</small>
                                                </td>
                                                <td>{getTipeBadge(mutasi.tipe)}</td>
                                                <td><strong>{mutasi.jumlah}</strong></td>
                                                <td>{mutasi.stok_sebelum}</td>
                                                <td><strong>{mutasi.stok_sesudah}</strong></td>
                                                <td>{mutasi.keterangan}</td>
                                                <td>
                                                    <small>{mutasi.created_by.nama}</small><br />
                                                    <small className="text-muted">{mutasi.created_by.email}</small>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px' }}>
                                <p>Belum ada riwayat mutasi stok</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn btn-primary"
                                    style={{ marginTop: '10px' }}
                                >
                                    ➕ Buat Mutasi Pertama
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MutasiStok;
