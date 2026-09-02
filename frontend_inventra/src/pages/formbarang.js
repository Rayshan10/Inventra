import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import '../styles/dashboard.css';

function BarangManagement() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [barangList, setBarangList] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    _id: null,
    kode_barang: '',
    nama_barang: '',
    kategori: '',
    harga_satuan: '',
    harga_pak: '',
    stok: '',
  });

  // Fetch barang list
  const fetchBarang = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/barang?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        setBarangList(res.data.data);
        setFilteredBarang(res.data.data);
      }
    } catch (err) {
      console.error('Error fetch barang:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      setError('Gagal memuat data barang');
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

    // Cek jika ada edit data di localStorage
    const editData = localStorage.getItem('editBarang');
    if (editData) {
      setForm(JSON.parse(editData));
      setEditing(true);
      setShowForm(true);
      localStorage.removeItem('editBarang');
    }

    fetchBarang();
  }, [user]);

  useEffect(() => {
    let filtered = barangList;

    if (search) {
      filtered = filtered.filter(item =>
        item.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
        item.kode_barang.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (kategoriFilter) {
      filtered = filtered.filter(item => item.kategori === kategoriFilter);
    }

    setFilteredBarang(filtered);
  }, [search, kategoriFilter, barangList]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      if (editing) {
        // Update
        const res = await axios.put(`/api/barang/${form._id}`, {
          nama_barang: form.nama_barang,
          kategori: form.kategori,
          harga_satuan: Number(form.harga_satuan),
          harga_pak: Number(form.harga_pak),
          stok: Number(form.stok)
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data.success) {
          setMessage('✅ Barang berhasil diperbarui');
          fetchBarang();
          resetForm();
          setShowForm(false);
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        // Create
        const res = await axios.post('/api/barang', form, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data.success) {
          setMessage('✅ Barang berhasil ditambahkan');
          fetchBarang();
          resetForm();
          setShowForm(false);
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (err) {
      console.error('Error submit:', err);
      setError(err.response?.data?.message || (editing ? '❌ Gagal memperbarui barang' : '❌ Gagal menambahkan barang'));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      _id: null,
      kode_barang: '',
      nama_barang: '',
      kategori: '',
      harga_satuan: '',
      harga_pak: '',
      stok: '',
    });
    setEditing(false);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`/api/barang/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data.success) {
          setMessage('✅ ' + res.data.message);
          fetchBarang();
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error delete:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          return;
        }
        setError(err.response?.data?.message || '❌ Gagal menghapus barang');
      }
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setForm(item);
    setEditing(true);
    setShowForm(true);
    setMessage('');
    setError('');
  };

  // Get kategori options
  const kategoriOptions = [...new Set(barangList.map(item => item.kategori).filter(Boolean))];

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Get stok status
  const getStokStatus = (stok) => {
    if (stok === 0) return { status: 'Habis', class: 'status-habis', icon: '❌' };
    if (stok < 10) return { status: 'Menipis', class: 'status-menipis', icon: '⚠️' };
    return { status: 'Aman', class: 'status-aman', icon: '✅' };
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        {/* Header */}
        <div className="content-header">
          <h2>Kelola Barang</h2>
          <span className="user-greeting">Halo, {user?.nama}</span>
        </div>

        {/* Messages */}
        {message && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        {!showForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-tabs">
              <button className="tab-button active">📋 Daftar Barang</button>
              <button
                className="tab-button"
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                }}
              >
                ➕ Tambah Barang Baru
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card form-container" style={{ marginBottom: '30px' }}>
            <h3>{editing ? '✏️ Edit Barang' : '➕ Tambah Barang Baru'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="kode_barang">Kode Barang {editing ? '(tidak bisa diubah)' : ''}</label>
                  <input
                    id="kode_barang"
                    type="text"
                    className="form-control"
                    placeholder="Masukkan kode barang"
                    value={form.kode_barang}
                    onChange={(e) => setForm({ ...form, kode_barang: e.target.value })}
                    disabled={editing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nama_barang">Nama Barang *</label>
                  <input
                    id="nama_barang"
                    type="text"
                    className="form-control"
                    placeholder="Masukkan nama barang"
                    value={form.nama_barang}
                    onChange={(e) => setForm({ ...form, nama_barang: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="kategori">Kategori *</label>
                  <select
                    id="kategori"
                    className="form-control"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriOptions.map((kat, idx) => (
                      <option key={idx} value={kat}>{kat}</option>
                    ))}
                    <option value="Alat Tulis">Alat Tulis</option>
                    <option value="Buku Tulis">Buku Tulis</option>
                    <option value="Alat Gambar">Alat Gambar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="harga_satuan">Harga Satuan *</label>
                  <input
                    id="harga_satuan"
                    type="number"
                    className="form-control"
                    placeholder="Masukkan harga satuan"
                    value={form.harga_satuan}
                    onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="harga_pak">Harga Pak *</label>
                  <input
                    id="harga_pak"
                    type="number"
                    className="form-control"
                    placeholder="Masukkan harga pak"
                    value={form.harga_pak}
                    onChange={(e) => setForm({ ...form, harga_pak: e.target.value })}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stok">Stok {editing ? '' : '(Awal)'} *</label>
                  <input
                    id="stok"
                    type="number"
                    className="form-control"
                    placeholder="Masukkan jumlah stok"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="btn-group">
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? '⏳ Memproses...' : (editing ? '💾 Simpan Perubahan' : '💾 Tambah Barang')}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Daftar Barang */}
        {!showForm && (
          <div className="card">
            <div className="card-header">
              <h3>📦 Daftar Barang</h3>
              <button
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                }}
                className="btn btn-sm btn-primary"
              >
                ➕ Tambah Barang Baru
              </button>
            </div>

            <div className="filter-bar">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Cari barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="form-control"
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {kategoriOptions.map((kategori, idx) => (
                  <option key={idx} value={kategori}>{kategori}</option>
                ))}
              </select>
            </div>

            <div className="table-container">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  ⏳ Memuat data barang...
                </div>
              ) : filteredBarang.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama</th>
                      <th>Kategori</th>
                      <th>Harga Satuan</th>
                      <th>Harga Pak</th>
                      <th>Stok</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBarang.map(item => {
                      const stokStatus = getStokStatus(item.stok);
                      return (
                        <tr key={item._id}>
                          <td><strong>{item.kode_barang}</strong></td>
                          <td>{item.nama_barang}</td>
                          <td>{item.kategori}</td>
                          <td>{formatCurrency(item.harga_satuan)}</td>
                          <td>{formatCurrency(item.harga_pak)}</td>
                          <td><strong>{item.stok}</strong></td>
                          <td>
                            <span className={`badge ${stokStatus.class}`}>
                              {stokStatus.icon} {stokStatus.status}
                            </span>
                          </td>
                          <td className="table-actions">
                            <button
                              onClick={() => handleEdit(item)}
                              className="btn btn-sm btn-secondary"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="btn btn-sm btn-danger"
                            >
                              🗑️ Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  {search || kategoriFilter
                    ? '❌ Tidak ada barang yang sesuai dengan filter'
                    : '📭 Belum ada data barang. Mulai dengan tambah barang baru!'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BarangManagement;