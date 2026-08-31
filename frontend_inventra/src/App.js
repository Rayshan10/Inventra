import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/home';         // Dashboard dengan KPI
import BarangManagement from './pages/formbarang'; // Kelola Barang (list + form)
import MutasiStok from './pages/mutasi';     // Mutasi Stok (barang masuk/keluar)
import VerifyOtp from './pages/verifyotp';   // Verifikasi OTP

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOtp />} />

        {/* Proteksi halaman */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/barang" element={
          <ProtectedRoute>
            <BarangManagement />
          </ProtectedRoute>
        } />

        <Route path="/mutasi" element={
          <ProtectedRoute>
            <MutasiStok />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

