# Dokumentasi API Inventra

Base URL: `http://localhost:3000/api`

## Catatan Penting

- Semua endpoint yang memerlukan autentikasi harus include header: `Authorization: Bearer {token}`
- Response format standard:

```json
{
  "success": true/false,
  "message": "string",
  "data": {},
  "pagination": {} // Jika applicable
}
```

---

## Authentication Routes

### Register

- **Endpoint**: `POST /api/auth/register`
- **Body**:

```json
{
  "nama": "string",
  "email": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Registrasi berhasil. Kode OTP telah dikirim ke email Anda",
  "data": {
    "email": "user@email.com",
    "nama": "Nama User"
  }
}
```

### Verify OTP

- **Endpoint**: `POST /api/auth/verify`
- **Body**:

```json
{
  "email": "string",
  "otp": "string (6 digit)"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Verifikasi berhasil. Silakan login",
  "data": {
    "_id": "user_id",
    "nama": "string",
    "email": "string",
    "verified": true
  }
}
```

### Resend OTP

- **Endpoint**: `POST /api/auth/resend`
- **Body**:

```json
{
  "email": "string"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Kode OTP baru berhasil dikirim ke email Anda"
}
```

### Login

- **Endpoint**: `POST /api/auth/login`
- **Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "jwt_token",
    "user": {
      "_id": "user_id",
      "nama": "string",
      "email": "string",
      "verified": true
    }
  }
}
```

### Get Profile

- **Endpoint**: `GET /api/auth/me`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "nama": "string",
    "email": "string",
    "verified": true,
    "created_at": "ISO date"
  }
}
```

### Get All Users (Admin)

- **Endpoint**: `GET /api/auth/users`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "nama": "string",
      "email": "string",
      "verified": true,
      "created_at": "ISO date"
    }
  ]
}
```

---

## Barang Routes

### Get All Barang

- **Endpoint**: `GET /api/barang`
- **Auth Required**: Yes
- **Query Parameters**:
  - `skip` (default: 0) - pagination offset
  - `limit` (default: 50) - items per page
  - `kategori` (optional) - filter by category
  - `search` (optional) - search by nama_barang or kode_barang
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "barang_id",
      "kode_barang": "string (unique)",
      "nama_barang": "string",
      "kategori": "string",
      "harga_satuan": "number",
      "harga_pak": "number",
      "stok": "number",
      "tgljam": "ISO date"
    }
  ],
  "pagination": {
    "total": "number",
    "skip": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

### Create Barang

- **Endpoint**: `POST /api/barang`
- **Auth Required**: Yes
- **Body**:

```json
{
  "kode_barang": "string (unique, required)",
  "nama_barang": "string (required)",
  "kategori": "string (required)",
  "harga_satuan": "number (required, ≥0)",
  "harga_pak": "number (required, ≥0)",
  "stok": "number (required, ≥0)"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Barang berhasil ditambahkan",
  "data": {
    /* barang object */
  }
}
```

### Update Barang

- **Endpoint**: `PUT /api/barang/{id}`
- **Auth Required**: Yes
- **Note**: Kode barang tidak dapat diubah
- **Body**: Same fields as Create (optional)
- **Response**:

```json
{
  "success": true,
  "message": "Barang berhasil diperbarui",
  "data": {
    /* updated barang object */
  }
}
```

### Delete Barang

- **Endpoint**: `DELETE /api/barang/{id}`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "message": "Barang berhasil dihapus",
  "data": {
    "_id": "barang_id",
    "kode_barang": "string",
    "nama_barang": "string"
  }
}
```

---

## Mutasi Stok Routes

### Create Mutasi Stok

- **Endpoint**: `POST /api/mutasi`
- **Auth Required**: Yes
- **Body**:

