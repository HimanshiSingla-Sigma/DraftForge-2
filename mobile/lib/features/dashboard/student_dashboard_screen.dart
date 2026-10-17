import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/tactile_card.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_state_view.dart';
import '../auth/auth_provider.dart';
import 'dashboard_provider.dart';
import '../drafts/create_draft_screen.dart';
import '../drafts/draft_detail_screen.dart';

class StudentDashboardScreen extends StatefulWidget {
  final void Function(int tabIndex)? onNavigateTab;

  const StudentDashboardScreen({super.key, this.onNavigateTab});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadDashboardMetrics();
    });
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dashboard = context.watch<DashboardProvider>();
    final user = auth.currentUser;

    if (dashboard.isLoading && dashboard.progress == null && dashboard.recentDrafts.isEmpty) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: LoadingIndicator(message: 'Loading academic drafting workspace...'),
      );
    }

    if (dashboard.errorMessage != null && dashboard.progress == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: ErrorStateView(
          message: dashboard.errorMessage!,
          onRetry: () => dashboard.loadDashboardMetrics(),
        ),
      );
    }

    final avgScore = dashboard.progress?.averageScore ?? 0.0;
    final totalEvals = dashboard.progress?.totalEvaluations ?? 0;
    final totalDrafts = dashboard.recentDrafts.length;
    final totalAssignments = dashboard.assignments.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: AppColors.surface,
          onRefresh: () => dashboard.loadDashboardMetrics(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Header Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${_getGreeting()},',
                          style: AppTextStyles.bodySmall.copyWith(fontSize: 12),
                        ),
                        Text(
                          user?.fullName ?? user?.email.split('@').first ?? 'Scholar',
                          style: AppTextStyles.h2,
                        ),
                      ],
                    ),
                    const StatusBadge(
                      label: 'NCU Law Scholar',
                      variant: BadgeVariant.neutral,
                      icon: LucideIcons.graduationCap,
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Hero Executive Banner Card
                TactileCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceSecondary,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(LucideIcons.sparkles, color: AppColors.primary, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Text('Evaluation Mastery', style: AppTextStyles.titleMedium),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.successBorder),
                            ),
                            child: Text(
                              '${avgScore.toStringAsFixed(1)}% Avg',
                              style: AppTextStyles.badge.copyWith(color: AppColors.success, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      // 3-Metric Summary Strip
                      Row(
                        children: [
                          Expanded(
                            child: _buildMetricTile(
                              title: 'Drafts',
                              value: totalDrafts.toString(),
                              icon: LucideIcons.fileText,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _buildMetricTile(
                              title: 'Evaluations',
                              value: totalEvals.toString(),
                              icon: LucideIcons.checkCircle2,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _buildMetricTile(
                              title: 'Tasks',
                              value: totalAssignments.toString(),
                              icon: LucideIcons.bookOpen,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Action Bar
                Row(
                  children: [
                    Expanded(
                      child: TactileCard(
                        padding: const EdgeInsets.all(16),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const CreateDraftScreen()),
                          );
                        },
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight.withOpacity(0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.filePlus, color: AppColors.primary, size: 20),
                            ),
                            const SizedBox(height: 10),
                            Text('Draft Clause', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                            Text('New statutory text', style: AppTextStyles.bodySmall),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TactileCard(
                        padding: const EdgeInsets.all(16),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const CreateDraftScreen(initialUploadMode: true)),
                          );
                        },
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.accent.withOpacity(0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.uploadCloud, color: AppColors.accent, size: 20),
                            ),
                            const SizedBox(height: 10),
                            Text('Import Document', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                            Text('PDF, DOCX, TXT', style: AppTextStyles.bodySmall),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // Section: Recent Legal Drafts
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Active Drafting Corpus', style: AppTextStyles.titleLarge),
                    TextButton(
                      onPressed: () => widget.onNavigateTab?.call(1),
                      child: Text('View All', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                if (dashboard.recentDrafts.isEmpty)
                  TactileCard(
                    padding: const EdgeInsets.all(24),
                    child: Center(
                      child: Column(
                        children: [
                          const Icon(LucideIcons.fileSearch, size: 36, color: AppColors.textMuted),
                          const SizedBox(height: 12),
                          Text('No drafts created yet', style: AppTextStyles.titleMedium),
                          const SizedBox(height: 4),
                          Text('Draft your first legal document or import a contract file.', style: AppTextStyles.bodySmall),
                        ],
                      ),
                    ),
                  )
                else
                  ...dashboard.recentDrafts.map((draft) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: TactileCard(
                          padding: const EdgeInsets.all(16),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => DraftDetailScreen(draftId: draft.id)),
                            );
                          },
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceSecondary,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: const Icon(LucideIcons.fileText, color: AppColors.primary, size: 22),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      draft.title,
                                      style: AppTextStyles.titleMedium,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Text(
                                          draft.documentType.replaceAll('_', ' '),
                                          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
                                        ),
                                        const SizedBox(width: 8),
                                        Text('•', style: AppTextStyles.bodySmall),
                                        const SizedBox(width: 8),
                                        Text(
                                          'v${draft.latestVersionNumber}',
                                          style: AppTextStyles.badge.copyWith(color: AppColors.primary),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(LucideIcons.chevronRight, size: 20, color: AppColors.textMuted),
                            ],
                          ),
                        ),
                      )),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, size: 16, color: AppColors.textMuted),
          const SizedBox(height: 6),
          Text(value, style: AppTextStyles.titleMedium.copyWith(fontSize: 16)),
          Text(title, style: AppTextStyles.bodySmall.copyWith(fontSize: 10)),
        ],
      ),
    );
  }
}
