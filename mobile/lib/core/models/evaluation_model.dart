class EvaluationFindingModel {
  final String? id;
  final String category;
  final String criterion;
  final String status;
  final double score;
  final double maxScore;
  final String? studentEvidence;
  final String? referenceEvidence;
  final String? sourceDocument;
  final String explanation;

  EvaluationFindingModel({
    this.id,
    required this.category,
    required this.criterion,
    required this.status,
    required this.score,
    required this.maxScore,
    this.studentEvidence,
    this.referenceEvidence,
    this.sourceDocument,
    required this.explanation,
  });

  bool get isPassed => status.toUpperCase() == 'PASS' || status.toUpperCase() == 'SATISFIED';
  bool get isPartial => status.toUpperCase() == 'PARTIAL' || status.toUpperCase() == 'FLAGGED';
  bool get isFailed => status.toUpperCase() == 'FAIL' || status.toUpperCase() == 'MISSING';

  factory EvaluationFindingModel.fromJson(Map<String, dynamic> json) {
    return EvaluationFindingModel(
      id: json['id']?.toString(),
      category: json['category']?.toString() ?? 'GENERAL',
      criterion: json['criterion']?.toString() ?? '',
      status: json['status']?.toString() ?? 'FLAGGED',
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      maxScore: (json['max_score'] as num?)?.toDouble() ?? 10.0,
      studentEvidence: json['student_evidence']?.toString(),
      referenceEvidence: json['reference_evidence']?.toString(),
      sourceDocument: json['source_document']?.toString(),
      explanation: json['explanation']?.toString() ?? '',
    );
  }
}

class EvaluationModel {
  final String id;
  final String draftVersionId;
  final double overallScore;
  final double maxScore;
  final double structureScore;
  final double clauseScore;
  final double formattingScore;
  final double gapPenalty;
  final String rubricVersion;
  final String? llmExplanation;
  final bool isOverridden;
  final double? overriddenScore;
  final String? createdAt;
  final List<EvaluationFindingModel> evidenceItems;

  EvaluationModel({
    required this.id,
    required this.draftVersionId,
    required this.overallScore,
    this.maxScore = 100.0,
    required this.structureScore,
    required this.clauseScore,
    required this.formattingScore,
    this.gapPenalty = 0.0,
    required this.rubricVersion,
    this.llmExplanation,
    this.isOverridden = false,
    this.overriddenScore,
    this.createdAt,
    this.evidenceItems = const [],
  });

  double get displayScore => isOverridden && overriddenScore != null ? overriddenScore! : overallScore;

  factory EvaluationModel.fromJson(Map<String, dynamic> json) {
    final rawFindings = json['evidence_items'] as List<dynamic>? ?? [];
    return EvaluationModel(
      id: json['id']?.toString() ?? '',
      draftVersionId: json['draft_version_id']?.toString() ?? '',
      overallScore: (json['overall_score'] as num?)?.toDouble() ?? 0.0,
      maxScore: (json['max_score'] as num?)?.toDouble() ?? 100.0,
      structureScore: (json['structure_score'] as num?)?.toDouble() ?? 0.0,
      clauseScore: (json['clause_score'] as num?)?.toDouble() ?? 0.0,
      formattingScore: (json['formatting_score'] as num?)?.toDouble() ?? 0.0,
      gapPenalty: (json['gap_penalty'] as num?)?.toDouble() ?? 0.0,
      rubricVersion: json['rubric_version']?.toString() ?? '1.0',
      llmExplanation: json['llm_explanation']?.toString(),
      isOverridden: json['is_overridden'] == true,
      overriddenScore: (json['overridden_score'] as num?)?.toDouble(),
      createdAt: json['created_at']?.toString(),
      evidenceItems: rawFindings.map((f) => EvaluationFindingModel.fromJson(f as Map<String, dynamic>)).toList(),
    );
  }
}
