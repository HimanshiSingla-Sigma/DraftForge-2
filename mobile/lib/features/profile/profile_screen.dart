import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/tactile_button.dart';
import '../../shared/widgets/tactile_card.dart';
import '../auth/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Scholar Profile & Security', style: AppTextStyles.titleLarge),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.5),
          child: Container(color: AppColors.border, height: 1.5),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // User Identity Card
              TactileCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.primaryDark, width: 2),
                      ),
                      child: Center(
                        child: Text(
                          (user?.fullName?.isNotEmpty == true
                                  ? user!.fullName![0]
                                  : user?.email.isNotEmpty == true
                                      ? user!.email[0]
                                      : 'S')
                              .toUpperCase(),
                          style: AppTextStyles.h1.copyWith(color: AppColors.textInverse),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      user?.fullName ?? 'Academic Legal Scholar',
                      style: AppTextStyles.h2,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? '',
                      style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    StatusBadge(
                      label: user?.role ?? 'STUDENT',
                      variant: BadgeVariant.neutral,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Account & Platform Information Card
              TactileCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('System Specifications', style: AppTextStyles.titleMedium),
                    const SizedBox(height: 14),
                    _buildInfoRow('University Domain', 'The NorthCap University (@ncuindia.edu)'),
                    const Divider(height: 20, color: AppColors.border),
                    _buildInfoRow('API Gateway', 'Production Cloud (Render HTTPS)'),
                    const Divider(height: 20, color: AppColors.border),
                    _buildInfoRow('Application Version', 'DraftForge Mobile v${AppConfig.appVersion}'),
                    const Divider(height: 20, color: AppColors.border),
                    _buildInfoRow('Security Architecture', 'Encrypted SharedPreferences & Keychain'),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Academic Compliance & Store Notice
              TactileCard(
                backgroundColor: AppColors.surfaceSecondary,
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(LucideIcons.shieldCheck, color: AppColors.primary, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Academic Integrity & Privacy', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                          const SizedBox(height: 2),
                          Text(
                            'All legal drafts and evaluation records are bound strictly to your authenticated institution profile. Data retention follows NCU Law department guidelines.',
                            style: AppTextStyles.bodySmall.copyWith(height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Logout Button
              TactileButton(
                text: 'Sign Out of Studio',
                icon: LucideIcons.logOut,
                backgroundColor: AppColors.errorLight,
                textColor: AppColors.error,
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: Text('Sign Out?', style: AppTextStyles.titleLarge),
                      content: Text('Are you sure you want to sign out of DraftForge AI?', style: AppTextStyles.bodyMedium),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(ctx).pop();
                            auth.logout();
                          },
                          child: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}
