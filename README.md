# Inventra - Aplikasi Manajemen Stok Barang

Inventra adalah aplikasi manajemen stok barang yang komprehensif untuk toko buku dan toko fotokopi, dibangun dengan Node.js, Express.js, React.js, dan Flutter dalam arsitektur monorepo.

## 🎯 Fitur Utama

### Authentication & Authorization

- Registrasi pengguna dengan email verification (OTP)
- Login dengan JWT token
- Proteksi route dengan token verification

### Manajemen Barang

- CRUD barang (tambah, lihat, edit, hapus)
- Pencarian dan filtering barang
- Kategori barang
- Tracking harga satuan dan harga pak
- Status stok real-time (Aman/Menipis/Habis)

### Mutasi Stok

- Pencatatan barang masuk
- Pencatatan barang keluar
- Opname stok
- Retur barang
- Audit trail (siapa, kapan, alasan)
- Riwayat mutasi dengan filter

### Dashboard

- KPI statistik stok (total barang, stok habis, stok menipis)
- Nilai total stok
- Barang terbaru
- Visualisasi status stok

## 📦 Struktur Proyek

```
Inventra/
├── backend_inventra/         # Node.js + Express API
│   ├── config/              # Database configuration
│   ├── controllers/         # Business logic
│   ├── middleware/          # Authentication & validators
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── utils/               # Helper functions
│   ├── server.js            # Server entry point
│   ├── package.json
│   ├── .env                 # Environment variables
│   └── API_DOCS.md          # API documentation
│
├── frontend_inventra/       # React Web Admin
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── styles/          # CSS files
│   │   ├── App.js           # Main app component
│   │   └── index.js
│   ├── package.json
│   └── .env
│
└── flutter_inventra/        # Flutter Mobile App
    ├── lib/
    │   ├── screens/         # Screen pages
    │   ├── services/        # API services
    │   ├── models/          # Data models
    │   ├── widgets/         # Custom widgets
    │   └── main.dart
    ├── pubspec.yaml
    └── android/, ios/
```

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- MongoDB v4.0+
- React 19+
- Flutter 3.0+
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend_inventra

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventra
JWT_SECRET=your_secret_key_here
NODE_ENV=development
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EOF

# Run database migrations/seed (if needed)
# npm run seed

# Start server
npm run dev
# atau
npm start

# Server akan berjalan di http://localhost:3000
```

### Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend_inventra

# Install dependencies
npm install

# Create .env file (if needed)
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Start development server
npm start

# App akan berjalan di http://localhost:3000
```

### Mobile Setup (Flutter)

```bash
# Navigate to flutter directory
cd flutter_inventra

# Get dependencies
flutter pub get

# Run on emulator or device
flutter run

# Build APK (Android)
flutter build apk

# Build IPA (iOS)
flutter build ios
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Semua endpoint (kecuali register/login) memerlukan header:

```
Authorization: Bearer {jwt_token}
```

### Endpoint Categories

#### Authentication (`/api/auth`)

- `POST /register` - Registrasi pengguna baru
- `POST /login` - Login
- `POST /verify` - Verifikasi OTP
- `POST /resend` - Kirim ulang OTP
- `GET /me` - Dapatkan profile user
- `GET /users` - Dapatkan semua users (admin)

#### Barang (`/api/barang`)

- `GET /` - Dapatkan list barang (dengan pagination & filter)
- `POST /` - Tambah barang baru
- `PUT /:id` - Update barang
- `DELETE /:id` - Hapus barang

#### Mutasi Stok (`/api/mutasi`)

- `POST /` - Buat mutasi stok baru (masuk/keluar/opname/retur)
- `GET /` - Dapatkan list semua mutasi
- `GET /barang/:barang_id` - Dapatkan mutasi barang spesifik
- `GET /stats` - Dapatkan statistik dashboard

Lihat [API_DOCS.md](backend_inventra/API_DOCS.md) untuk dokumentasi lengkap.

## 🔐 Environment Variables

### Backend (.env)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventra
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRE=24h
NODE_ENV=development

# Email Configuration (untuk OTP)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Frontend URL untuk CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:3000
```

### Flutter (config.dart)

