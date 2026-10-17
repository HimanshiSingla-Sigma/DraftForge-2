import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/models/evaluation_model.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/tactile_button.dart';
import '../../shared/widgets/tactile_card.dart';
import '../loopholes/loophole_viewer_screen.dart';

class EvaluationDetailScreen extends StatelessWidget {
  final String evaluationId;
  final EvaluationModel evaluation;

  const EvaluationDetailScreen({
    super.key,
    required this.evaluationId,
    required this.evaluation,
  });

  Color _getScoreColor(double score) {
    if (score >= 80) return AppColors.success;
    if (score >= 60) return AppColors.accent;
    return AppColors.error;
  }

  @override
  Widget build(BuildContext context) {
    final score = evaluation.displayScore;
    final scoreColor = _getScoreColor(score);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Statutory Evaluation Report', style: AppTextStyles.titleLarge),
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
        ),
        child: SafeArea(
          child: TactileButton(
            text: 'Inspect Graph Loopholes & Remedies',
            icon: LucideIcons.network,
            backgroundColor: AppColors.primary,
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => LoopholeViewerScreen(evaluationId: evaluation.id),
                ),
              );
            },
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Score Overview Banner Card
              TactileCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: scoreColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                        border: Border.all(color: scoreColor, width: 3),
                      ),
                      child: Center(
                        child: Text(
                          score.toStringAsFixed(0),
                          style: AppTextStyles.h1.copyWith(
                            fontSize: 34,
                            color: scoreColor,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      score >= 80
                          ? 'Substantial Statutory Compliance'
                          : score >= 60
                              ? 'Moderate Compliance — Revision Recommended'
                              : 'Substandard — Critical Deficiencies Detected',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Rubric Model v${evaluation.rubricVersion}',
                      style: AppTextStyles.bodySmall,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Rubric Dimensional Breakdown Card
              TactileCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Dimensional Rubric Performance', style: AppTextStyles.titleMedium),
                    const SizedBox(height: 16),
                    _buildDimensionRow('Structural Completeness', evaluation.structureScore, 30),
                    const SizedBox(height: 12),
                    _buildDimensionRow('Statutory Clause Precision', evaluation.clauseScore, 40),
                    const SizedBox(height: 12),
                    _buildDimensionRow('Legal Formatting & Rigor', evaluation.formattingScore, 30),
                    if (evaluation.gapPenalty > 0) ...[
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(LucideIcons.alertTriangle, size: 14, color: AppColors.error),
                              const SizedBox(width: 6),
                              Text('Gap Risk Penalty', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error)),
                            ],
                          ),
                          Text(
                            '-${evaluation.gapPenalty.toStringAsFixed(1)} pts',
                            style: AppTextStyles.titleMedium.copyWith(color: AppColors.error, fontSize: 13),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              if (evaluation.llmExplanation != null && evaluation.llmExplanation!.isNotEmpty) ...[
                const SizedBox(height: 16),
                TactileCard(
                  backgroundColor: AppColors.surfaceSecondary,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.sparkles, size: 18, color: AppColors.accent),
                          const SizedBox(width: 8),
                          Text('AI Evaluator Synthesis', style: AppTextStyles.titleMedium),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        evaluation.llmExplanation!,
                        style: AppTextStyles.bodyMedium.copyWith(height: 1.5),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),

              // Evidence Items & Findings
              Text('Traceable Evidence & Clause Findings', style: AppTextStyles.titleLarge),
              const SizedBox(height: 12),

              if (evaluation.evidenceItems.isEmpty)
                TactileCard(
                  padding: const EdgeInsets.all(20),
                  child: Center(
                    child: Text('No itemized findings reported.', style: AppTextStyles.bodySmall),
                  ),
                )
              else
                ...evaluation.evidenceItems.map((finding) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: TactileCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  finding.criterion,
                                  style: AppTextStyles.titleMedium,
                                ),
                              ),
                              StatusBadge.fromStatus(finding.status),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            finding.explanation,
                            style: AppTextStyles.bodyMedium,
                          ),
                          if (finding.studentEvidence != null && finding.studentEvidence!.isNotEmpty) ...[
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceSecondary,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Student Draft Evidence:', style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 2),
                                  Text(
                                    '"${finding.studentEvidence!.trim()}"',
                                    style: AppTextStyles.bodySmall.copyWith(fontStyle: FontStyle.italic),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          if (finding.sourceDocument != null) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(LucideIcons.bookMarked, size: 12, color: AppColors.textMuted),
                                const SizedBox(width: 4),
                                Text(
                                  'Reference: ${finding.sourceDocument}',
                                  style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                }),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDimensionRow(String label, double score, double maxScore) {
    final pct = (score / maxScore).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTextStyles.bodyMedium),
            Text(
              '${score.toStringAsFixed(1)} / ${maxScore.toStringAsFixed(0)}',
              style: AppTextStyles.titleMedium.copyWith(fontSize: 12),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: pct,
            minHeight: 6,
            backgroundColor: AppColors.border,
            valueColor: AlwaysStoppedAnimation<Color>(
              pct >= 0.8 ? AppColors.success : pct >= 0.6 ? AppColors.accent : AppColors.error,
            ),
          ),
        ),
      ],
    );
  }
}