```json
{
  "barang_id": "ObjectId (required)",
  "tipe": "masuk|keluar|opname|retur (required)",
  "jumlah": "number (required, > 0)",
  "keterangan": "string (required)",
  "tanggal_mutasi": "ISO date (optional, default: now)"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Mutasi stok tipe masuk berhasil dicatat",
  "data": {
    "mutasi": {
      "_id": "mutasi_id",
      "barang_id": "barang_id",
      "tipe": "masuk|keluar|opname|retur",
      "jumlah": "number",
      "keterangan": "string",
      "stok_sebelum": "number",
      "stok_sesudah": "number",
      "tanggal_mutasi": "ISO date",
      "created_at": "ISO date"
    },
    "barang": {
      "_id": "barang_id",
      "nama_barang": "string",
      "stok": "number (updated)"
    }
  }
}
```

### Get All Mutasi

- **Endpoint**: `GET /api/mutasi`
- **Auth Required**: Yes
- **Query Parameters**:
  - `skip` (default: 0)
  - `limit` (default: 50)
  - `tipe` (optional) - filter by type
  - `barang_id` (optional) - filter by barang
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "mutasi_id",
      "barang_id": {
        "_id": "barang_id",
        "nama_barang": "string",
        "kode_barang": "string"
      },
      "tipe": "masuk|keluar|opname|retur",
      "jumlah": "number",
      "keterangan": "string",
      "stok_sebelum": "number",
      "stok_sesudah": "number",
      "created_by": {
        "nama": "string",
        "email": "string"
      },
      "tanggal_mutasi": "ISO date",
      "created_at": "ISO date"
    }
  ],
  "pagination": {
    /* ... */
  }
}
```

### Get Mutasi by Barang

- **Endpoint**: `GET /api/mutasi/barang/{barang_id}`
- **Auth Required**: Yes
- **Query Parameters**:
  - `skip` (default: 0)
  - `limit` (default: 50)
  - `tipe` (optional) - filter by type
- **Response**: Same as Get All Mutasi

### Get Stok Stats

- **Endpoint**: `GET /api/mutasi/stats`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": {
    "totalBarang": "number",
    "stokHabis": "number",
    "stokMenipis": "number (stok < 10)",
    "nilaiStok": {
      "totalNilai": "number",
      "totalStok": "number"
    },
    "barangTerbaru": [
      {
        "nama_barang": "string",
        "stok": "number",
        "harga_satuan": "number",
        "tgljam": "ISO date"
      }
    ]
  }
}
```

---

## Error Responses

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Field berikut harus diisi: ...",
  "error": "error details"
}
```

### 401 - Unauthorized (Invalid/Missing Token)

```json
{
  "success": false,
  "message": "Token tidak ditemukan atau tidak valid"
}
```

### 403 - Forbidden (Invalid Token)

```json
{
  "success": false,
  "message": "Token tidak valid"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Resource tidak ditemukan"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "message": "Gagal memproses request",
  "error": "error details (hanya di development)"
}
```

---

## Testing dengan cURL

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test User","email":"test@email.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","password":"password123"}'
```

### Get Barang (with token)

```bash
curl -X GET http://localhost:3000/api/barang \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Barang

```bash
curl -X POST http://localhost:3000/api/barang \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kode_barang":"BK001",
    "nama_barang":"Buku Tulis A4",
    "kategori":"Buku Tulis",
    "harga_satuan":5000,
    "harga_pak":50000,
    "stok":100
  }'
```

### Create Mutasi Stok

```bash
curl -X POST http://localhost:3000/api/mutasi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "barang_id":"63f7d4e8c0d1a2b3c4d5e6f7",
    "tipe":"masuk",
    "jumlah":50,
    "keterangan":"Pembelian dari supplier A",
    "tanggal_mutasi":"2026-08-31T10:00:00Z"
  }'
```

---

## Health Check

- **Endpoint**: `GET /api/health`
- **Auth Required**: No
- **Response**:

```json
{
  "status": "OK",
  "timestamp": "ISO date"
}
```
