import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/report_downloader.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = authService.user;
    final navigator = Navigator.of(context);

    Future<void> exportReport() async {
      if (authService.token == null) return;
      Navigator.of(context).pop();
      try {
        final api = Provider.of<ApiService>(context, listen: false);
        final csv = await api.exportBarangCsv(authService.token!);
        final message = await saveCsvReport('laporan-barang.csv', csv);
        if (!context.mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(message)));
      } catch (error) {
        if (!context.mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Unduh laporan gagal: $error')));
      }
    }

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            accountName: Text(user?.nama ?? 'User'),
            accountEmail: Text(user?.email ?? ''),
            currentAccountPicture: CircleAvatar(child: Icon(Icons.person)),
          ),
          ListTile(
            leading: Icon(Icons.dashboard),
            title: Text('Dashboard'),
            onTap: () {
              navigator.popAndPushNamed('/home');
            },
          ),
          ListTile(
            leading: Icon(Icons.inventory),
            title: Text('Barang'),
            onTap: () {
              navigator.popAndPushNamed('/barang_list');
            },
          ),
          ListTile(
            leading: const Icon(Icons.bar_chart),
            title: const Text('Mutasi Stok'),
            onTap: () {
              navigator.popAndPushNamed('/mutasi');
            },
          ),
          ListTile(
            leading: const Icon(Icons.download),
            title: const Text('Unduh Laporan'),
            onTap: exportReport,
          ),
          Divider(),
          ListTile(
            leading: Icon(Icons.logout),
            title: Text('Logout'),
            onTap: () async {
              await authService.logout();
              if (!navigator.mounted) return;
              navigator.popAndPushNamed('/login');
            },
          ),
        ],
      ),
    );
  }
}
