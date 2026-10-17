import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/tactile_card.dart';
import 'tutor_provider.dart';

class TutorChatScreen extends StatefulWidget {
  const TutorChatScreen({super.key});

  @override
  State<TutorChatScreen> createState() => _TutorChatScreenState();
}

class _TutorChatScreenState extends State<TutorChatScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();

  final List<String> _quickPrompts = [
    'How do I structure an indemnity clause?',
    'What causes a gap penalty in contract review?',
    'Explain the doctrine of frustration in Indian Contract Act',
    'Best practices for dispute resolution provisions',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TutorProvider>().initializeConversation();
    });
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send([String? prompt]) async {
    final text = prompt ?? _inputController.text;
    if (text.trim().isEmpty) return;

    _inputController.clear();
    _scrollToBottom();

    final ok = await context.read<TutorProvider>().sendMessage(text);
    if (ok) {
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final tutor = context.watch<TutorProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.sparkles, color: AppColors.accent, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Socratic Legal AI Tutor', style: AppTextStyles.titleMedium),
                Text('Evidence-Grounded Law Mentor', style: AppTextStyles.bodySmall),
              ],
            ),
          ],
        ),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.5),
          child: Container(color: AppColors.border, height: 1.5),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Messages List
            Expanded(
              child: Builder(
                builder: (context) {
                  if (tutor.isLoading && tutor.messages.isEmpty) {
                    return const LoadingIndicator(message: 'Initializing legal knowledge base...');
                  }

                  if (tutor.messages.isEmpty) {
                    return SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          const SizedBox(height: 20),
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: AppColors.surfaceSecondary,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.border, width: 2),
                            ),
                            child: const Icon(LucideIcons.messageSquare, color: AppColors.primary, size: 28),
                          ),
                          const SizedBox(height: 16),
                          Text('Ask Your Legal Socratic Tutor', style: AppTextStyles.titleLarge),
                          const SizedBox(height: 6),
                          Text(
                            'Receive guidance on statutory clauses, gap remedies, and rubric evaluation criteria.',
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 28),
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text('Suggested Legal Inquiries:', style: AppTextStyles.titleMedium.copyWith(fontSize: 12)),
                          ),
                          const SizedBox(height: 10),
                          ..._quickPrompts.map((p) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: TactileCard(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  onTap: () => _send(p),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.arrowRight, size: 14, color: AppColors.primary),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(p, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primaryDark)),
                                      ),
                                    ],
                                  ),
                                ),
                              )),
                        ],
                      ),
                    );
                  }

                  return ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    itemCount: tutor.messages.length + (tutor.isSending ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == tutor.messages.length && tutor.isSending) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12, left: 12),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    const SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(AppColors.primary)),
                                    ),
                                    const SizedBox(width: 8),
                                    Text('Analyzing jurisprudence...', style: AppTextStyles.bodySmall),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      final msg = tutor.messages[index];
                      return _buildMessageBubble(msg);
                    },
                  );
                },
              ),
            ),

            // Input Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: const Border(top: BorderSide(color: AppColors.border, width: 1.5)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _inputController,
                      maxLines: 4,
                      minLines: 1,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        hintText: 'Ask a legal drafting or evaluation question...',
                        hintStyle: AppTextStyles.bodySmall,
                        filled: true,
                        fillColor: AppColors.background,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primaryDark, width: 1.5),
                    ),
                    child: IconButton(
                      icon: const Icon(LucideIcons.send, color: AppColors.textInverse, size: 18),
                      onPressed: tutor.isSending ? null : () => _send(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(msg) {
    final isUser = msg.isUser;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.scale, color: AppColors.accent, size: 14),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(16).copyWith(
                  bottomRight: isUser ? const Radius.circular(2) : const Radius.circular(16),
                  bottomLeft: !isUser ? const Radius.circular(2) : const Radius.circular(16),
                ),
                border: Border.all(
                  color: isUser ? AppColors.primaryDark : AppColors.border,
                  width: 1.5,
                ),
                boxShadow: const [
                  BoxShadow(color: AppColors.border, offset: Offset(0, 2), blurRadius: 0),
                ],
              ),
              child: isUser
                  ? Text(
                      msg.content,
                      style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textInverse),
                    )
                  : MarkdownBody(
                      data: msg.content,
                      styleSheet: MarkdownStyleSheet.fromTheme(Theme.of(context)).copyWith(
                        p: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                        code: AppTextStyles.badge.copyWith(backgroundColor: AppColors.surfaceSecondary, fontSize: 11),
                      ),
                    ),
            ),
          ),
          if (isUser) const SizedBox(width: 24),
        ],
      ),
    );
  }
}
