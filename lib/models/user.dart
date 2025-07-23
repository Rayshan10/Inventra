class User {
  final String id;
  final String nama;
  final String email;
  final bool verified;
  final String? otpCode;

  User({
    required this.id,
    required this.nama,
    required this.email,
    required this.verified,
    this.otpCode,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Debug: Print received JSON untuk troubleshooting
    print('User.fromJson received: $json');

    return User(
      // Handle berbagai kemungkinan null dan format ID
      id: (json['_id'] ?? json['id'] ?? '').toString(),

      // Handle null nama dengan fallback ke empty string
      nama: (json['nama'] ?? '').toString(),

      // Handle null email dengan fallback ke empty string
      email: (json['email'] ?? '').toString(),

      // Handle null verified dengan fallback ke false
      verified: json['verified'] is bool ? json['verified'] : false,

      // Handle null codeOtp dengan fallback ke empty string
      otpCode: json['otp_code']?.toString(),
    );
  }

  // Alternative constructor untuk handle response yang mungkin nested
  factory User.fromJsonSafe(Map<String, dynamic> json) {
    // Jika data user ada di dalam nested object
    Map<String, dynamic> userData = json['user'] ?? json['data'] ?? json;

    print('User.fromJsonSafe received: $userData');

    return User(
      id: _safeStringFromJson(userData, ['_id', 'id']),
      nama: _safeStringFromJson(userData, ['nama', 'name']),
      email: _safeStringFromJson(userData, ['email']),
      verified: userData['verified'] is bool ? userData['verified'] : false,
      otpCode: _safeStringFromJson(userData, ['otp_code', 'codeOtp']),
    );
  }

  // Helper method untuk safely extract string dari berbagai possible keys
  static String _safeStringFromJson(
    Map<String, dynamic> json,
    List<String> possibleKeys,
  ) {
    for (String key in possibleKeys) {
      if (json.containsKey(key) && json[key] != null) {
        return json[key].toString();
      }
    }
    return ''; // Fallback ke empty string jika semua keys null
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'nama': nama,
      'email': email,
      'verified': verified,
      'otp_code': otpCode,
    };
  }

  // Method untuk validasi apakah user valid
  bool isValid() {
    return id.isNotEmpty && nama.isNotEmpty && email.isNotEmpty;
  }

  // Method untuk copy dengan perubahan
  User copyWith({
    String? id,
    String? nama,
    String? email,
    bool? verified,
    bool? codeOtp,
  }) {
    return User(
      id: id ?? this.id,
      nama: nama ?? this.nama,
      email: email ?? this.email,
      verified: verified ?? this.verified,
      otpCode: otpCode ?? this.otpCode,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, nama: $nama, email: $email, verified: $verified)';
  }
}
