import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'api_service.dart';
import '../models/user.dart';

class AuthService with ChangeNotifier {
  final ApiService _apiService;
  String? _token;
  User? _user;
  bool _isInitialized = false;
  bool _isAuthenticated = false;

  AuthService({required ApiService apiService}) : _apiService = apiService;

  bool get isAuthenticated => _token != null && _user != null;
  User? get user => _user;
  String? get token => _token;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('token');

      final userJson = prefs.getString('user');
      if (userJson != null && userJson.isNotEmpty) {
        final userData = json.decode(userJson);
        if (userData != null) {
          _user = User.fromJson(userData);
        }
      }

      _isAuthenticated = _token != null && _user != null;
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Initialize error: $e');
      await _clearAuthData();
    }
  }

  Future<void> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);

      // Debug logging
      debugPrint('Login response: $response');

      // Validate response structure
      if (response == null) {
        throw Exception('Response kosong dari server');
      }

      final token = response['token'];
      final userData = response['user'];

      if (token == null || token.toString().isEmpty) {
        throw Exception('Token tidak ditemukan dalam response');
      }

      if (userData == null) {
        throw Exception('Data user tidak ditemukan dalam response');
      }

      await _saveAuthData(token.toString(), User.fromJson(userData));
    } catch (e) {
      debugPrint('Login error: $e');
      await _clearAuthData();
      throw Exception('Login gagal: ${e.toString()}');
    }
  }

  Future<void> register(String name, String email, String password) async {
    try {
      await _apiService.register(name, email, password);

      debugPrint('Registration successful');

      // Save email for OTP verification
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('email_to_verify', email);
    } catch (e) {
      debugPrint('Register error: $e');
      String errorMessage = 'Registrasi gagal';

      final errorString = e.toString().toLowerCase();
      if (errorString.contains('email sudah terdaftar') ||
          errorString.contains('already registered')) {
        errorMessage = 'Email sudah terdaftar';
      } else if (errorString.contains('server error') ||
          errorString.contains('internal server')) {
        errorMessage = 'Server sedang sibuk, coba lagi';
      } else if (errorString.contains('network') ||
          errorString.contains('connection')) {
        errorMessage = 'Periksa koneksi internet';
      }

      throw Exception(errorMessage);
    }
  }

  Future<void> verifyOTP(String email, String otp) async {
    try {
      // Validasi input
      if (email.isEmpty) {
        throw Exception('Email tidak boleh kosong');
      }

      if (otp.isEmpty || otp.length != 6) {
        throw Exception('Kode OTP harus 6 digit');
      }

      debugPrint('Verifying OTP for email: $email, OTP: $otp');

      final response = await _apiService.verifyOTP(email, otp);

      debugPrint('Verify OTP response: $response');

      // Validasi response
      if (response == null) {
        throw Exception('Response kosong dari server');
      }

      // Periksa apakah response berisi error
      if (response['success'] == false || response['error'] == true) {
        final errorMsg = response['message'] ?? 'Verifikasi OTP gagal';
        throw Exception(errorMsg);
      }

      // Ambil token dan user data
      final token = response['token'];
      final userData = response['user'];

      debugPrint('Token: $token');
      debugPrint('User data: $userData');

      // Validasi token
      if (token == null || token.toString().trim().isEmpty) {
        // Jika tidak ada token, mungkin verifikasi berhasil tapi perlu login
        debugPrint(
          'No token in response, verification successful but need to login',
        );

        // Clear temporary email
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('email_to_verify');

        // Tidak throw exception, biarkan UI handle redirect ke login
        return;
      }

      // Validasi user data
      if (userData == null) {
        throw Exception('Data user tidak ditemukan dalam response');
      }

      // Validate user data structure
      if (userData is! Map<String, dynamic>) {
        throw Exception('Format data user tidak valid');
      }

      // Parse user data safely
      User user;
      try {
        user = User.fromJson(userData);
      } catch (e) {
        debugPrint('Error parsing user data: $e');
        debugPrint('User data structure: $userData');
        throw Exception('Gagal memproses data user: ${e.toString()}');
      }

      // Save auth data
      await _saveAuthData(token.toString(), user);

      // Clear temporary email
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('email_to_verify');

      debugPrint('OTP verification successful');
    } catch (e) {
      debugPrint('Verify OTP error: $e');
      await _clearAuthData();

      // Parse error message for better user experience
      String errorMessage = 'Verifikasi OTP gagal';
      final errorString = e.toString().toLowerCase();

      if (errorString.contains('otp') &&
          (errorString.contains('salah') ||
              errorString.contains('invalid') ||
              errorString.contains('wrong') ||
              errorString.contains('incorrect'))) {
        errorMessage = 'Kode OTP tidak valid';
      } else if (errorString.contains('expired') ||
          errorString.contains('kadaluarsa')) {
        errorMessage = 'Kode OTP sudah kadaluarsa';
      } else if (errorString.contains('not found') ||
          errorString.contains('tidak ditemukan')) {
        errorMessage = 'Email tidak terdaftar';
      } else if (errorString.contains('network') ||
          errorString.contains('connection')) {
        errorMessage = 'Periksa koneksi internet';
      } else if (errorString.contains('timeout')) {
        errorMessage = 'Koneksi timeout, coba lagi';
      } else if (errorString.contains('already verified')) {
        errorMessage = 'Email sudah terverifikasi';
      }

      throw Exception(errorMessage);
    }
  }

  Future<void> _saveAuthData(String token, User user) async {
    try {
      _token = token;
      _user = user;
      _isAuthenticated = true;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('user', json.encode(user.toJson()));
      await prefs.setBool('isAuthenticated', true);

      debugPrint('Auth data saved successfully');
      notifyListeners();
    } catch (e) {
      debugPrint('Error saving auth data: $e');
      throw Exception('Gagal menyimpan data login');
    }
  }

  Future<void> _clearAuthData() async {
    try {
      _token = null;
      _user = null;
      _isAuthenticated = false;

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      await prefs.remove('user');
      await prefs.remove('isAuthenticated');

      debugPrint('Auth data cleared');
      notifyListeners();
    } catch (e) {
      debugPrint('Error clearing auth data: $e');
    }
  }

  Future<void> logout() async {
    await _clearAuthData();
  }

  Future<bool> checkAuthStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null || token.isEmpty) {
        await _clearAuthData();
        return false;
      }

      // Verify token with server
      final userData = await _apiService.getProfile(token);

      if (userData != null) {
        await _saveAuthData(token, User.fromJson(userData));
        return true;
      } else {
        await _clearAuthData();
        return false;
      }
    } catch (e) {
      debugPrint('Check auth status error: $e');
      await _clearAuthData();
      return false;
    }
  }

  Future<void> resendOTP(String email) async {
    try {
      if (email.isEmpty) {
        throw Exception('Email tidak boleh kosong');
      }

      debugPrint('Resending OTP for email: $email');

      await _apiService.resendOTP(email);

      debugPrint('OTP resent successfully');
    } catch (e) {
      debugPrint('Resend OTP error: $e');

      String errorMessage = 'Gagal mengirim ulang OTP';
      final errorString = e.toString().toLowerCase();

      if (errorString.contains('not found') ||
          errorString.contains('tidak ditemukan')) {
        errorMessage = 'Email tidak terdaftar';
      } else if (errorString.contains('network') ||
          errorString.contains('connection')) {
        errorMessage = 'Periksa koneksi internet';
      } else if (errorString.contains('limit') ||
          errorString.contains('too many')) {
        errorMessage = 'Terlalu banyak permintaan, coba lagi nanti';
      }

      throw Exception(errorMessage);
    }
  }
}