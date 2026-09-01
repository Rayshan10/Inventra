import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/barang.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';

class BarangFormScreen extends StatefulWidget {
  final Barang? barang;

  const BarangFormScreen({super.key, this.barang});

  @override
  State<BarangFormScreen> createState() => _BarangFormScreenState();
}

class _BarangFormScreenState extends State<BarangFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late Barang _barang;
  bool _isLoading = false;
  final List<String> _kategoriList = [
    'Alat Tulis',
    'Buku Tulis',
    'Alat Gambar',
    'Lainnya',
  ];

  @override
  void initState() {
    super.initState();
    _barang =
        widget.barang ??
        Barang(
          kodeBarang: '',
          namaBarang: '',
          kategori: '',
          hargaSatuan: 0,
          hargaPak: 0,
          stok: 0,
        );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    final messenger = ScaffoldMessenger.maybeOf(context);
    final navigator = Navigator.of(context);

    if (_barang.hargaSatuan <= 0 || _barang.hargaPak <= 0 || _barang.stok < 0) {
      messenger?.showSnackBar(
        const SnackBar(content: Text('Harga dan stok harus lebih dari 0')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final apiService = Provider.of<ApiService>(context, listen: false);

      if (authService.token == null) {
        throw Exception('Token tidak tersedia');
      }

      if (widget.barang != null) {
        await apiService.updateBarang(_barang, authService.token!);
        if (!mounted) return;
        messenger?.showSnackBar(
          const SnackBar(content: Text('Barang berhasil diperbarui')),
        );
      } else {
        await apiService.createBarang(_barang, authService.token!);
        if (!mounted) return;
        messenger?.showSnackBar(
          const SnackBar(content: Text('Barang berhasil ditambahkan')),
        );
      }
      if (!mounted) return;
      navigator.pop(true);
    } catch (e) {
      if (!mounted) return;
      messenger?.showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          duration: const Duration(seconds: 5),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.barang == null ? 'Tambah Barang' : 'Edit Barang'),
        actions: [
          if (widget.barang != null)
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _isLoading ? null : _deleteBarang,
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                initialValue: _barang.kodeBarang,
                decoration: const InputDecoration(
                  labelText: 'Kode Barang',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Harap masukkan kode barang';
                  }
                  return null;
                },
                onChanged:
                    (value) => setState(() => _barang.kodeBarang = value),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: _barang.namaBarang,
                decoration: const InputDecoration(
                  labelText: 'Nama Barang',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Harap masukkan nama barang';
                  }
                  return null;
                },
                onChanged:
                    (value) => setState(() => _barang.namaBarang = value),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _barang.kategori.isNotEmpty ? _barang.kategori : null,
                decoration: const InputDecoration(
                  labelText: 'Kategori',
                  border: OutlineInputBorder(),
                ),
                items:
                    _kategoriList.map((category) {
                      return DropdownMenuItem(
                        value: category,
                        child: Text(category),
                      );
                    }).toList(),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Harap pilih kategori';
                  }
                  return null;
                },
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _barang.kategori = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: _barang.hargaSatuan.toString(),
                decoration: const InputDecoration(
                  labelText: 'Harga Satuan',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Harap masukkan harga satuan';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Harap masukkan angka yang valid';
                  }
                  if (int.parse(value) <= 0) {
                    return 'Harga harus lebih dari 0';
                  }
                  return null;
                },
                onSaved: (value) {
                  if (value != null && value.isNotEmpty) {
                    _barang.hargaSatuan = int.parse(value);
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: _barang.hargaPak.toString(),
                decoration: const InputDecoration(
                  labelText: 'Harga Pak',
                  border: OutlineInputBorder(),
                ),
                keyboardType:
                    TextInputType.number, // Tambahkan keyboard numerik
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Harap masukkan harga pak';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Harap masukkan angka yang valid';
                  }
                  if (int.parse(value) <= 0) {
                    return 'Harga harus lebih dari 0';
                  }
                  return null;
                },
                onSaved: (value) {
                  if (value != null && value.isNotEmpty) {
                    _barang.hargaPak = int.parse(value);
                  }
                },
                onChanged: (value) {
                  if (value.isNotEmpty) {
                    setState(() {
                      _barang.hargaPak = int.tryParse(value) ?? 0;
                    });
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: _barang.stok.toString(),
                decoration: const InputDecoration(
                  labelText: 'Stok',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Harap masukkan stok';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Harap masukkan angka yang valid';
                  }
                  return null;
                },
                onChanged:
                    (value) =>
                        setState(() => _barang.stok = int.tryParse(value) ?? 0),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child:
                      _isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(
                            widget.barang == null ? 'SIMPAN' : 'PERBARUI',
                            style: const TextStyle(fontSize: 16),
                          ),
                ),
              ),
              if (widget.barang != null) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('BATAL'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _deleteBarang() async {
    try {
      if (_barang.id == null || _barang.id!.isEmpty) {
        throw Exception('ID barang tidak valid');
      }

      final authService = Provider.of<AuthService>(context, listen: false);
      final apiService = Provider.of<ApiService>(context, listen: false);
      final messenger = ScaffoldMessenger.maybeOf(context);
      final navigator = Navigator.of(context);

      final confirmed =
          await showDialog<bool>(
            context: context,
            builder:
                (context) => AlertDialog(
                  title: const Text('Konfirmasi'),
                  content: const Text('Yakin ingin menghapus barang ini?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Batal'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text(
                        'Hapus',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
          ) ??
          false;

      if (!confirmed) return;

      setState(() => _isLoading = true);

      await apiService.deleteBarang(_barang.id!, authService.token!);

      if (!mounted) return;
      messenger?.showSnackBar(
        const SnackBar(content: Text('Barang berhasil dihapus')),
      );

      if (!mounted) return;
      navigator.pop(true);
    } on FormatException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.maybeOf(
        context,
      )?.showSnackBar(SnackBar(content: Text(e.message)));
    } on Exception catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.maybeOf(
        context,
      )?.showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _formKey.currentState?.dispose();
    super.dispose();
  }
}
