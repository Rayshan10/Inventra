const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    otp_code: { type: String },
    otp_expires_at: { type: Date }
},

    {
        collection: 'users'
    });

module.exports = mongoose.model('User', userSchema);
