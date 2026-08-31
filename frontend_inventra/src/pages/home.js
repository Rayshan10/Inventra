import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import '../styles/dashboard.css';

function Dashboard() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [stats, setStats] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch stats dari dashboard
  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/mutasi/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetch stats:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      setError('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  // Fetch barang terbaru juga dengan endpoint barang
  const fetchBarangTerbaru = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/barang?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        setBarangList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetch barang:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      window.location.href = '/';
      return;
    }

    fetchStats();
    fetchBarangTerbaru();
  }, [user]);

  // Fungsi untuk format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Fungsi untuk get status stok
  const getStokStatus = (stok) => {
    if (stok === 0) return { status: 'Habis', class: 'status-habis', icon: '❌' };
    if (stok < 10) return { status: 'Menipis', class: 'status-menipis', icon: '⚠️' };
    return { status: 'Aman', class: 'status-aman', icon: '✅' };
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Memuat dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        {/* Header */}
        <div className="content-header">
          <h2>Dashboard</h2>
          <span className="user-greeting">Selamat datang, {user?.nama}!</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* KPI Cards */}
        {stats && (
          <div className="kpi-grid">
            {/* Total Barang */}
            <div className="kpi-card kpi-total">
              <div className="kpi-icon">📦</div>
              <div className="kpi-content">
                <h3>Total Barang</h3>
                <p className="kpi-value">{stats.totalBarang}</p>
                <span className="kpi-label">SKU dalam sistem</span>
              </div>
            </div>

            {/* Stok Aman */}
            <div className="kpi-card kpi-aman">
              <div className="kpi-icon">✅</div>
              <div className="kpi-content">
                <h3>Stok Aman</h3>
                <p className="kpi-value">{stats.totalBarang - stats.stokHabis - stats.stokMenipis}</p>
                <span className="kpi-label">Stok tersedia cukup</span>
              </div>
            </div>

            {/* Stok Menipis */}
            <div className="kpi-card kpi-menipis">
              <div className="kpi-icon">⚠️</div>
              <div className="kpi-content">
                <h3>Stok Menipis</h3>
                <p className="kpi-value">{stats.stokMenipis}</p>
                <span className="kpi-label">Perlu segera restock</span>
              </div>
            </div>

            {/* Stok Habis */}
            <div className="kpi-card kpi-habis">
              <div className="kpi-icon">❌</div>
              <div className="kpi-content">
                <h3>Stok Habis</h3>
                <p className="kpi-value">{stats.stokHabis}</p>
                <span className="kpi-label">Harus dipesan ulang</span>
              </div>
            </div>

            {/* Nilai Total Stok */}
            <div className="kpi-card kpi-nilai">
              <div className="kpi-icon">💰</div>
              <div className="kpi-content">
                <h3>Nilai Total Stok</h3>
                <p className="kpi-value-currency">
                  {formatCurrency(stats.nilaiStok.totalNilai || 0)}
                </p>
                <span className="kpi-label">{stats.nilaiStok.totalStok} unit</span>
              </div>
            </div>

            {/* Quick Action */}
            <div className="kpi-card kpi-action">
              <div className="kpi-icon">➕</div>
              <div className="kpi-content">
                <h3>Aksi Cepat</h3>
                <div className="quick-actions">
                  <a href="/barang" className="btn btn-sm btn-primary">Kelola Barang</a>
                  <a href="/mutasi" className="btn btn-sm btn-secondary">Mutasi Stok</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barang Terbaru */}
        {barangList.length > 0 && (
          <div className="card" style={{ marginTop: '30px' }}>
            <div className="card-header">
              <h3>📦 Barang Terbaru</h3>
            </div>
            <div className="table-container">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {barangList.map(barang => {
                    const stokStatus = getStokStatus(barang.stok);
                    return (
                      <tr key={barang._id}>
                        <td><strong>{barang.kode_barang}</strong></td>
                        <td>{barang.nama_barang}</td>
                        <td>{barang.kategori}</td>
                        <td>{formatCurrency(barang.harga_satuan)}</td>
                        <td><strong>{barang.stok}</strong></td>
                        <td>
                          <span className={`badge ${stokStatus.class}`}>
                            {stokStatus.icon} {stokStatus.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;