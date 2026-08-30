const nodemailer = require('nodemailer');

const sendEmailVerification = async (to, otp) => {
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gmail kamu
      pass: process.env.EMAIL_PASS  // App password Gmail
    }
    });

    const mailOptions = {
    from: '"Tokobuku App" <no-reply@tokobuku.com>',
    to,
    subject: 'Kode Verifikasi Akun Tokobuku',
    html: `<p>Halo, berikut adalah kode verifikasi akun Tokobuku Anda:</p>
            <h2>${otp}</h2>
            <p>Masukkan kode ini untuk mengaktifkan akun Anda.</p>`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmailVerification;
