import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'screens/dashboard/barang_list.dart';
import 'screens/dashboard/home.dart';
import 'screens/auth/login.dart';
import 'screens/auth/verify_otp.dart'; // Tambahkan import

void main() {
  final httpClient = http.Client();
  final apiService = ApiService(
    baseUrl: kDebugMode ? 'http://127.0.0.1:3000' : 'https://api.tokobuku.com',
    client: httpClient,
  );

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>(create: (_) => apiService),
        ChangeNotifierProvider<AuthService>(
          create: (_) => AuthService(apiService: apiService),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Toko Buku',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF4F7FB),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2F80ED),
          brightness: Brightness.light,
          surface: Colors.white,
        ).copyWith(
          primary: const Color(0xFF2F80ED),
          onPrimary: Colors.white,
          secondary: const Color(0xFF28A889),
          error: const Color(0xFFD94B5B),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF17324D),
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 15,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(6)),
            borderSide: BorderSide(color: Color(0xFFD7E1EA)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(6)),
            borderSide: BorderSide(color: Color(0xFFD7E1EA)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(6)),
            borderSide: BorderSide(color: Color(0xFF2F80ED), width: 2),
          ),
        ),
        cardTheme: const CardThemeData(
          color: Colors.white,
          elevation: 1,
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2F80ED),
            foregroundColor: Colors.white,
            minimumSize: const Size(0, 48),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(6)),
            ),
          ),
        ),
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      routes: {
        '/login': (context) => LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/verify-otp': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map;
          return VerifyOtpScreen(email: args['email']);
        },
        '/barang_list': (context) => BarangListScreen(),
      },
      home: FutureBuilder(
        future: Provider.of<AuthService>(context, listen: false).initialize(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (snapshot.hasError) {
            return Scaffold(
              body: Center(child: Text('Error: ${snapshot.error}')),
            );
          }

          return Consumer<AuthService>(
            builder: (context, auth, _) {
              if (auth.isAuthenticated) {
                return const HomeScreen();
              } else {
                return LoginScreen();
              }
            },
          );
        },
      ),
    );
  }
}
