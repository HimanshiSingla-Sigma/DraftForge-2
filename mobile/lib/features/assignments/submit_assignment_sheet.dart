import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/models/assignment_model.dart';
import '../../core/models/draft_model.dart';
import '../../shared/widgets/tactile_button.dart';
import '../drafts/drafts_provider.dart';
import 'assignments_provider.dart';

class SubmitAssignmentSheet extends StatefulWidget {
  final AssignmentModel assignment;

  const SubmitAssignmentSheet({super.key, required this.assignment});

  @override
  State<SubmitAssignmentSheet> createState() => _SubmitAssignmentSheetState();
}

class _SubmitAssignmentSheetState extends State<SubmitAssignmentSheet> {
  DraftModel? _selectedDraft;
  DraftVersionModel? _selectedVersion;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DraftsProvider>().fetchDrafts();
    });
  }

  void _submit() async {
    if (_selectedDraft == null || _selectedVersion == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a legal draft and version to submit.')),
      );
      return;
    }

    final assignmentsProvider = context.read<AssignmentsProvider>();
    final submission = await assignmentsProvider.submitAssignment(
      assignmentId: widget.assignment.id,
      draftId: _selectedDraft!.id,
      draftVersionId: _selectedVersion!.id,
    );

    if (submission != null && mounted) {
      Navigator.of(context).pop(true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Coursework submitted successfully to faculty instructor!'),
          backgroundColor: AppColors.success,
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(assignmentsProvider.errorMessage ?? 'Submission failed.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final draftsProvider = context.watch<DraftsProvider>();
    final assignmentsProvider = context.watch<AssignmentsProvider>();

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Submit Coursework', style: AppTextStyles.titleLarge),
              IconButton(
                icon: const Icon(LucideIcons.x, size: 20),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(widget.assignment.title, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
          const Divider(height: 24, color: AppColors.border),

          // Pick Draft Dropdown
          Text('Select Legal Draft from Corpus', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
          const SizedBox(height: 6),
          if (draftsProvider.drafts.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                'No drafts available. Please draft an agreement in the Workspace first.',
                style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
              ),
            )
          else
            DropdownButtonFormField<DraftModel>(
              value: _selectedDraft,
              hint: const Text('Choose draft...'),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
              items: draftsProvider.drafts.map((d) {
                return DropdownMenuItem(
                  value: d,
                  child: Text(d.title, overflow: TextOverflow.ellipsis),
                );
              }).toList(),
              onChanged: (d) {
                setState(() {
                  _selectedDraft = d;
                  _selectedVersion = d?.latestVersion;
                });
              },
            ),

          if (_selectedDraft != null && _selectedDraft!.versions.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text('Select Version to Submit', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
            const SizedBox(height: 6),
            DropdownButtonFormField<DraftVersionModel>(
              value: _selectedVersion,
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
              items: _selectedDraft!.versions.map((v) {
                return DropdownMenuItem(
                  value: v,
                  child: Text('Version ${v.versionNumber} (${v.rawContent.length} chars)'),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedVersion = v),
            ),
          ],

          const SizedBox(height: 24),
          TactileButton(
            text: 'Submit to Faculty',
            icon: LucideIcons.send,
            isLoading: assignmentsProvider.isSubmitting,
            backgroundColor: AppColors.primary,
            onPressed: _selectedDraft != null && _selectedVersion != null ? _submit : null,
          ),
        ],
      ),
    );
  }
}
