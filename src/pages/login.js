import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
    email: '',
    password: ''
    });

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${process.env.REACT_APP_API}/auth/login`, form);
        alert(res.data.message);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/home');
    } catch (err) {
        console.error('❌ Login error:', err.response);
        alert(err.response?.data?.message || 'Login gagal');
    }
    };

    return (
    <div style={{ padding: '2rem' }}>
        <h2>Login Akun</h2>
        <form onSubmit={handleSubmit}>
        <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
        /><br />

        <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
        /><br />

        <button type="submit">Login</button>
        </form>
        <p>Belum punya akun? <a href="/register">Daftar</a></p>
    </div>
    );
}

export default Login;
