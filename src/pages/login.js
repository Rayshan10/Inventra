import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/formstyle.css';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(false);

    try {
        const res = await axios.post(`${process.env.REACT_APP_API}/auth/login`, form);
        setMessage(res.data.message);
        setError(false);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setTimeout(() => navigate('/home'), 1000);
    } catch (err) {
        setError(true);
        setMessage(err.response?.data?.message || 'Login gagal');
    } finally {
        setLoading(false);
    }
    };

    return (
    <div>
        <h2>Login Akun</h2>
        {message && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
            {message}
        </div>
        )}
        <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />

        <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />

        <button type="submit" disabled={loading}>Login</button>
        </form>

        {loading && <div className="loader">Memproses login...</div>}
        <p>Belum punya akun? <a href="/register">Daftar</a></p>
    </div>
    );
}

export default Login;
