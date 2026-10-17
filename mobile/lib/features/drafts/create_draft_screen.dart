import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../shared/widgets/tactile_button.dart';
import '../../shared/widgets/tactile_card.dart';
import 'drafts_provider.dart';
import 'draft_detail_screen.dart';

class CreateDraftScreen extends StatefulWidget {
  final bool initialUploadMode;

  const CreateDraftScreen({super.key, this.initialUploadMode = false});

  @override
  State<CreateDraftScreen> createState() => _CreateDraftScreenState();
}

class _CreateDraftScreenState extends State<CreateDraftScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();

  late bool _isUploadMode;
  String _selectedDocType = 'CONTRACT';
  File? _selectedFile;
  String? _selectedFileName;

  final List<Map<String, String>> _docTypes = [
    {'value': 'CONTRACT', 'label': 'Commercial Contract'},
    {'value': 'STATUTE', 'label': 'Statutory Act / Bill'},
    {'value': 'LEGAL_BRIEF', 'label': 'Appellate Legal Brief'},
    {'value': 'COMPLIANCE_POLICY', 'label': 'Regulatory Policy'},
  ];

  @override
  void initState() {
    super.initState();
    _isUploadMode = widget.initialUploadMode;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'docx', 'txt'],
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _selectedFile = File(result.files.single.path!);
        _selectedFileName = result.files.single.name;
        if (_titleController.text.isEmpty) {
          _titleController.text = _selectedFileName!.split('.').first;
        }
      });
    }
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final draftsProvider = context.read<DraftsProvider>();

    if (_isUploadMode) {
      if (_selectedFile == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a document file (.pdf, .docx, .txt).'), backgroundColor: AppColors.error),
        );
        return;
      }

      final draft = await draftsProvider.uploadDraftFile(
        file: _selectedFile!,
        title: _titleController.text.trim(),
      );

      if (draft != null && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => DraftDetailScreen(draftId: draft.id)),
        );
      }
    } else {
      final draft = await draftsProvider.createRawDraft(
        title: _titleController.text.trim(),
        documentType: _selectedDocType,
        rawContent: _contentController.text.trim(),
      );

      if (draft != null && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => DraftDetailScreen(draftId: draft.id)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final draftsProvider = context.watch<DraftsProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isUploadMode ? 'Import Legal Document' : 'New Legal Draft', style: AppTextStyles.titleLarge),
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
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Mode Toggle Segment
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSecondary,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isUploadMode = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: !_isUploadMode ? AppColors.surface : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: !_isUploadMode
                                  ? const [BoxShadow(color: AppColors.border, offset: Offset(0, 2), blurRadius: 0)]
                                  : null,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.edit3, size: 16, color: !_isUploadMode ? AppColors.primary : AppColors.textMuted),
                                const SizedBox(width: 8),
                                Text(
                                  'Direct Editor',
                                  style: AppTextStyles.titleMedium.copyWith(
                                    fontSize: 13,
                                    color: !_isUploadMode ? AppColors.primary : AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isUploadMode = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: _isUploadMode ? AppColors.surface : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: _isUploadMode
                                  ? const [BoxShadow(color: AppColors.border, offset: Offset(0, 2), blurRadius: 0)]
                                  : null,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.uploadCloud, size: 16, color: _isUploadMode ? AppColors.primary : AppColors.textMuted),
                                const SizedBox(width: 8),
                                Text(
                                  'Import File',
                                  style: AppTextStyles.titleMedium.copyWith(
                                    fontSize: 13,
                                    color: _isUploadMode ? AppColors.primary : AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Title Input
                Text('Document Title', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    hintText: 'e.g. Non-Disclosure Agreement (v1)',
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                    ),
                  ),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Please enter a document title' : null,
                ),
                const SizedBox(height: 18),

                // Document Classification Dropdown
                Text('Statutory Classification', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: _selectedDocType,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                    ),
                  ),
                  items: _docTypes.map((dt) {
                    return DropdownMenuItem(
                      value: dt['value'],
                      child: Text(dt['label']!, style: AppTextStyles.bodyMedium),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedDocType = val);
                  },
                ),
                const SizedBox(height: 18),

                // Editor vs Upload Zone
                if (_isUploadMode) ...[
                  Text('Document File (.pdf, .docx, .txt)', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                  const SizedBox(height: 6),
                  TactileCard(
                    padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
                    onTap: _pickFile,
                    child: Center(
                      child: Column(
                        children: [
                          Icon(
                            _selectedFile != null ? LucideIcons.fileCheck : LucideIcons.uploadCloud,
                            size: 40,
                            color: _selectedFile != null ? AppColors.success : AppColors.primary,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _selectedFileName ?? 'Tap to select document from device',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: _selectedFile != null ? AppColors.success : AppColors.textPrimary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 4),
                          Text('Supported formats: PDF, Microsoft Word DOCX, Plain TXT', style: AppTextStyles.bodySmall),
                        ],
                      ),
                    ),
                  ),
                ] else ...[
                  Text('Legal Provisions / Statutory Clauses', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _contentController,
                    maxLines: 12,
                    keyboardType: TextInputType.multiline,
                    decoration: InputDecoration(
                      hintText: 'Enter contract terms, recitals, operative clauses, dispute resolution provisions...',
                      hintStyle: AppTextStyles.bodySmall,
                      filled: true,
                      fillColor: AppColors.surface,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                      ),
                    ),
                    validator: (v) {
                      if (!_isUploadMode && (v == null || v.trim().length < 20)) {
                        return 'Please provide at least 20 characters of legal drafting content.';
                      }
                      return null;
                    },
                  ),
                ],

                const SizedBox(height: 28),

                TactileButton(
                  text: _isUploadMode ? 'Upload & Parse Document' : 'Save & Prepare Draft',
                  icon: LucideIcons.check,
                  isLoading: draftsProvider.isLoading,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
