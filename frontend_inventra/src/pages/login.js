import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

            // ✅ Simpan token & user info ke localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            setMessage(res.data.message);
            setError(false);

            // ✅ Arahkan ke halaman utama setelah login berhasil
            setTimeout(() => navigate('/home'), 1000);
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
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Please enter your credentials to login</p>
                    </div>

                    {message && (
                        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
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
                                    placeholder="Enter your password"
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

                        <div className="form-options">
                            <div className="remember-me">
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <a href="/forgot-password" className="forgot-password">Forgot password?</a>
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
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <a href="/register" className="signup-link">Sign up</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;