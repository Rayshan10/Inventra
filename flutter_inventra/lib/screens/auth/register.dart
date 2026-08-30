import 'package:flutter/material.dart';
import 'package:flutter_tokobuku/screens/auth/verify_otp.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;
  
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _slideAnimation = Tween<Offset>(
      begin: Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    
    _animationController.forward();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await Provider.of<AuthService>(context, listen: false).register(
        _namaController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text.trim(),
      );

      // Navigasi dengan membawa data email
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => 
            VerifyOtpScreen(email: _emailController.text.trim()),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position: Tween<Offset>(
                begin: Offset(1.0, 0.0),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            );
          },
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');

        // Tampilkan pesan lebih user-friendly
        if (_errorMessage!.contains('already registered')) {
          _errorMessage = 'Email sudah terdaftar';
        } else if (_errorMessage!.contains('Server busy')) {
          _errorMessage = 'Server sibuk, silakan coba lagi';
        }
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF667eea),
              Color(0xFF764ba2),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Custom App Bar
              Container(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        icon: Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),
                    Expanded(
                      child: Center(
                        child: Text(
                          'Daftar Akun',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: 48), // Balance the back button
                  ],
                ),
              ),
              
              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Column(
                        children: [
                          // Header Section
                          Container(
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.person_add,
                              size: 50,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 20),
                          Text(
                            'Bergabung dengan TokoBuku',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Buat akun baru untuk mulai berbelanja',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.8),
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 40),
                          
                          // Form Section
                          Container(
                            padding: EdgeInsets.all(32),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 20,
                                  offset: Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                children: [
                                  // Error Message
                                  if (_errorMessage != null) ...[
                                    Container(
                                      width: double.infinity,
                                      padding: EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.red[50],
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: Colors.red[200]!),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(Icons.error_outline, color: Colors.red[600], size: 20),
                                          SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              _errorMessage!,
                                              style: TextStyle(
                                                color: Colors.red[700],
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    SizedBox(height: 20),
                                  ],
                                  
                                  // Nama Field
                                  TextFormField(
                                    controller: _namaController,
                                    decoration: InputDecoration(
                                      labelText: 'Nama Lengkap',
                                      hintText: 'Masukkan nama lengkap Anda',
                                      prefixIcon: Container(
                                        margin: EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Color(0xFF667eea).withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Icon(Icons.person_outline, color: Color(0xFF667eea)),
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide.none,
                                      ),
                                      filled: true,
                                      fillColor: Colors.grey[50],
                                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Masukkan nama lengkap Anda';
                                      }
                                      if (value.length < 2) {
                                        return 'Nama minimal 2 karakter';
                                      }
                                      return null;
                                    },
                                  ),
                                  SizedBox(height: 20),
                                  
                                  // Email Field
                                  TextFormField(
                                    controller: _emailController,
                                    decoration: InputDecoration(
                                      labelText: 'Email',
                                      hintText: 'Masukkan alamat email Anda',
                                      prefixIcon: Container(
                                        margin: EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Color(0xFF667eea).withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Icon(Icons.email_outlined, color: Color(0xFF667eea)),
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide.none,
                                      ),
                                      filled: true,
                                      fillColor: Colors.grey[50],
                                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                    ),
                                    keyboardType: TextInputType.emailAddress,
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Masukkan alamat email Anda';
                                      }
                                      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                                        return 'Masukkan email yang valid';
                                      }
                                      return null;
                                    },
                                  ),
                                  SizedBox(height: 20),
                                  
                                  // Password Field
                                  TextFormField(
                                    controller: _passwordController,
                                    decoration: InputDecoration(
                                      labelText: 'Password',
                                      hintText: 'Buat password yang kuat',
                                      prefixIcon: Container(
                                        margin: EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Color(0xFF667eea).withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Icon(Icons.lock_outline, color: Color(0xFF667eea)),
                                      ),
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                          color: Colors.grey[600],
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _obscurePassword = !_obscurePassword;
                                          });
                                        },
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide.none,
                                      ),
                                      filled: true,
                                      fillColor: Colors.grey[50],
                                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                    ),
                                    obscureText: _obscurePassword,
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Masukkan password Anda';
                                      }
                                      if (value.length < 6) {
                                        return 'Password minimal 6 karakter';
                                      }
                                      return null;
                                    },
                                  ),
                                  
                                  // Password Strength Indicator
                                  if (_passwordController.text.isNotEmpty) ...[
                                    SizedBox(height: 12),
                                    _buildPasswordStrengthIndicator(_passwordController.text),
                                  ],
                                  
                                  SizedBox(height: 30),
                                  
                                  // Register Button
                                  Container(
                                    width: double.infinity,
                                    height: 56,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Color(0xFF667eea).withOpacity(0.3),
                                          blurRadius: 8,
                                          offset: Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: ElevatedButton(
                                      onPressed: _isLoading ? null : _submit,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.transparent,
                                        shadowColor: Colors.transparent,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                      child: _isLoading
                                          ? SizedBox(
                                              width: 24,
                                              height: 24,
                                              child: CircularProgressIndicator(
                                                color: Colors.white,
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : Text(
                                              'DAFTAR',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                letterSpacing: 1,
                                              ),
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(height: 24),
                          
                          // Login Link
                          Container(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Sudah punya akun? ',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.8),
                                    fontSize: 14,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => Navigator.pop(context),
                                  child: Text(
                                    'Masuk di sini',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordStrengthIndicator(String password) {
    int strength = _calculatePasswordStrength(password);
    Color color;
    String text;
    
    if (strength == 0) {
      color = Colors.red;
      text = 'Lemah';
    } else if (strength == 1) {
      color = Colors.orange;
      text = 'Sedang';
    } else {
      color = Colors.green;
      text = 'Kuat';
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Container(
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: (strength + 1) / 3,
                  child: Container(
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(width: 8),
            Text(
              text,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  int _calculatePasswordStrength(String password) {
    if (password.length < 6) return 0;
    
    int score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    
    // Contains numbers and letters
    if (password.contains(RegExp(r'[0-9]')) && password.contains(RegExp(r'[a-zA-Z]'))) score++;
    
    return score > 2 ? 2 : score;
  }

  @override
  void dispose() {
    _animationController.dispose();
    _namaController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}