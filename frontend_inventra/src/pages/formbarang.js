import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import '../styles/dashboard.css';

function FormBarang() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    kode_barang: '',
    nama_barang: '',
    kategori: '',
    harga_satuan: '',
    harga_pak: '',
    stok: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      window.location.href = '/';
      return;
    }

    const editData = localStorage.getItem('editBarang');
    if (editData) {
      setForm(JSON.parse(editData));
      setEditing(true);
      localStorage.removeItem('editBarang');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editing) {
        await axios.put(`/api/barang/${form._id}`, form);
        alert('Barang berhasil diperbarui');
      } else {
        await axios.post('/api/barang', form);
        alert('Barang berhasil ditambahkan');
      }

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
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || (editing ? 'Gagal memperbarui barang' : 'Gagal menambahkan barang'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <div className="content-header">
          <h2>{editing ? 'Edit Barang' : 'Tambah Barang Baru'}</h2>
          <span className="user-greeting">Halo, {user?.nama}</span>
        </div>

        <div className="card form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="kode_barang">Kode Barang</label>
                <input
                  id="kode_barang"
                  type="text"
                  className="form-control"
                  placeholder="Masukkan kode barang"
                  value={form.kode_barang}
                  onChange={(e) => setForm({ ...form, kode_barang: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nama_barang">Nama Barang</label>
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
                <label htmlFor="kategori">Kategori</label>
                <select
                  id="kategori"
                  className="form-control"
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Alat Tulis">Alat Tulis</option>
                  <option value="Buku Tulis">Buku Tulis</option>
                  <option value="Alat Gambar">Alat Gambar</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="harga_satuan">Harga Satuan</label>
                <input
                  id="harga_satuan"
                  type="number"
                  className="form-control"
                  placeholder="Masukkan harga satuan"
                  value={form.harga_satuan}
                  onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="harga_pak">Harga Pak</label>
                <input
                  id="harga_pak"
                  type="number"
                  className="form-control"
                  placeholder="Masukkan harga pak"
                  value={form.harga_pak}
                  onChange={(e) => setForm({ ...form, harga_pak: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stok">Stok</label>
                <input
                  id="stok"
                  type="number"
                  className="form-control"
                  placeholder="Masukkan jumlah stok"
                  value={form.stok}
                  onChange={(e) => setForm({ ...form, stok: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading"></span>
                    Memproses...
                  </>
                ) : (
                  editing ? 'Simpan Perubahan' : 'Tambah Barang'
                )}
              </button>

              {editing && (
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
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
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormBarang;