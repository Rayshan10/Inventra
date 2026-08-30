require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi CORS yang lebih sederhana untuk development
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:54147',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:54147',
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Routes
const authRoutes = require('./routes/authroutes');
const barangRoutes = require('./routes/barangroutes');

app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);

// Error handling
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});