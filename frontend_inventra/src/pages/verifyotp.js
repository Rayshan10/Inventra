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
                <div className="login-header">
                    <h2>Verify Your Account</h2>
                    <p>Enter the OTP sent to your email</p>
                </div>

                {message && (
                    <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Registered Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="otp">Verification Code</label>
                        <input
                            id="otp"
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="form-input"
                            maxLength="6"
                            pattern="\d{6}"
                            inputMode="numeric"
                        />
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
                            'Verify Account'
                        )}
                    </button>
                </form>

                <div className="otp-resend">
                    <p>Didn't receive the code?</p>
                    <button 
                        onClick={handleResend} 
                        disabled={loading || resendDisabled}
                        className="resend-button"
                    >
                        {resendDisabled ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                    </button>
                </div>

                <div className="login-footer">
                    <p><a href="/" className="signup-link">Back to Login</a></p>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;