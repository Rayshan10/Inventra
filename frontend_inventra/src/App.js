import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';         // Tabel Barang
import FormBarang from './pages/formbarang'; // Form Tambah/Edit Barang
import VerifyOtp from './pages/verifyotp';   // Halaman OTP (buat baru)

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
            <Home />
          </ProtectedRoute>
        } />

        <Route path="/barang" element={
          <ProtectedRoute>
            <FormBarang />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

