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
exports.verifyOtp = async (req, res) => {
    try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp_code !== otp) {
        return res.status(400).json({ message: 'Kode OTP salah atau tidak ditemukan' });
    }

    user.verified = true;
    user.otp_code = null;
    await user.save();

    res.json({ message: 'Verifikasi berhasil, silakan login' });
    } catch (err) {
    res.status(500).json({ message: 'Verifikasi gagal', error: err.message });
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

    res.json({
        message: 'Login berhasil',
        token,
        user: {
        id: user._id,
        nama: user.nama,
        email: user.email
        }
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
