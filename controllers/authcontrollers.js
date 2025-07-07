const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Register
exports.register = async (req, res) => {
    try {
    const { nama, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ nama, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Registrasi berhasil' });
    } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Akun tidak ditemukan' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password salah' });

    res.json({ message: 'Login berhasil', user: { id: user._id, nama: user.nama, email: user.email } });
    } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
    const users = await User.find({}, { password: 0 }); // sembunyikan password
    res.json({ success: true, data: users });
    } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal ambil user', error: err.message });
    }
};
