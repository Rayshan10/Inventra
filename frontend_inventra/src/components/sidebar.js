import { Link, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/home', icon: '🏠', label: 'Dashboard' },
    { path: '/barang', icon: '📦', label: 'Form Barang' },
    { path: '/', icon: '🚪', label: 'Logout' }
  ];

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