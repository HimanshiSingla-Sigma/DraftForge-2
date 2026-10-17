import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../shared/widgets/empty_state_view.dart';
import '../../shared/widgets/error_state_view.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/tactile_card.dart';
import 'drafts_provider.dart';
import 'draft_detail_screen.dart';
import 'create_draft_screen.dart';

class DraftsListScreen extends StatefulWidget {
  const DraftsListScreen({super.key});

  @override
  State<DraftsListScreen> createState() => _DraftsListScreenState();
}

class _DraftsListScreenState extends State<DraftsListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DraftsProvider>().fetchDrafts();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final draftsProvider = context.watch<DraftsProvider>();

    final filteredDrafts = draftsProvider.drafts.where((draft) {
      if (_searchQuery.isEmpty) return true;
      return draft.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          draft.documentType.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Legal Drafting Corpus', style: AppTextStyles.titleLarge),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.5),
          child: Container(color: AppColors.border, height: 1.5),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        elevation: 4,
        icon: const Icon(LucideIcons.filePlus, color: AppColors.textInverse),
        label: Text('New Draft', style: AppTextStyles.button),
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const CreateDraftScreen()),
          );
        },
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search & Filter Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: InputDecoration(
                  hintText: 'Search drafts by title or type...',
                  hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
                  prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.textMuted),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(LucideIcons.x, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.surface,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                  ),
                ),
              ),
            ),

            // Content List
            Expanded(
              child: Builder(
                builder: (context) {
                  if (draftsProvider.isLoading && draftsProvider.drafts.isEmpty) {
                    return const LoadingIndicator(message: 'Loading your legal drafts...');
                  }

                  if (draftsProvider.errorMessage != null && draftsProvider.drafts.isEmpty) {
                    return ErrorStateView(
                      message: draftsProvider.errorMessage!,
                      onRetry: () => draftsProvider.fetchDrafts(),
                    );
                  }

                  if (filteredDrafts.isEmpty) {
                    return EmptyStateView(
                      icon: LucideIcons.fileText,
                      title: _searchQuery.isNotEmpty ? 'No Matching Drafts' : 'No Legal Drafts Yet',
                      description: _searchQuery.isNotEmpty
                          ? 'Try adjusting your search terms.'
                          : 'Begin by drafting a statutory clause or uploading a legal agreement.',
                      actionText: _searchQuery.isEmpty ? 'Create First Draft' : null,
                      onAction: _searchQuery.isEmpty
                          ? () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const CreateDraftScreen()),
                              );
                            }
                          : null,
                    );
                  }

                  return RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () => draftsProvider.fetchDrafts(),
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 80),
                      itemCount: filteredDrafts.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final draft = filteredDrafts[index];
                        return TactileCard(
                          padding: const EdgeInsets.all(16),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => DraftDetailScreen(draftId: draft.id)),
                            );
                          },
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
                                    child: const Icon(LucideIcons.fileText, color: AppColors.primary, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          draft.title,
                                          style: AppTextStyles.titleMedium,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          draft.documentType.replaceAll('_', ' '),
                                          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceSecondary,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: AppColors.border),
                                    ),
                                    child: Text(
                                      'v${draft.latestVersionNumber}',
                                      style: AppTextStyles.badge.copyWith(color: AppColors.primary),
                                    ),
                                  ),
                                ],
                              ),
                              if (draft.latestVersion != null) ...[
                                const Divider(height: 20, color: AppColors.border),
                                Text(
                                  draft.latestVersion!.rawContent.replaceAll('\n', ' ').trim(),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.textSecondary,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
