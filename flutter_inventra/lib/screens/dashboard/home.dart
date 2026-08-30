import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../auth/login.dart';
import 'barang_list.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard'),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              await _performLogout(context);
            },
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

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Welcome, ${authService.user?.nama ?? 'User'}!',
                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => BarangListScreen()),
                    );
                  },
                  child: Text('Manage Barang'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _performLogout(BuildContext context) async {
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      await authService.logout();
      
      // Navigasi ke login setelah logout berhasil
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => LoginScreen()),
        (Route<dynamic> route) => false,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Logout gagal: ${e.toString()}')),
      );
    }
  }
}