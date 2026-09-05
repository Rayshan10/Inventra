import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const menuItems = [
    { path: '/home', icon: '🏠', label: 'Dashboard' },
    { path: '/barang', icon: '📦', label: 'Kelola Barang' },
    { path: '/mutasi', icon: '📊', label: 'Mutasi Stok' },
    { path: '/', icon: '🚪', label: 'Logout', logout: true }
  ];

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('editBarang');
    navigate('/', { replace: true });
  };

  const handleExport = async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const response = await axios.get('/api/barang/export', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/csv')) {
        throw new Error('Respons laporan tidak valid');
      }
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'laporan-barang.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setReportError(error.response?.status === 401 ? 'Sesi berakhir' : 'Unduh gagal');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2><span>Tokobuku</span></h2>
      </div>
      <ul>
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={item.logout ? handleLogout : undefined}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <button className="sidebar-action" onClick={handleExport} disabled={reportLoading}>
            <span>📥</span>
            <span>{reportLoading ? 'Menyiapkan...' : 'Unduh Laporan'}</span>
          </button>
          {reportError && <small className="sidebar-error">{reportError}</small>}
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;