import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

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
      </ul>
    </div>
  );
}

export default Sidebar;