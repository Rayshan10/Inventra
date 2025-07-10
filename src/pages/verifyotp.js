import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/formstyle.css';

function VerifyOtp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('pending_email');
        if (storedEmail) setEmail(storedEmail);
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

        try {
            const res = await axios.post('/api/auth/resend', { email });
            setMessage(res.data.message);
            setError(false);
        } catch (err) {
            setError(true);
            setMessage(err.response?.data?.message || 'Gagal mengirim ulang OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Verifikasi Akun</h2>
            {message && (
                <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email terdaftar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Kode OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>Verifikasi</button>
            </form>

            <button onClick={handleResend} disabled={loading} style={{ marginTop: '10px' }}>
                Kirim Ulang OTP
            </button>

            {loading && <div className="loader">Memproses...</div>}

            <p><a href="/">Kembali ke Login</a></p>
        </div>
    );
}

export default VerifyOtp;
