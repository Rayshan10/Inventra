import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, UserRound, UserPlus } from 'lucide-react';
import '../styles/formstyle.css';

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ nama: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(false);

        try {
            const res = await axios.post('/api/auth/register', form);
            setMessage(res.data.message);
            setError(false);

            // ✅ Simpan email ke localStorage agar diisi otomatis di verifikasi
            localStorage.setItem('pending_email', form.email);

            // ✅ Arahkan user ke halaman verifikasi OTP
            setTimeout(() => navigate('/verify'), 1000);
        } catch (err) {
            setError(true);
            setMessage(err.response?.data?.message || 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="auth-brand-mark" aria-hidden="true"><BookOpen size={34} /></div>
                <div className="login-header">
                    <h2>Daftar Akun</h2>
                    <p>Buat akun baru untuk mulai mengelola inventaris</p>
                </div>

                {message && (
                    <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="nama">Nama Lengkap</label>
                        <div className="input-with-icon">
                            <UserRound size={18} className="field-icon" />
                            <input
                                id="nama"
                                type="text"
                                placeholder="Masukkan nama lengkap Anda"
                                value={form.nama}
                                onChange={e => setForm({ ...form, nama: e.target.value })}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="field-icon" />
                            <input
                                id="email"
                                type="email"
                                placeholder="Masukkan email Anda"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <LockKeyhole size={18} className="field-icon" />
                            <input
                                id="password"
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Buat password minimal 6 karakter"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                className="form-input"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                            >
                                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>



                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating account...
                            </>
                        ) : (
                            <><UserPlus size={18} /> DAFTAR</>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Sudah punya akun? <a href="/" className="signup-link">Masuk</a></p>
                </div>
            </div>
        </div>
    );
}

export default Register;