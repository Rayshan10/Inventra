import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, LogIn } from 'lucide-react';
import '../styles/login.css';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
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
            const res = await axios.post('/api/auth/login', form);

            if (res.data.success) {
                // ✅ Simpan token & user info ke localStorage (format response baru)
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.data.user));

                setMessage(res.data.message);
                setError(false);

                // ✅ Arahkan ke halaman utama setelah login berhasil
                setTimeout(() => navigate('/home'), 1000);
            } else {
                setError(true);
                setMessage(res.data.message || 'Login gagal');
            }
        } catch (err) {
            setError(true);
            setMessage(err.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="">
                    <div className="login-brand-mark" aria-hidden="true">
                        <BookOpen size={42} strokeWidth={2.2} />
                    </div>
                    <div className="login-header">
                        <h1>TokoBuku</h1>
                        <p>Selamat datang kembali</p>
                    </div>

                    <div className="login-panel">
                        {message && (
                            <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <div className="input-with-icon">
                                    <Mail size={18} aria-hidden="true" />
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
                                    <LockKeyhole className="field-icon" size={18} aria-hidden="true" />
                                    <input
                                        id="password"
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder="Masukkan password Anda"
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
                                        Signing in...
                                    </>
                                ) : (
                                    <><LogIn size={18} /> MASUK</>
                                )}
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Belum punya akun? <a href="/register" className="signup-link">Daftar</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;