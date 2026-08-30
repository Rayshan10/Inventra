class Config {
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'http://10.0.2.2:3000', // Default untuk Android emulator
  );

  // Untuk build berbeda:
  // - Android emulator: http://10.0.2.2:3000
  // - iOS simulator: http://localhost:3000
  // - Web: http://localhost:3000
  // - Perangkat fisik: http://<IP-LAN>:3000
}