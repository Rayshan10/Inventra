import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/barang.dart';
import '../models/user.dart';

class ApiService {
  final String baseUrl;
  final http.Client client;

  ApiService({required this.baseUrl, required this.client});

  // ========== Auth Methods ==========
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await client.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Login failed: email or password is incorrect');
      }
    } catch (e) {
      debugPrint('Login error: $e');
      rethrow;
    }
  }

  Future<void> register(String name, String email, String password) async {
    try {
      final response = await client.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'nama': name, 'email': email, 'password': password}),
      );

      if (response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Registration failed');
      }
    } catch (e) {
      debugPrint('Register error: $e');
      rethrow;
    }
  }

  // ========== Barang Methods ==========
  Future<List<Barang>> getBarangList(String token) async {
    try {
      final response = await client.get(
        Uri.parse('$baseUrl/api/barang'), // Perbaiki endpoint
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (data == null) throw Exception('Data barang kosong');
        return data.map((json) => Barang.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load barang: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Get barang list error: $e');
      rethrow;
    }
  }

  Future<Barang> createBarang(Barang barang, String token) async {
    try {
      final response = await client.post(
        Uri.parse('$baseUrl/api/barang'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(barang.toJson()),
      );

      if (response.statusCode == 201) {
        return Barang.fromJson(json.decode(response.body));
      } else {
        // Coba parse error message dari server
        final errorResponse = json.decode(response.body);
        final errorMsg =
            errorResponse['message'] ??
            errorResponse['error'] ??
            'Failed to create barang: ${response.statusCode}';
        throw Exception(errorMsg);
      }
    } catch (e) {
      debugPrint('Create barang error: $e');
      rethrow;
    }
  }

  Future<Barang> updateBarang(Barang barang, String token) async {
    try {
      final response = await client.put(
        Uri.parse('$baseUrl/api/barang/${barang.id}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(barang.toJson()),
      );

      if (response.statusCode == 200) {
        return Barang.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to update barang: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Update barang error: $e');
      rethrow;
    }
  }

  Future<void> deleteBarang(String id, String token) async {
    try {
      final response = await client.delete(
        Uri.parse('$baseUrl/api/barang/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseBody = json.decode(response.body);

      if (response.statusCode == 200) {
        return;
      } else if (response.statusCode == 400) {
        throw FormatException(responseBody['message'] ?? 'ID tidak valid');
      } else if (response.statusCode == 404) {
        throw Exception('Barang tidak ditemukan');
      } else {
        throw Exception(responseBody['message'] ?? 'Gagal menghapus barang');
      }
    } catch (e) {
      debugPrint('Error in deleteBarang: $e');
      rethrow;
    }
  }

  Future<dynamic> _handleResponse(http.Response response) async {
    final responseData = json.decode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return responseData;
    } else {
      throw Exception(
        responseData['message'] ??
            'Request failed with status: ${response.statusCode}',
      );
    }
  }

  Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
    final response = await client.post(
      Uri.parse('$baseUrl/api/auth/verify'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'otp': otp}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Verifikasi OTP gagal');
    }
  }

  Future<Map<String, dynamic>> getProfile(String token) async {
    try {
      final response = await client.get(
        Uri.parse('$baseUrl/api/auth/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to get profile: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Get profile error: $e');
      rethrow;
    }
  }

  // In your api_service.dart file
  Future<Map<String, dynamic>> resendOTP(String email) async {
    final response = await client.post(
      Uri.parse('$baseUrl/api/auth/resend-otp'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Gagal mengirim ulang OTP');
    }
  }
}
