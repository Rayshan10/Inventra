import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/barang.dart';
import '../../models/mutasi.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/drawer.dart';

class MutasiScreen extends StatefulWidget {
  const MutasiScreen({super.key});

  @override
  State<MutasiScreen> createState() => _MutasiScreenState();
}

class _MutasiScreenState extends State<MutasiScreen> {
  final _formKey = GlobalKey<FormState>();
  final _jumlahController = TextEditingController();
  final _keteranganController = TextEditingController();

  List<Barang> _barangList = [];
  List<Mutasi> _mutasiList = [];
  String? _selectedBarangId;
  String _selectedTipe = 'masuk';
  DateTime _tanggalMutasi = DateTime.now();
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _errorMessage;
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadData());
  }

  @override
  void dispose() {
    _jumlahController.dispose();
    _keteranganController.dispose();
    super.dispose();
  }

  String get _dateValue =>
      '${_tanggalMutasi.year.toString().padLeft(4, '0')}-'
      '${_tanggalMutasi.month.toString().padLeft(2, '0')}-'
      '${_tanggalMutasi.day.toString().padLeft(2, '0')}';

  Future<void> _loadData() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final api = Provider.of<ApiService>(context, listen: false);
    if (auth.token == null) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        api.getBarangList(auth.token!),
        api.getMutasiList(auth.token!),
      ]);
      if (!mounted) return;
      setState(() {
        _barangList = results[0] as List<Barang>;
        _mutasiList = results[1] as List<Mutasi>;
        _isLoading = false;
        if (_selectedBarangId == null && _barangList.isNotEmpty) {
          _selectedBarangId = _barangList.first.id;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Gagal memuat data mutasi: ${e.toString()}';
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedBarangId == null) {
      setState(() => _errorMessage = 'Pilih barang terlebih dahulu');
      return;
    }

    final auth = Provider.of<AuthService>(context, listen: false);
    final api = Provider.of<ApiService>(context, listen: false);
    final jumlah = int.tryParse(_jumlahController.text.trim());
    if (auth.token == null || jumlah == null) return;

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      await api.createMutasi(
        barangId: _selectedBarangId!,
        tipe: _selectedTipe,
        jumlah: jumlah,
        keterangan: _keteranganController.text.trim(),
        tanggalMutasi: _dateValue,
        token: auth.token!,
      );
      if (!mounted) return;
      _jumlahController.clear();
      _keteranganController.clear();
      await _loadData();
      if (!mounted) return;
      setState(() => _tabIndex = 0);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mutasi stok berhasil dicatat'),
          backgroundColor: Color(0xFF28A889),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(
        () => _errorMessage = e.toString().replaceFirst('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _tanggalMutasi,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null && mounted) setState(() => _tanggalMutasi = picked);
  }

  String _formatDate(String value) {
    final date = DateTime.tryParse(value);
    if (date == null) return value;
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  Color _typeColor(String type) {
    if (type == 'masuk' || type == 'retur') return const Color(0xFF28A889);
    if (type == 'keluar') return const Color(0xFFD94B5B);
    return const Color(0xFFE4A23A);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Mutasi Stok',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            tooltip: 'Muat ulang',
            onPressed: _isLoading ? null : _loadData,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                onRefresh: _loadData,
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    if (_errorMessage != null) _buildError(),
                    _buildTabs(),
                    const SizedBox(height: 16),
                    if (_tabIndex == 0) _buildHistory() else _buildForm(),
                  ],
                ),
              ),
    );
  }

  Widget _buildError() => Container(
    margin: const EdgeInsets.only(bottom: 16),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: const Color(0xFFFFF0F1),
      border: Border.all(color: const Color(0xFFD94B5B)),
      borderRadius: BorderRadius.circular(6),
    ),
    child: Text(
      _errorMessage!,
      style: const TextStyle(color: Color(0xFF9F2F3D)),
    ),
  );

  Widget _buildTabs() => Card(
    child: Padding(
      padding: const EdgeInsets.all(6),
      child: Row(
        children: [
          Expanded(child: _tabButton('Riwayat Mutasi', 0, Icons.bar_chart)),
          Expanded(child: _tabButton('Buat Mutasi Baru', 1, Icons.add)),
        ],
      ),
    ),
  );

  Widget _tabButton(String label, int index, IconData icon) => TextButton.icon(
    onPressed: () => setState(() => _tabIndex = index),
    style: TextButton.styleFrom(
      backgroundColor:
          _tabIndex == index ? const Color(0xFFEAF2FF) : Colors.transparent,
      foregroundColor:
          _tabIndex == index
              ? const Color(0xFF2F80ED)
              : const Color(0xFF718191),
      padding: const EdgeInsets.symmetric(vertical: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
    ),
    icon: Icon(icon, size: 18),
    label: Text(label, overflow: TextOverflow.ellipsis),
  );

  Widget _buildForm() => Card(
    child: Padding(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Buat Mutasi Stok Baru',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF17324D),
              ),
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<String>(
              value: _selectedBarangId,
              decoration: const InputDecoration(labelText: 'Pilih Barang *'),
              items:
                  _barangList
                      .map(
                        (barang) => DropdownMenuItem(
                          value: barang.id,
                          child: Text(
                            '${barang.kodeBarang} - ${barang.namaBarang} (Stok: ${barang.stok})',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
              onChanged: (value) => setState(() => _selectedBarangId = value),
              validator: (value) => value == null ? 'Pilih barang' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedTipe,
              decoration: const InputDecoration(labelText: 'Tipe Mutasi *'),
              items: const [
                DropdownMenuItem(value: 'masuk', child: Text('Barang Masuk')),
                DropdownMenuItem(value: 'keluar', child: Text('Barang Keluar')),
                DropdownMenuItem(value: 'opname', child: Text('Opname Stok')),
                DropdownMenuItem(value: 'retur', child: Text('Retur Barang')),
              ],
              onChanged:
                  (value) => setState(() => _selectedTipe = value ?? 'masuk'),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _jumlahController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Jumlah *',
                hintText: 'Masukkan jumlah',
              ),
              validator: (value) {
                final jumlah = int.tryParse(value?.trim() ?? '');
                return jumlah == null || jumlah <= 0
                    ? 'Jumlah harus lebih dari 0'
                    : null;
              },
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: _pickDate,
              child: InputDecorator(
                decoration: const InputDecoration(labelText: 'Tanggal Mutasi'),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_formatDate(_dateValue)),
                    const Icon(Icons.calendar_today, size: 18),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _keteranganController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Keterangan *',
                hintText: 'Masukkan alasan mutasi',
              ),
              validator:
                  (value) =>
                      value == null || value.trim().isEmpty
                          ? 'Keterangan wajib diisi'
                          : null,
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _submit,
                icon:
                    _isSubmitting
                        ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                        : const Icon(Icons.save),
                label: Text(_isSubmitting ? 'Menyimpan...' : 'Simpan Mutasi'),
              ),
            ),
          ],
        ),
      ),
    ),
  );

  Widget _buildHistory() => Card(
    child: Padding(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Riwayat Mutasi Stok',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF17324D),
            ),
          ),
          const SizedBox(height: 12),
          if (_mutasiList.isEmpty)
            const Text(
              'Belum ada riwayat mutasi stok.',
              style: TextStyle(color: Color(0xFF718191)),
            )
          else
            ..._mutasiList.map(_buildMutationTile),
        ],
      ),
    ),
  );

  Widget _buildMutationTile(Mutasi mutasi) => Container(
    padding: const EdgeInsets.symmetric(vertical: 14),
    decoration: const BoxDecoration(
      border: Border(bottom: BorderSide(color: Color(0xFFEAF0F6))),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: _typeColor(mutasi.tipe).withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            Icons.swap_vert,
            color: _typeColor(mutasi.tipe),
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                mutasi.namaBarang.isEmpty ? mutasi.barangId : mutasi.namaBarang,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF17324D),
                ),
              ),
              Text(
                '${mutasi.kodeBarang} • ${_formatDate(mutasi.tanggalMutasi)}',
                style: const TextStyle(fontSize: 12, color: Color(0xFF718191)),
              ),
              const SizedBox(height: 4),
              Text(
                mutasi.keterangan,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${mutasi.tipe.toUpperCase()} ${mutasi.jumlah}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: _typeColor(mutasi.tipe),
              ),
            ),
            Text(
              '${mutasi.stokSebelum} → ${mutasi.stokSesudah}',
              style: const TextStyle(fontSize: 12, color: Color(0xFF718191)),
            ),
          ],
        ),
      ],
    ),
  );
}
