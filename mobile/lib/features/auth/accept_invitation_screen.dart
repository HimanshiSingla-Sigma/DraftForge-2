import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/models/auth_response_model.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/tactile_button.dart';
import '../../shared/widgets/tactile_card.dart';
import 'auth_provider.dart';

class AcceptInvitationScreen extends StatefulWidget {
  final String? initialToken;

  const AcceptInvitationScreen({super.key, this.initialToken});

  @override
  State<AcceptInvitationScreen> createState() => _AcceptInvitationScreenState();
}

class _AcceptInvitationScreenState extends State<AcceptInvitationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tokenController = TextEditingController();
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isVerifying = false;
  InvitationVerificationModel? _verifiedInvite;
  String? _verificationError;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    if (widget.initialToken != null) {
      _tokenController.text = widget.initialToken!;
      _verifyToken();
    }
  }

  @override
  void dispose() {
    _tokenController.dispose();
    _nameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String _cleanToken(String input) {
    var raw = input.trim();
    if (raw.contains('token=')) {
      final uri = Uri.tryParse(raw);
      if (uri != null && uri.queryParameters.containsKey('token')) {
        return uri.queryParameters['token']!;
      }
      final parts = raw.split('token=');
      if (parts.length > 1) {
        return parts[1].split('&').first;
      }
    }
    return raw;
  }

  Future<void> _verifyToken() async {
    final rawInput = _tokenController.text.trim();
    if (rawInput.isEmpty) return;

    final token = _cleanToken(rawInput);
    setState(() {
      _isVerifying = true;
      _verificationError = null;
      _verifiedInvite = null;
    });

    final auth = context.read<AuthProvider>();
    final invite = await auth.verifyInvitationToken(token);

    if (mounted) {
      setState(() {
        _isVerifying = false;
        if (invite != null && invite.valid) {
          _verifiedInvite = invite;
          if (invite.assignedName != null && invite.assignedName!.isNotEmpty) {
            _nameController.text = invite.assignedName!;
          }
        } else {
          _verificationError = invite?.message ?? 'Invalid or expired invitation token.';
        }
      });
    }
  }

  void _activateAccount() async {
    if (!_formKey.currentState!.validate()) return;
    if (_verifiedInvite == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please verify your invitation token first.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final auth = context.read<AuthProvider>();
    final token = _cleanToken(_tokenController.text.trim());

    final success = await auth.acceptInvitation(
      token: token,
      password: _passwordController.text,
      fullName: _nameController.text.trim(),
    );

    if (success && mounted) {
      Navigator.of(context).pop(); // Pops back; AuthProvider state navigates to Dashboard
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Activation failed. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Account Activation', style: AppTextStyles.titleLarge),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.5),
          child: Container(color: AppColors.border, height: 1.5),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Step 1: Token Verification Card
                TactileCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceSecondary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(LucideIcons.key, color: AppColors.primary, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Invitation Link or Token', style: AppTextStyles.titleMedium),
                                Text('Paste your activation link from email', style: AppTextStyles.bodySmall),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _tokenController,
                        decoration: InputDecoration(
                          hintText: 'Paste token or full accept-invitation URL...',
                          hintStyle: AppTextStyles.bodySmall,
                          filled: true,
                          fillColor: AppColors.background,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TactileButton(
                        text: 'Verify Invitation',
                        icon: LucideIcons.checkCircle2,
                        isLoading: _isVerifying,
                        height: 44,
                        onPressed: _verifyToken,
                      ),
                      if (_verificationError != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.errorLight,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.errorBorder),
                          ),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.alertTriangle, size: 16, color: AppColors.error),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _verificationError!,
                                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Step 2: Set Password & Activate (Shown once token verified)
                if (_verifiedInvite != null) ...[
                  const SizedBox(height: 24),
                  TactileCard(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Authorized Scholar', style: AppTextStyles.titleMedium),
                            StatusBadge.fromStatus(_verifiedInvite!.role),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _verifiedInvite!.email,
                          style: AppTextStyles.titleLarge.copyWith(color: AppColors.primary),
                        ),
                        const Divider(height: 28, color: AppColors.border),

                        Text('Full Name (Optional)', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _nameController,
                          decoration: InputDecoration(
                            hintText: 'e.g. Adv. Priya Sharma',
                            filled: true,
                            fillColor: AppColors.background,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        Text('Create Password', style: AppTextStyles.titleMedium.copyWith(fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            hintText: 'Minimum 8 characters...',
                            filled: true,
                            fillColor: AppColors.background,
                            suffixIcon: IconButton(
                              icon: Icon(_obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye, size: 18),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.length < 8) {
                              return 'Password must be at least 8 characters';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),

                        TactileButton(
                          text: 'Activate Account & Enter Studio',
                          icon: LucideIcons.sparkles,
                          isLoading: auth.isLoading,
                          backgroundColor: AppColors.success,
                          onPressed: _activateAccount,
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