```dart
const String API_BASE_URL = 'http://localhost:3000/api';
```

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  nama: String,
  email: String (unique),
  password: String (hashed),
  verified: Boolean,
  otp_code: String,
  created_at: Date
}
```

### Barang Collection

```javascript
{
  _id: ObjectId,
  kode_barang: String (unique),
  nama_barang: String,
  kategori: String,
  harga_satuan: Number,
  harga_pak: Number,
  stok: Number,
  tgljam: Date
}
```

### Mutasi Stok Collection

```javascript
{
  _id: ObjectId,
  barang_id: ObjectId (ref: Barang),
  tipe: String (enum: ['masuk', 'keluar', 'opname', 'retur']),
  jumlah: Number,
  keterangan: String,
  stok_sebelum: Number,
  stok_sesudah: Number,
  created_by: ObjectId (ref: User),
  tanggal_mutasi: Date,
  created_at: Date
}
```

## 🧪 Testing

### Integration Test Backend

Integration test mencakup login, CRUD barang, mutasi stok, dan export laporan.
Jalankan dengan kredensial admin test melalui environment variable:

```powershell
cd backend_inventra
$env:TEST_ADMIN_EMAIL='admin@example.com'
$env:TEST_ADMIN_PASSWORD='password-test'
npm test
```

Tanpa kedua variable tersebut, test akan dilewati agar tidak memakai kredensial produksi secara tidak sengaja.

### Export Laporan

Endpoint laporan barang tersedia di `GET /api/barang/export` dan membutuhkan header JWT:

```text
http://localhost:3000/api/barang/export
```

React menyediakan tombol **Unduh Laporan** pada dashboard dan menghasilkan file CSV.

### Manual API Testing dengan cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Get Barang
curl -X GET http://localhost:3000/api/barang \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Barang
curl -X POST http://localhost:3000/api/barang \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kode_barang":"BK001",
    "nama_barang":"Buku Tulis",
    "kategori":"Alat Tulis",
    "harga_satuan":5000,
    "harga_pak":50000,
    "stok":100
  }'
```

## 🎨 UI/UX Highlights

### Dashboard

- KPI cards dengan visualisasi warna gradient
- Real-time statistics
- Quick action buttons
- Responsive grid layout

### Manajemen Barang

- Tab navigation antara list dan form
- Search & filtering
- Status badge (Aman/Menipis/Habis)
- Currency formatting

### Mutasi Stok

- Form-based mutation recording
- Type selection (Masuk/Keluar/Opname/Retur)
- Transaction history dengan sorting
- Audit trail tracking

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**

```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solusi:
1. Pastikan MongoDB running: `mongod`
2. Check MONGODB_URI di .env
3. Verify connection string format
```

**Port Already in Use**

```
Error: listen EADDRINUSE :::3000

Solusi:
- Change PORT di .env
- atau kill process: `lsof -ti:3000 | xargs kill -9`
```

### Frontend Issues

**CORS Error**

```
Error: Access to XMLHttpRequest blocked by CORS

Solusi:
1. Verify backend CORS configuration
2. Check API URL di .env
3. Ensure backend running
```

**Token Not Persisting**

```
Solusi:
1. Check localStorage di browser dev tools
2. Verify token format: "Bearer {token}"
3. Check token expiry
```

## 📈 Performance Optimization

- Pagination untuk list endpoints (default 50 items)
- Database indexing pada frequently queried fields
- React component memoization
- Lazy loading untuk routes
- Token caching di localStorage

## 🔄 Development Workflow

### Adding New Feature

1. **Backend**
   - Create model/schema di `models/`
   - Create controller logic di `controllers/`
   - Create routes di `routes/`
   - Test dengan cURL/Postman

2. **Frontend**
   - Create page/component di `src/pages/` atau `src/components/`
   - Integrate API calls
   - Add styling ke `src/styles/`
   - Test di development server

3. **Mobile**
   - Create screen di `lib/screens/`
   - Create service methods di `lib/services/`
   - Add navigation di main.dart

### Commit Guidelines

```
[Backend] Add mutasi stok endpoints
[Frontend] Update dashboard KPI
[Mobile] Implement mutasi stok UI
[Doc] Update API documentation
```

## 📝 License

This project is part of a semester 3 college assignment and is being refactored for portfolio purposes.

## 👨‍💻 Author

Created as an educational project for inventory management system.

---

## 🎯 Next Steps / Roadmap

- [ ] Role-based access control (Admin/Kasir/Manager)
- [ ] Barcode scanning untuk mobile
- [ ] Export laporan (PDF/Excel)
- [ ] Real-time notifications
- [ ] Reorder recommendations
- [ ] Supplier management
- [ ] Multi-warehouse support
- [ ] Automated backup
- [ ] Unit tests & integration tests
- [ ] CI/CD pipeline

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
