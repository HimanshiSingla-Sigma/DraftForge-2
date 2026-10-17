enum AppEnvironment {
  production,
  staging,
  localDevelopment,
}

class AppConfig {
  static const String appName = 'DraftForge AI';
  static const String appVersion = '1.0.0';

  // Active Environment (default to production for immediate connectivity)
  static AppEnvironment currentEnvironment = AppEnvironment.production;

  // Render Cloud Production API
  static const String _productionBaseUrl = 'https://draftforge-2-d9mc.onrender.com/api/v1';

  // Local Development URLs (10.0.2.2 for Android Emulator, 127.0.0.1 for iOS Simulator)
  static const String _androidLocalBaseUrl = 'http://10.0.2.2:8000/api/v1';
  static const String _iosLocalBaseUrl = 'http://127.0.0.1:8000/api/v1';

  static String get baseUrl {
    switch (currentEnvironment) {
      case AppEnvironment.production:
        return _productionBaseUrl;
      case AppEnvironment.staging:
        return _productionBaseUrl;
      case AppEnvironment.localDevelopment:
        return _productionBaseUrl; // Safe fallback; configure per platform if running locally
    }
  }

  // Network timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 45);
}
