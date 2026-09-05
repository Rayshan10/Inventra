const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmailVerification = require('../utils/sendemail'); // pastikan ini benar
const OTP_VALIDITY_MS = 5 * 60 * 1000;

// Register
exports.register = async (req, res) => {
    try {
        const { nama, email, password } = req.body;

        // Validasi input
        if (!nama || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, email, dan password harus diisi'
            });
        }

        // Cek email sudah terdaftar
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP 6 digit
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Buat user baru
        const user = new User({
            nama,
            email,
            password: hashedPassword,
            verified: false,
            otp_code: otp,
            otp_expires_at: new Date(Date.now() + OTP_VALIDITY_MS)
        });

        await user.save();

        // Kirim email OTP
        try {
            await sendEmailVerification(email, otp);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
            // Jangan stop registrasi jika email gagal
        }

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil. Kode OTP telah dikirim ke email Anda',
            data: {
                email: user.email,
                nama: user.nama
            }
        });
    } catch (err) {
        console.error('Error register:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mendaftar',
            error: err.message
        });
    }
};

// Verifikasi OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validasi input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email dan OTP harus diisi'
            });
        }

        // Cari user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email tidak ditemukan'
            });
        }

        // Validasi OTP (konversi ke string untuk keamanan)
        if (!user.otp_code || user.otp_code.toString() !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Kode OTP salah'
            });
        }

        if (!user.otp_expires_at || user.otp_expires_at.getTime() <= Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Kode OTP sudah kadaluarsa'
            });
        }

        // Update status verifikasi
        user.verified = true;
        user.otp_code = null; // Clear OTP
        user.otp_expires_at = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Verifikasi berhasil. Silakan login',
            data: {
                _id: user._id.toString(),
                nama: user.nama,
                email: user.email,
                verified: user.verified
            }
        });

    } catch (err) {
        console.error('Error verifyOtp:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memverifikasi OTP',
            error: err.message
        });
    }
};

// Kirim ulang OTP
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email harus diisi'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email tidak ditemukan'
            });
        }

        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: 'Akun sudah diverifikasi'
            });
        }

        // Generate OTP baru
        const newOtp = Math.floor(100000 + Math.random() * 900000);
        user.otp_code = newOtp;
        user.otp_expires_at = new Date(Date.now() + OTP_VALIDITY_MS);
        await user.save();

        // Kirim email
        try {
            await sendEmailVerification(email, newOtp);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
        }

        res.json({
            success: true,
            message: 'Kode OTP baru berhasil dikirim ke email Anda'
        });
    } catch (err) {
        console.error('Error resendOtp:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengirim ulang OTP',
            error: err.message
        });
    }
};


// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi'
            });
        }

        // Cari user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Akun tidak ditemukan'
            });
        }

        // Cek verifikasi
        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: 'Akun belum diverifikasi. Silakan verifikasi OTP terlebih dahulu'
            });
        }

        // Cek password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            success: true,
            message: 'Login berhasil',
            data: {
                token: token,
                user: {
                    _id: user._id,
                    nama: user.nama,
                    email: user.email,
                    verified: user.verified
                }
            }
        });
    } catch (err) {
        console.error('Error login:', err);
        res.status(500).json({
            success: false,
            message: 'Login gagal',
            error: err.message
        });
    }
};

// Ambil semua user (untuk admin only - bisa ditambah role check di future)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0, otp_code: 0 }).lean();
        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error('Error getAllUsers:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user',
            error: err.message
        });
    }
};

// Dapatkan profile user yang sedang login
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password -otp_code')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil profil',
            error: error.message
        });
    }
};
