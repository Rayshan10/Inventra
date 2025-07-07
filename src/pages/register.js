import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/formstyle.css';

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ nama: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(false);

    try {
        const res = await axios.post(`${process.env.REACT_APP_API}/auth/register`, form);
        setMessage(res.data.message);
        setError(false);
        setTimeout(() => navigate('/'), 1000);
    } catch (err) {
        setError(true);
        setMessage(err.response?.data?.message || 'Registrasi gagal');
    } finally {
        setLoading(false);
    }
    };

    return (
    <div>
        <h2>Registrasi Akun</h2>
        {message && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
            {message}
        </div>
        )}
        <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nama" value={form.nama}
            onChange={e => setForm({ ...form, nama: e.target.value })} required />

        <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />

        <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />

        <button type="submit" disabled={loading}>Daftar</button>
        </form>

        {loading && <div className="loader">Memproses registrasi...</div>}
        <p>Sudah punya akun? <a href="/">Login</a></p>
    </div>
    );
}

export default Register;
