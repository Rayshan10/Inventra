// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:flutter_tokobuku/main.dart';
import 'package:flutter_tokobuku/services/api_service.dart';
import 'package:flutter_tokobuku/services/auth_service.dart';
import 'package:flutter_tokobuku/screens/auth/login.dart';

void main() {
  testWidgets('MyApp displays login screen when unauthenticated', (
    WidgetTester tester,
  ) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.clear();

    final apiService = ApiService(
      baseUrl: 'http://localhost:3000',
      client: http.Client(),
    );

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          Provider<ApiService>.value(value: apiService),
          ChangeNotifierProvider<AuthService>(
            create: (_) => AuthService(apiService: apiService),
          ),
        ],
        child: const MyApp(),
      ),
    );

    await tester.pump(const Duration(seconds: 2));

    expect(find.byType(LoginScreen), findsOneWidget);
  });
}
