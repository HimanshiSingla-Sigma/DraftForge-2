import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../shared/widgets/empty_state_view.dart';
import '../../shared/widgets/error_state_view.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/tactile_button.dart';
import '../../shared/widgets/tactile_card.dart';
import 'assignments_provider.dart';
import 'submit_assignment_sheet.dart';

class AssignmentsListScreen extends StatefulWidget {
  const AssignmentsListScreen({super.key});

  @override
  State<AssignmentsListScreen> createState() => _AssignmentsListScreenState();
}

class _AssignmentsListScreenState extends State<AssignmentsListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AssignmentsProvider>().fetchAssignments();
    });
  }

  void _openSubmitSheet(assignment) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SubmitAssignmentSheet(assignment: assignment),
    );
  }

  @override
  Widget build(BuildContext context) {
    final assignmentsProvider = context.watch<AssignmentsProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Coursework & Assignments', style: AppTextStyles.titleLarge),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.5),
          child: Container(color: AppColors.border, height: 1.5),
        ),
      ),
      body: SafeArea(
        child: Builder(
          builder: (context) {
            if (assignmentsProvider.isLoading && assignmentsProvider.assignments.isEmpty) {
              return const LoadingIndicator(message: 'Loading assigned coursework...');
            }

            if (assignmentsProvider.errorMessage != null && assignmentsProvider.assignments.isEmpty) {
              return ErrorStateView(
                message: assignmentsProvider.errorMessage!,
                onRetry: () => assignmentsProvider.fetchAssignments(),
              );
            }

            if (assignmentsProvider.assignments.isEmpty) {
              return EmptyStateView(
                icon: LucideIcons.bookOpenCheck,
                title: 'No Pending Coursework',
                description: 'You are completely caught up! New drafting assignments posted by your faculty will appear here.',
              );
            }

            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () => assignmentsProvider.fetchAssignments(),
              child: ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: assignmentsProvider.assignments.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final assignment = assignmentsProvider.assignments[index];
                  return TactileCard(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.surfaceSecondary,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: const Icon(LucideIcons.bookOpen, color: AppColors.primary, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    assignment.title,
                                    style: AppTextStyles.titleMedium,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    assignment.documentType.replaceAll('_', ' '),
                                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            StatusBadge.fromStatus(assignment.status),
                          ],
                        ),
                        if (assignment.description != null && assignment.description!.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          Text(
                            assignment.description!,
                            style: AppTextStyles.bodyMedium,
                          ),
                        ],
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSecondary,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Instructions:',
                                style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                assignment.instructions,
                                style: AppTextStyles.bodySmall.copyWith(height: 1.4),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            if (assignment.deadline != null)
                              Row(
                                children: [
                                  const Icon(LucideIcons.calendar, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Due: ${assignment.deadline!.split("T").first}',
                                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
                                  ),
                                ],
                              )
                            else
                              const SizedBox.shrink(),
                            SizedBox(
                              width: 130,
                              child: TactileButton(
                                text: 'Submit',
                                icon: LucideIcons.send,
                                height: 38,
                                onPressed: () => _openSubmitSheet(assignment),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}
