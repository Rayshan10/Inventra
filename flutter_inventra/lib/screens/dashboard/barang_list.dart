import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/barang.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import 'barang_form.dart';
import '../../widgets/drawer.dart';

class BarangListScreen extends StatefulWidget {
  const BarangListScreen({super.key});

  @override
  State<BarangListScreen> createState() => _BarangListScreenState();
}

class _BarangListScreenState extends State<BarangListScreen> {
  late Future<List<Barang>> _barangFuture;
  List<Barang> _allBarang = [];
  List<Barang> _filteredBarang = [];
  bool _isSearching = false;

  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'Semua';
  List<String> _categories = ['Semua'];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_filterBarang);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadBarang();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadBarang() {
    setState(() {
      _barangFuture = _fetchBarang();
    });
  }

  Future<List<Barang>> _fetchBarang() async {
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final apiService = Provider.of<ApiService>(context, listen: false);

      if (authService.token == null) {
        throw Exception('Token tidak tersedia');
      }

      final barangList = await apiService.getBarangList(authService.token!);

      setState(() {
        _allBarang = barangList;
        _filteredBarang = barangList;
        _updateCategories();
      });

      return barangList;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.maybeOf(context)?.showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return [];
    }
  }

  void _updateCategories() {
    final Set<String> categorySet = {'Semua'};
    for (final barang in _allBarang) {
      categorySet.add(barang.kategori);
    }
    _categories = categorySet.toList();
  }

  void _filterBarang() {
    String query = _searchController.text.toLowerCase();
    setState(() {
      _filteredBarang =
          _allBarang.where((barang) {
            final matchesSearch =
                barang.namaBarang.toLowerCase().contains(query) ||
                barang.kodeBarang.toLowerCase().contains(query);
            final matchesCategory =
                _selectedCategory == 'Semua' ||
                barang.kategori == _selectedCategory;
            return matchesSearch && matchesCategory;
          }).toList();
    });
  }

  void _onCategoryChanged(String? category) {
    if (category != null) {
      setState(() {
        _selectedCategory = category;
      });
      _filterBarang();
    }
  }

  Future<void> _refreshData() async {
    _loadBarang();
  }

  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
      if (!_isSearching) {
        _searchController.clear();
      }
    });
  }

  String _formatRupiah(int amount) {
    return 'Rp ${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF17324D),
        foregroundColor: Colors.white,
        title:
            _isSearching
                ? TextField(
                  controller: _searchController,
                  autofocus: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Cari barang...',
                    hintStyle: TextStyle(color: Colors.white70),
                    border: InputBorder.none,
                  ),
                )
                : const Text(
                  'Daftar Barang',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: _toggleSearch,
          ),
          if (!_isSearching) ...[
            IconButton(
              icon: const Icon(Icons.add_box_rounded),
              onPressed:
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => BarangFormScreen()),
                  ).then((_) => _refreshData()),
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              onPressed: _refreshData,
            ),
          ],
        ],
      ),
      drawer: const AppDrawer(),
      body: Stack(
        children: [
          Column(
            children: [
              // Filter Kategori
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.white,
                child: Row(
                  children: [
                    const Icon(Icons.filter_list, color: Colors.grey),
                    const SizedBox(width: 8),
                    const Text(
                      'Kategori:',
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[300]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: DropdownButton<String>(
                          value: _selectedCategory,
                          isExpanded: true,
                          underline: Container(),
                          onChanged: _onCategoryChanged,
                          items:
                              _categories.map<DropdownMenuItem<String>>((
                                String value,
                              ) {
                                return DropdownMenuItem<String>(
                                  value: value,
                                  child: Text(value),
                                );
                              }).toList(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),

              // List Barang
              Expanded(
                child: FutureBuilder<List<Barang>>(
                  future: _barangFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 16),
                            Text('Memuat data barang...'),
                          ],
                        ),
                      );
                    }

                    if (snapshot.hasError) {
                      return Center(
                        child: Container(
                          margin: const EdgeInsets.all(32),
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withValues(alpha: 0.1),
                                spreadRadius: 1,
                                blurRadius: 6,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.error_outline,
                                size: 64,
                                color: Colors.red,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Terjadi Kesalahan',
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                snapshot.error.toString(),
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: _refreshData,
                                icon: const Icon(Icons.refresh),
                                label: const Text('Coba Lagi'),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    if (_filteredBarang.isEmpty) {
                      String emptyMessage =
                          _allBarang.isEmpty
                              ? 'Belum ada data barang'
                              : 'Tidak ada barang yang sesuai dengan pencarian';

                      return Center(
                        child: Container(
                          margin: const EdgeInsets.all(32),
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withValues(alpha: 0.1),
                                spreadRadius: 1,
                                blurRadius: 6,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _allBarang.isEmpty
                                    ? Icons.inventory_2_outlined
                                    : Icons.search_off,
                                size: 64,
                                color: Colors.grey[400],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                emptyMessage,
                                style: Theme.of(context).textTheme.headlineSmall
                                    ?.copyWith(color: Colors.grey[600]),
                              ),
                              if (_allBarang.isEmpty) ...[
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: _refreshData,
                                  icon: const Icon(Icons.refresh),
                                  label: const Text('Muat Ulang'),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: _refreshData,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _filteredBarang.length,
                        itemBuilder: (context, index) {
                          final barang = _filteredBarang[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Card(
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap:
                                    () => Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (context) => BarangFormScreen(
                                              barang: barang,
                                            ),
                                      ),
                                    ).then((_) => _refreshData()),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Row(
                                    children: [
                                      // Icon Barang
                                      Container(
                                        width: 48,
                                        height: 48,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFEAF2FF),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Icon(
                                          Icons.inventory_2,
                                          color: const Color(0xFF2F80ED),
                                          size: 24,
                                        ),
                                      ),
                                      const SizedBox(width: 16),

                                      // Info Barang
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              barang.namaBarang,
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Kode: ${barang.kodeBarang}',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 2,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: Colors.grey[200],
                                                borderRadius:
                                                    BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                barang.kategori,
                                                style: const TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      // Harga dan Stok
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            _formatRupiah(barang.hargaSatuan),
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF1D896F),
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Stok: ${barang.stok}',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
