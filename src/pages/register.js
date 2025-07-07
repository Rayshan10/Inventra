import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
    nama: '',
    email: '',
    password: ''
    });

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${process.env.REACT_APP_API}/auth/register`, form);
        alert(res.data.message);
        navigate('/');
    } catch (err) {
        console.error('❌ Register error:', err.response);
        alert(err.response?.data?.message || 'Registrasi gagal');
    }
    };

    return (
    <div style={{ padding: '2rem' }}>
        <h2>Registrasi Akun</h2>
        <form onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder="Nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
        /><br />

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

        <button type="submit">Daftar</button>
        </form>
        <p>Sudah punya akun? <a href="/">Login</a></p>
    </div>
    );
}

export default Register;
