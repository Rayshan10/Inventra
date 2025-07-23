const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmailVerification = require('../utils/sendemail'); // pastikan ini benar

// Register
exports.register = async (req, res) => {
    try {
        const { nama, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000); // OTP 6-digit

        const user = new User({
            nama,
            email,
            password: hashedPassword,
            verified: false,
            otp_code: otp
        });

        await user.save();
        await sendEmailVerification(email, otp);

        res.status(201).json({ message: 'Registrasi berhasil, kode OTP telah dikirim ke email' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Verifikasi OTP
// Verifikasi OTP - Diperbaiki untuk konsistensi response
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        console.log('Verify OTP request:', { email, otp }); // Debug log

        // Validasi input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email dan OTP harus diisi'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email tidak ditemukan'
            });
        }

        console.log('Found user:', { id: user._id, email: user.email, otp_code: user.otp_code }); // Debug log

        // Konversi OTP ke string untuk perbandingan yang aman
        if (!user.otp_code || user.otp_code.toString() !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Kode OTP salah atau tidak ditemukan'
            });
        }

        // Update user status
        user.verified = true;
        user.otp_code = null; // Clear OTP setelah verifikasi berhasil
        await user.save();

        console.log('User verified successfully:', user._id); // Debug log

        // Response konsisten dengan format yang diharapkan Flutter
        res.status(200).json({
            success: true,
            message: 'Verifikasi berhasil, silakan login',
            user: {
                _id: user._id.toString(), // Pastikan ID adalah string
                nama: user.nama || '', // Fallback ke empty string jika null
                email: user.email || '', // Fallback ke empty string jika null
                verified: user.verified || false // Fallback ke false jika null
            }
        });

    } catch (err) {
        console.error('Error in verifyOtp:', err); // Debug log
        res.status(500).json({
            success: false,
            message: 'Verifikasi gagal',
            error: err.message
        });
    }
};

// Kirim ulang OTP
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Email tidak ditemukan' });
        if (user.verified) return res.status(400).json({ message: 'Akun sudah diverifikasi' });

        const newOtp = Math.floor(100000 + Math.random() * 900000);
        user.otp_code = newOtp;
        await user.save();

        await sendEmailVerification(email, newOtp);

        res.json({ message: 'Kode OTP baru berhasil dikirim' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengirim ulang OTP', error: err.message });
    }
};


// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Akun tidak ditemukan' });

        if (!user.verified) return res.status(403).json({ message: 'Akun belum diverifikasi' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Password salah' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set header tambahan
        res.header('Access-Control-Expose-Headers', 'Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');

        res.status(200).json({
            success: true,
            token: token,
            user: {
                _id: user._id,
                nama: user.nama,
                email: user.email,
                verified: user.verified
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Login gagal', error: err.message });
    }
};

// Ambil semua user (opsional)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal ambil user', error: err.message });
    }
};

// Perbaikan untuk fungsi getProfile
exports.getProfile = async (req, res) => {
    try {
        // PERBAIKAN: Gunakan req.userId bukan req.user.id 
        // karena di middleware authmiddleware.js Anda set req.userId = decoded.userId
        const user = await User.findById(req.userId)
            .select('-password -otp_code'); // Sesuaikan dengan field di model Anda

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                nama: user.nama,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
