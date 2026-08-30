const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import User model untuk verifyOTP

// Export verifyToken sebagai default export untuk konsistensi dengan import di routes
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token tidak ditemukan' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ 
            success: false,
            message: 'Token tidak valid' 
        });
    }
};

// Fungsi verifyOTP (jika masih dibutuhkan)
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.otp_code !== otp) {
            return res.status(400).json({ 
                success: false,
                message: 'Kode OTP salah atau tidak ditemukan' 
            });
        }

        user.verified = true;
        user.otp_code = null; // Set ke null setelah verifikasi
        await user.save();

        // Kembalikan data user tanpa password dan otp_code
        const userResponse = {
            _id: user._id,
            nama: user.nama,
            email: user.email,
            verified: user.verified,
            // otp_code tidak dikembalikan
        };

        res.json({ 
            success: true,
            message: 'Verifikasi berhasil',
            user: userResponse 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: 'Verifikasi gagal', 
            error: err.message 
        });
    }
};

// Export default untuk verifyToken agar bisa diimport langsung
module.exports = verifyToken;

// Export named exports untuk fungsi lain
module.exports.verifyToken = verifyToken;
module.exports.verifyOTP = verifyOTP;