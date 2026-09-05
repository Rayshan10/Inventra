const test = require('node:test');
const assert = require('node:assert/strict');

const apiUrl = process.env.TEST_API_URL || 'http://127.0.0.1:3000';
const email = process.env.TEST_ADMIN_EMAIL;
const password = process.env.TEST_ADMIN_PASSWORD;

const integration = email && password ? test : test.skip;

async function request(path, options = {}) {
    const response = await fetch(`${apiUrl}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
    return { response, body };
}

integration('auth, barang CRUD, dan mutasi berjalan end-to-end', async () => {
    const login = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    assert.equal(login.response.status, 200);
    assert.equal(login.body.success, true);
    const token = login.body.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    const code = `TEST-${Date.now()}`;
    const create = await request('/api/barang', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            kode_barang: code,
            nama_barang: 'Barang Integration Test',
            kategori: 'Alat Tulis',
            harga_satuan: 1000,
            harga_pak: 10000,
            stok: 2
        })
    });
    assert.equal(create.response.status, 201);
    const barangId = create.body.data._id;

    try {
        const update = await request(`/api/barang/${barangId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ nama_barang: 'Barang Integration Updated' })
        });
        assert.equal(update.response.status, 200);
        assert.equal(update.body.data.nama_barang, 'Barang Integration Updated');

        const mutation = await request('/api/mutasi', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                barang_id: barangId,
                tipe: 'masuk',
                jumlah: 1,
                keterangan: 'Integration test',
                tanggal_mutasi: new Date().toISOString().slice(0, 10)
            })
        });
        assert.equal(mutation.response.status, 201);
        assert.equal(mutation.body.data.barang.stok, 3);

        const list = await request('/api/barang?limit=1000', { headers: authHeaders });
        assert.equal(list.response.status, 200);
        assert.ok(list.body.data.some((item) => item._id === barangId));

        const report = await request('/api/barang/export', { headers: authHeaders });
        assert.equal(report.response.status, 200);
        assert.match(report.body, /Kode Barang/);
        assert.match(report.body, new RegExp(code));
    } finally {
        const removal = await request(`/api/barang/${barangId}`, {
            method: 'DELETE',
            headers: authHeaders
        });
        assert.equal(removal.response.status, 200);
    }
});
