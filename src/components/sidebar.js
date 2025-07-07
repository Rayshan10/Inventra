import { Link } from 'react-router-dom';
import '../styles/dashboard.css'; // Assuming you have a CSS file for styling

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Tokobuku</h2>
      <ul>
        <li><Link to="/home">Dashboard</Link></li>
        <li><Link to="/barang">Form Barang</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
