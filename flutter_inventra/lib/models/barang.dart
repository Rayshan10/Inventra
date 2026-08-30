class Barang {
  String? id;
  String kodeBarang;
  String namaBarang;
  String kategori;
  int hargaSatuan;
  int hargaPak;
  int stok;

  Barang({
    this.id,
    required this.kodeBarang,
    required this.namaBarang,
    required this.kategori,
    required this.hargaSatuan,
    required this.hargaPak,
    required this.stok,
  });

  factory Barang.fromJson(Map<String, dynamic> json) {
    return Barang(
      id: json['_id'],
      kodeBarang: json['kode_barang'] ?? '',
      namaBarang: json['nama_barang'] ?? '',
      kategori: json['kategori'] ?? '',
      hargaSatuan: json['harga_satuan'] ?? 0,
      hargaPak: json['harga_pak'] ?? 0,
      stok: json['stok'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'kode_barang': kodeBarang,
      'nama_barang': namaBarang,
      'kategori': kategori,
      'harga_satuan': hargaSatuan,
      'harga_pak': hargaPak,
      'stok': stok,
      // Tambahkan field tgljam jika diperlukan
      'tgljam': DateTime.now().toIso8601String(),
    };
  }
}
