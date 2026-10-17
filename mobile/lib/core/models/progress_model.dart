class StudentProgressModel {
  final String userId;
  final int totalEvaluations;
  final double averageScore;
  final List<double> scoreHistory;
  final Map<String, double> documentTypeAverages;
  final int masteredSkillsCount;
  final int weakSkillsCount;

  StudentProgressModel({
    required this.userId,
    required this.totalEvaluations,
    required this.averageScore,
    this.scoreHistory = const [],
    this.documentTypeAverages = const {},
    this.masteredSkillsCount = 0,
    this.weakSkillsCount = 0,
  });

  factory StudentProgressModel.fromJson(Map<String, dynamic> json) {
    final rawScores = json['score_history'] as List<dynamic>? ?? [];
    final rawDocAvg = json['document_type_averages'] as Map<String, dynamic>? ?? {};

    return StudentProgressModel(
      userId: json['user_id']?.toString() ?? '',
      totalEvaluations: (json['total_evaluations'] as num?)?.toInt() ?? 0,
      averageScore: (json['average_score'] as num?)?.toDouble() ?? 0.0,
      scoreHistory: rawScores.map((s) => (s as num).toDouble()).toList(),
      documentTypeAverages: rawDocAvg.map((k, v) => MapEntry(k, (v as num).toDouble())),
      masteredSkillsCount: (json['mastered_skills_count'] as num?)?.toInt() ?? 0,
      weakSkillsCount: (json['weak_skills_count'] as num?)?.toInt() ?? 0,
    );
  }
}
