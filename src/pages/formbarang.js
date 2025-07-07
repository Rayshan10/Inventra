import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import '../styles/dashboard.css';

function FormBarang() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [editing, setEditing] = useState(false);
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
    if (!user) return window.location.href = '/';

    // Cek apakah ada data edit yang dikirim dari localStorage
    const editData = localStorage.getItem('editBarang');
    if (editData) {
      setForm(JSON.parse(editData));
      setEditing(true);
      localStorage.removeItem('editBarang');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/barang/${form._id}`, form);
        alert('Barang berhasil diperbarui');
      } else {
        await axios.post('/api/barang', form);
        alert('Barang ditambahkan');
      }

      // Reset form setelah simpan
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
      alert(editing ? 'Gagal memperbarui barang' : 'Gagal menambahkan barang');
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <h2>{editing ? 'Edit Barang' : 'Tambah Barang'} - Halo, {user?.nama}</h2>
        <form className="barang-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Kode Barang" value={form.kode_barang}
            onChange={(e) => setForm({ ...form, kode_barang: e.target.value })} required />
          <input type="text" placeholder="Nama Barang" value={form.nama_barang}
            onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} required />
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} required>
            <option value="">Pilih Kategori</option>
            <option value="Alat Tulis">Alat Tulis</option>
            <option value="Buku Tulis">Buku Tulis</option>
          </select>
          <input type="number" placeholder="Harga Satuan" value={form.harga_satuan}
            onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })} required />
          <input type="number" placeholder="Harga Pak" value={form.harga_pak}
            onChange={(e) => setForm({ ...form, harga_pak: e.target.value })} required />
          <input type="number" placeholder="Stok" value={form.stok}
            onChange={(e) => setForm({ ...form, stok: e.target.value })} required />

          <button type="submit">
            {editing ? 'Simpan Perubahan' : 'Tambah Barang'}
          </button>

          {editing && (
            <button type="button" onClick={() => {
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
            }}>
              Batal Edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default FormBarang;
