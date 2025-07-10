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

  const fetchBarang = async () => {
    const res = await axios.get('/api/barang');
    setBarang(res.data.data);
    setFilteredBarang(res.data.data);
  };

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token || !user) {
    window.location.href = '/';
    return;
  }
  fetchBarang();
}, []);


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
    if (window.confirm('Yakin ingin menghapus barang ini?')) {
      await axios.delete(`/api/barang/${id}`);
      fetchBarang();
    }
  };

  const handleEdit = (item) => {
    localStorage.setItem('editBarang', JSON.stringify(item));
    window.location.href = '/barang'; // ganti ke /form jika halaman formmu di situ
  };

  // Ambil semua kategori unik
  const kategoriOptions = [...new Set(barang.map(item => item.kategori))];

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <h2>Daftar Barang - {user?.nama}</h2>

        {/* Filter Bar */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Cari barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={kategoriFilter} onChange={(e) => setKategoriFilter(e.target.value)}>
            <option value="">Semua Kategori</option>
            {kategoriOptions.map((kategori, idx) => (
              <option key={idx} value={kategori}>{kategori}</option>
            ))}
          </select>
        </div>

        <table className="barang-table">
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
                <td>{item.harga_satuan}</td>
                <td>{item.harga_pak}</td>
                <td>{item.stok}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item._id)} style={{ marginLeft: 5 }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BarangList;
