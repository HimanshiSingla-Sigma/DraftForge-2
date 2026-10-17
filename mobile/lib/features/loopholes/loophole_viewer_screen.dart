import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/models/loophole_model.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';
import '../../shared/widgets/empty_state_view.dart';
import '../../shared/widgets/error_state_view.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/tactile_card.dart';

class LoopholeViewerScreen extends StatefulWidget {
  final String evaluationId;

  const LoopholeViewerScreen({super.key, required this.evaluationId});

  @override
  State<LoopholeViewerScreen> createState() => _LoopholeViewerScreenState();
}

class _LoopholeViewerScreenState extends State<LoopholeViewerScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  LoopholeReportModel? _report;

  @override
  void initState() {
    super.initState();
    _fetchLoopholes();
  }

  Future<void> _fetchLoopholes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final client = context.read<ApiClient>();
      final responseData = await client.get(ApiEndpoints.loopholes(widget.evaluationId));
      if (mounted) {
        setState(() {
          _report = LoopholeReportModel.fromJson(responseData as Map<String, dynamic>);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('GraphRAG Loophole Inspector', style: AppTextStyles.titleLarge),
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
            if (_isLoading) {
              return const LoadingIndicator(message: 'Traversing Neo4j legal ontology for structural gaps...');
            }

            if (_errorMessage != null) {
              return ErrorStateView(
                message: _errorMessage!,
                onRetry: _fetchLoopholes,
              );
            }

            if (_report == null || _report!.loopholes.isEmpty) {
              return EmptyStateView(
                icon: LucideIcons.shieldCheck,
                title: 'No Loopholes Detected',
                description: 'The graph reasoning engine verified that prerequisite clauses and dispute covenants are structurally sound.',
              );
            }

            final report = _report!;

            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _fetchLoopholes,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Summary Banner Card
                    TactileCard(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.errorLight,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.errorBorder),
                            ),
                            child: const Icon(LucideIcons.alertOctagon, color: AppColors.error, size: 28),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${report.totalLoopholes} Vulnerabilities Found',
                                  style: AppTextStyles.titleLarge.copyWith(fontSize: 16),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${report.highSeverityCount} high-risk statutory omissions detected',
                                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),
                    Text('Detected Structural Deficiencies', style: AppTextStyles.titleLarge),
                    const SizedBox(height: 12),

                    ...report.loopholes.map((item) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: TactileCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(item.title, style: AppTextStyles.titleMedium),
                                  ),
                                  StatusBadge.fromStatus(item.severity),
                                ],
                              ),
                              const SizedBox(height: 6),
                              if (item.riskName != null) ...[
                                Row(
                                  children: [
                                    const Icon(LucideIcons.zap, size: 12, color: AppColors.warning),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Risk: ${item.riskName}',
                                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.warning, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                              ],
                              Text(item.educationalObservation, style: AppTextStyles.bodyMedium),
                              const SizedBox(height: 12),

                              // Recommendation Box
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.successLight,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.successBorder),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(LucideIcons.checkSquare, size: 14, color: AppColors.success),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Recommended Remedial Provision:',
                                          style: AppTextStyles.titleMedium.copyWith(color: AppColors.success, fontSize: 11),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.referenceRecommendation,
                                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.textPrimary),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
