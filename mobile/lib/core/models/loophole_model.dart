class LoopholeFindingModel {
  final String findingId;
  final String title;
  final String severity;
  final String gapType;
  final String? relatedClauseName;
  final String? riskName;
  final String educationalObservation;
  final String referenceRecommendation;

  LoopholeFindingModel({
    required this.findingId,
    required this.title,
    required this.severity,
    required this.gapType,
    this.relatedClauseName,
    this.riskName,
    required this.educationalObservation,
    required this.referenceRecommendation,
  });

  bool get isCritical => severity.toUpperCase() == 'CRITICAL';
  bool get isHigh => severity.toUpperCase() == 'HIGH';
  bool get isMedium => severity.toUpperCase() == 'MEDIUM';

  factory LoopholeFindingModel.fromJson(Map<String, dynamic> json) {
    return LoopholeFindingModel(
      findingId: json['finding_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Potential Risk',
      severity: json['severity']?.toString() ?? 'MEDIUM',
      gapType: json['gap_type']?.toString() ?? 'CLAUSE_DEFICIENCY',
      relatedClauseName: json['related_clause_name']?.toString(),
      riskName: json['risk_name']?.toString(),
      educationalObservation: json['educational_observation']?.toString() ?? '',
      referenceRecommendation: json['reference_recommendation']?.toString() ?? '',
    );
  }
}

class LoopholeReportModel {
  final String evaluationId;
  final String documentType;
  final int totalLoopholes;
  final int highSeverityCount;
  final List<LoopholeFindingModel> loopholes;

  LoopholeReportModel({
    required this.evaluationId,
    required this.documentType,
    required this.totalLoopholes,
    required this.highSeverityCount,
    this.loopholes = const [],
  });

  factory LoopholeReportModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['loopholes'] as List<dynamic>? ?? [];
    return LoopholeReportModel(
      evaluationId: json['evaluation_id']?.toString() ?? '',
      documentType: json['document_type']?.toString() ?? 'CONTRACT',
      totalLoopholes: (json['total_loopholes'] as num?)?.toInt() ?? 0,
      highSeverityCount: (json['high_severity_count'] as num?)?.toInt() ?? 0,
      loopholes: rawItems.map((item) => LoopholeFindingModel.fromJson(item as Map<String, dynamic>)).toList(),
    );
  }
}
