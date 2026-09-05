import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import '../styles/formstyle.css';

function VerifyOtp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        const storedEmail = localStorage.getItem('pending_email');
        if (storedEmail) setEmail(storedEmail);

        // Start countdown for resend OTP
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setResendDisabled(false);
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError(false);
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/verify', { email, otp });
            setMessage(res.data.message);
            setError(false);
            localStorage.removeItem('pending_email');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(true);
            setMessage(err.response?.data?.message || 'Verifikasi gagal');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setMessage('');
        setError(false);
        setLoading(true);
        setResendDisabled(true);
        setCountdown(30);

        try {
            const res = await axios.post('/api/auth/resend', { email });
            setMessage(res.data.message);
            setError(false);

            // Start countdown again
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setResendDisabled(false);
                        return 30;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            setError(true);
            setMessage(err.response?.data?.message || 'Gagal mengirim ulang OTP');
            setResendDisabled(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="auth-brand-mark" aria-hidden="true"><BookOpen size={34} /></div>
                <div className="login-header">
                    <h2>Verifikasi OTP</h2>
                    <p>Masukkan kode 6 digit yang dikirim ke email Anda</p>
                </div>

                {message && (
                    <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Terdaftar</label>
                        <div className="input-with-icon">
                            <MailCheck size={18} className="field-icon" />
                            <input
                                id="email"
                                type="email"
                                placeholder="Masukkan email terdaftar"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="otp">Kode OTP</label>
                        <div className="input-with-icon">
                            <KeyRound size={18} className="field-icon" />
                            <input
                                id="otp"
                                type="text"
                                placeholder="Masukkan kode 6 digit"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="form-input"
                                maxLength="6"
                                pattern="\d{6}"
                                inputMode="numeric"
                            />
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
                                Verifying...
                            </>
                        ) : (
                            <><ShieldCheck size={18} /> VERIFIKASI</>
                        )}
                    </button>
                </form>

                <div className="otp-resend">
                    <p>Belum menerima kode?</p>
                    <button
                        onClick={handleResend}
                        disabled={loading || resendDisabled}
                        className="resend-button"
                    >
                        {resendDisabled ? `Kirim ulang (${countdown} dtk)` : 'Kirim ulang OTP'}
                    </button>
                </div>

                <div className="login-footer">
                    <p><a href="/" className="signup-link">Kembali ke login</a></p>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;