import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/models/draft_model.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_state_view.dart';
import '../../shared/widgets/tactile_button.dart';
import '../../shared/widgets/tactile_card.dart';
import 'drafts_provider.dart';
import '../evaluations/evaluation_detail_screen.dart';

class DraftDetailScreen extends StatefulWidget {
  final String draftId;

  const DraftDetailScreen({super.key, required this.draftId});

  @override
  State<DraftDetailScreen> createState() => _DraftDetailScreenState();
}

class _DraftDetailScreenState extends State<DraftDetailScreen> {
  int _selectedVersionNumber = 1;
  final _newVersionContentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final draft = await context.read<DraftsProvider>().fetchDraftDetail(widget.draftId);
      if (draft != null && mounted) {
        setState(() {
          _selectedVersionNumber = draft.latestVersionNumber;
        });
      }
    });
  }

  @override
  void dispose() {
    _newVersionContentController.dispose();
    super.dispose();
  }

  void _triggerEvaluation(DraftModel draft) async {
    final draftsProvider = context.read<DraftsProvider>();
    final evaluation = await draftsProvider.triggerEvaluation(draft.id, _selectedVersionNumber);

    if (evaluation != null && mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => EvaluationDetailScreen(
            evaluationId: evaluation.id,
            evaluation: evaluation,
          ),
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(draftsProvider.errorMessage ?? 'Evaluation failed. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _showAddVersionSheet(DraftModel draft) {
    final currentVer = draft.versions.firstWhere(
      (v) => v.versionNumber == _selectedVersionNumber,
      orElse: () => draft.versions.last,
    );
    _newVersionContentController.text = currentVer.rawContent;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Revise into Version ${draft.latestVersionNumber + 1}', style: AppTextStyles.titleMedium),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 20),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _newVersionContentController,
                maxLines: 10,
                decoration: InputDecoration(
                  hintText: 'Edit legal clauses...',
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TactileButton(
                text: 'Save New Version',
                icon: LucideIcons.save,
                onPressed: () async {
                  final text = _newVersionContentController.text.trim();
                  if (text.isEmpty) return;
                  Navigator.of(ctx).pop();
                  final ok = await context.read<DraftsProvider>().addDraftVersion(
                        draftId: draft.id,
                        content: text,
                      );
                  if (ok && mounted) {
                    setState(() {
                      _selectedVersionNumber = draft.latestVersionNumber + 1;
                    });
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final draftsProvider = context.watch<DraftsProvider>();
    final draft = draftsProvider.selectedDraft;

    if (draftsProvider.isLoading && draft == null) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: LoadingIndicator(message: 'Loading statutory provisions...'),
      );
    }

    if (draft == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: ErrorStateView(
          message: draftsProvider.errorMessage ?? 'Unable to find draft record.',
          onRetry: () => draftsProvider.fetchDraftDetail(widget.draftId),
        ),
      );
    }

    final currentVersion = draft.versions.firstWhere(
      (v) => v.versionNumber == _selectedVersionNumber,
      orElse: () => draft.versions.last,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Workspace Viewer', style: AppTextStyles.titleLarge),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.5),
          child: Container(color: AppColors.border, height: 1.5),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: const Border(top: BorderSide(color: AppColors.border, width: 1.5)),
          boxShadow: [
            BoxShadow(
              color: AppColors.border.withOpacity(0.5),
              offset: const Offset(0, -4),
              blurRadius: 8,
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: TactileButton(
                  text: 'Evaluate with AI',
                  icon: LucideIcons.sparkles,
                  backgroundColor: AppColors.accent,
                  textColor: AppColors.primaryDark,
                  isLoading: draftsProvider.isEvaluating,
                  onPressed: () => _triggerEvaluation(draft),
                ),
              ),
              const SizedBox(width: 12),
              TactileButton(
                text: 'Revise',
                icon: LucideIcons.edit2,
                isFullWidth: false,
                backgroundColor: AppColors.surface,
                textColor: AppColors.primary,
                onPressed: () => _showAddVersionSheet(draft),
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header Meta Card
              TactileCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(draft.title, style: AppTextStyles.h2),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSecondary,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Text(
                            draft.documentType.replaceAll('_', ' '),
                            style: AppTextStyles.badge.copyWith(color: AppColors.textSecondary),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text('•', style: AppTextStyles.bodySmall),
                        const SizedBox(width: 8),
                        Text(
                          '${draft.versions.length} Total Versions',
                          style: AppTextStyles.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Version Selector Pill Tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: draft.versions.map((ver) {
                    final isSelected = ver.versionNumber == _selectedVersionNumber;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedVersionNumber = ver.versionNumber),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary : AppColors.surface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? AppColors.primaryDark : AppColors.border,
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                LucideIcons.history,
                                size: 14,
                                color: isSelected ? AppColors.textInverse : AppColors.textMuted,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Version ${ver.versionNumber}',
                                style: AppTextStyles.titleMedium.copyWith(
                                  fontSize: 12,
                                  color: isSelected ? AppColors.textInverse : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16),

              // Legal Text Corpus Box
              TactileCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Operative Text', style: AppTextStyles.titleMedium),
                        Text(
                          '${currentVersion.rawContent.length} chars',
                          style: AppTextStyles.bodySmall,
                        ),
                      ],
                    ),
                    const Divider(height: 24, color: AppColors.border),
                    SelectableText(
                      currentVersion.rawContent,
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontFamily: 'serif',
                        color: AppColors.textPrimary,
                        height: 1.6,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 80), // bottom bar spacing
            ],
          ),
        ),
      ),
    );
  }
}
