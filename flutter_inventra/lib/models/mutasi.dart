class Mutasi {
  final String id;
  final String barangId;
  final String kodeBarang;
  final String namaBarang;
  final String tipe;
  final int jumlah;
  final int stokSebelum;
  final int stokSesudah;
  final String keterangan;
  final String tanggalMutasi;
  final String createdBy;

  const Mutasi({
    required this.id,
    required this.barangId,
    required this.kodeBarang,
    required this.namaBarang,
    required this.tipe,
    required this.jumlah,
    required this.stokSebelum,
    required this.stokSesudah,
    required this.keterangan,
    required this.tanggalMutasi,
    required this.createdBy,
  });

  factory Mutasi.fromJson(Map<String, dynamic> json) {
    final barang =
        json['barang_id'] is Map<String, dynamic>
            ? json['barang_id'] as Map<String, dynamic>
            : <String, dynamic>{};
    final createdBy =
        json['created_by'] is Map<String, dynamic>
            ? json['created_by'] as Map<String, dynamic>
            : <String, dynamic>{};

    return Mutasi(
      id: (json['_id'] ?? '').toString(),
      barangId: (barang['_id'] ?? json['barang_id'] ?? '').toString(),
      kodeBarang: (barang['kode_barang'] ?? '').toString(),
      namaBarang: (barang['nama_barang'] ?? '').toString(),
      tipe: (json['tipe'] ?? '').toString(),
      jumlah: (json['jumlah'] as num? ?? 0).toInt(),
      stokSebelum: (json['stok_sebelum'] as num? ?? 0).toInt(),
      stokSesudah: (json['stok_sesudah'] as num? ?? 0).toInt(),
      keterangan: (json['keterangan'] ?? '').toString(),
      tanggalMutasi: (json['tanggal_mutasi'] ?? '').toString(),
      createdBy: (createdBy['nama'] ?? '').toString(),
    );
  }
}
