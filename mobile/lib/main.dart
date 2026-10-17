import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'core/config/app_config.dart';
import 'core/constants/app_colors.dart';
import 'core/network/api_client.dart';
import 'features/auth/auth_provider.dart';
import 'features/auth/login_screen.dart';
import 'features/dashboard/bottom_nav_shell.dart';
import 'features/dashboard/dashboard_provider.dart';
import 'features/drafts/drafts_provider.dart';
import 'features/assignments/assignments_provider.dart';
import 'features/tutor/tutor_provider.dart';
import 'shared/widgets/loading_indicator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: AppColors.surface,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  final apiClient = ApiClient();

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: apiClient),
        ChangeNotifierProvider(create: (_) => AuthProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => DashboardProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => DraftsProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => AssignmentsProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => TutorProvider(apiClient)),
      ],
      child: const DraftForgeApp(),
    ),
  );
}

class DraftForgeApp extends StatelessWidget {
  const DraftForgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.accent,
          surface: AppColors.surface,
          background: AppColors.background,
        ),
        textTheme: GoogleFonts.outfitTextTheme(Theme.of(context).textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.surface,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: IconThemeData(color: AppColors.textPrimary),
        ),
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    switch (auth.status) {
      case AuthStatus.uninitialized:
        return const Scaffold(
          backgroundColor: AppColors.background,
          body: LoadingIndicator(message: 'Restoring secure university session...'),
        );
      case AuthStatus.authenticated:
        return const BottomNavShell();
      case AuthStatus.unauthenticated:
      default:
        return const LoginScreen();
    }
  }
}
