import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import '../styles/dashboard.css';

function BarangList() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [barang, setBarang] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBarang = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/barang', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response:', res.data); // Debug: lihat struktur response

      // Backend mengirim array langsung, bukan { data: array }
      setBarang(res.data);
      setFilteredBarang(res.data);
    } catch (err) {
      console.error('Error detail:', err);
      if (err.response?.status === 401) {
        alert('Token expired atau tidak valid. Silakan login kembali.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      alert('Gagal memuat data barang');
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
  }, [user]);

  useEffect(() => {
    let filtered = barang;

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
  }, [search, kategoriFilter, barang]);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/barang/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchBarang(); // Refresh data setelah delete
      } catch (err) {
        console.error('Error delete:', err);
        if (err.response?.status === 401) {
          alert('Token expired atau tidak valid. Silakan login kembali.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          return;
        }
        alert('Gagal menghapus barang');
      }
    }
  };

  const handleEdit = (item) => {
    localStorage.setItem('editBarang', JSON.stringify(item));
    window.location.href = '/barang';
  };

  const kategoriOptions = [...new Set(barang.map(item => item.kategori))];

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <div className="content-header">
          <h2>Daftar Barang</h2>
          <span className="user-greeting">Halo, {user?.nama}</span>
        </div>

        <div className="card">
          <div className="filter-bar">
            <input
              type="text"
              className="form-control"
              placeholder="Cari barang..."
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
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Memuat data...
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
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBarang.map(item => (
                    <tr key={item._id}>
                      <td>{item.kode_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{item.kategori}</td>
                      <td>Rp {Number(item.harga_satuan).toLocaleString()}</td>
                      <td>Rp {Number(item.harga_pak).toLocaleString()}</td>
                      <td>{item.stok}</td>
                      <td className="table-actions">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 12px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn btn-danger"
                          style={{ padding: '8px 12px' }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                {search || kategoriFilter ? 'Tidak ada barang yang sesuai dengan filter' : 'Belum ada data barang'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarangList;