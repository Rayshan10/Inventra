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
                <div className="login-header">
                    <h2>Create Your Account</h2>
                    <p>Fill in your details to get started</p>
                </div>

                {message && (
                    <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="nama">Full Name</label>
                        <input
                            id="nama"
                            type="text"
                            placeholder="Enter your full name"
                            value={form.nama}
                            onChange={e => setForm({ ...form, nama: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                id="password"
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Create a password"
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
                                {passwordVisible ? '🙈' : '👁️'}
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
                            'Register'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Already have an account? <a href="/" className="signup-link">Sign in</a></p>
                </div>
            </div>
        </div>
    );
}

export default Register;