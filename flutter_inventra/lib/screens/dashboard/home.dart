import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/barang.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../auth/login.dart';
import '../../widgets/drawer.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _stats;
  List<Barang> _barangTerbaru = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadDashboard());
  }

  Future<void> _loadDashboard() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final apiService = Provider.of<ApiService>(context, listen: false);

    if (authService.token == null) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        apiService.getDashboardStats(authService.token!),
        apiService.getBarangList(authService.token!),
      ]);

      if (!mounted) return;
      setState(() {
        _stats = results[0] as Map<String, dynamic>;
        _barangTerbaru = (results[1] as List<Barang>).take(5).toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Gagal memuat dashboard: ${e.toString()}';
      });
    }
  }

  int _stat(String key) => (_stats?[key] as num?)?.toInt() ?? 0;

  String _formatRupiah(num amount) {
    return 'Rp ${amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
  }

  String _stockStatus(int stock) {
    if (stock == 0) return 'Habis';
    if (stock < 10) return 'Menipis';
    return 'Aman';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Dashboard',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            tooltip: 'Muat ulang dashboard',
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _loadDashboard,
          ),
        ],
      ),
      body: Consumer<AuthService>(
        builder: (context, authService, child) {
          // Redirect ke login jika tidak terautentikasi
          if (!authService.isAuthenticated) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (context) => LoginScreen()),
                (Route<dynamic> route) => false,
              );
            });
            return Center(child: CircularProgressIndicator());
          }

          if (_isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: _loadDashboard,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(
                  'Selamat datang, ${authService.user?.nama ?? 'User'}',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: const Color(0xFF17324D),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Kelola persediaan toko dengan lebih mudah.',
                  style: TextStyle(color: Color(0xFF718191)),
                ),
                if (_errorMessage != null)
                  _DashboardNotice(message: _errorMessage!),
                const SizedBox(height: 24),
                _KpiGrid(
                  totalBarang: _stat('totalBarang'),
                  stokAman:
                      _stat('totalBarang') -
                      _stat('stokHabis') -
                      _stat('stokMenipis'),
                  stokMenipis: _stat('stokMenipis'),
                  stokHabis: _stat('stokHabis'),
                  nilaiStok: (_stats?['nilaiStok']?['totalNilai'] as num?) ?? 0,
                  totalStok:
                      (_stats?['nilaiStok']?['totalStok'] as num?)?.toInt() ??
                      0,
                ),
                const SizedBox(height: 24),
                _RecentBarangTable(
                  barangList: _barangTerbaru,
                  formatRupiah: _formatRupiah,
                  stockStatus: _stockStatus,
                ),
              ],
            ),
          );
        },
      ),
      drawer: const AppDrawer(),
    );
  }
}

class _DashboardNotice extends StatelessWidget {
  final String message;

  const _DashboardNotice({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF0F1),
        border: Border.all(color: const Color(0xFFD94B5B)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(message, style: const TextStyle(color: Color(0xFF9F2F3D))),
    );
  }
}

class _KpiGrid extends StatelessWidget {
  final int totalBarang;
  final int stokAman;
  final int stokMenipis;
  final int stokHabis;
  final num nilaiStok;
  final int totalStok;

  const _KpiGrid({
    required this.totalBarang,
    required this.stokAman,
    required this.stokMenipis,
    required this.stokHabis,
    required this.nilaiStok,
    required this.totalStok,
  });

  @override
  Widget build(BuildContext context) {
    final cards = [
      _KpiData(
        'Total Barang',
        '$totalBarang',
        'SKU dalam sistem',
        Icons.inventory_2,
        const Color(0xFF2F80ED),
      ),
      _KpiData(
        'Stok Aman',
        '$stokAman',
        'Stok tersedia cukup',
        Icons.check_circle,
        const Color(0xFF28A889),
      ),
      _KpiData(
        'Stok Menipis',
        '$stokMenipis',
        'Perlu segera restock',
        Icons.warning_amber,
        const Color(0xFFE4A23A),
      ),
      _KpiData(
        'Stok Habis',
        '$stokHabis',
        'Harus dipesan ulang',
        Icons.cancel,
        const Color(0xFFD94B5B),
      ),
      _KpiData(
        'Nilai Total Stok',
        _formatValue(nilaiStok),
        '$totalStok unit',
        Icons.payments,
        const Color(0xFF1769D1),
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns =
            constraints.maxWidth > 900
                ? 3
                : constraints.maxWidth > 560
                ? 2
                : 1;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: cards.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            mainAxisExtent: 112,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemBuilder: (context, index) => _KpiCard(data: cards[index]),
        );
      },
    );
  }

  String _formatValue(num value) =>
      'Rp ${value.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
}

class _KpiData {
  final String title;
  final String value;
  final String label;
  final IconData icon;
  final Color color;

  const _KpiData(this.title, this.value, this.label, this.icon, this.color);
}

class _KpiCard extends StatelessWidget {
  final _KpiData data;

  const _KpiCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: data.color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(data.icon, color: Colors.white, size: 28),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  data.title,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text(
                  data.value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                Text(
                  data.label,
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RecentBarangTable extends StatelessWidget {
  final List<Barang> barangList;
  final String Function(num) formatRupiah;
  final String Function(int) stockStatus;

  const _RecentBarangTable({
    required this.barangList,
    required this.formatRupiah,
    required this.stockStatus,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Barang Terbaru',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF17324D),
              ),
            ),
            const SizedBox(height: 14),
            if (barangList.isEmpty)
              const Text(
                'Belum ada data barang.',
                style: TextStyle(color: Color(0xFF718191)),
              )
            else
              ...barangList.map(
                (barang) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(9),
                    decoration: const BoxDecoration(
                      color: Color(0xFFEAF2FF),
                      borderRadius: BorderRadius.all(Radius.circular(6)),
                    ),
                    child: const Icon(
                      Icons.inventory_2_outlined,
                      color: Color(0xFF2F80ED),
                    ),
                  ),
                  title: Text(
                    barang.namaBarang,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text('${barang.kodeBarang} • ${barang.kategori}'),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        formatRupiah(barang.hargaSatuan),
                        style: const TextStyle(
                          color: Color(0xFF1D896F),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${barang.stok} unit • ${stockStatus(barang.stok)}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF718191),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
