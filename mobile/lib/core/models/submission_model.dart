import 'evaluation_model.dart';

class SubmissionModel {
  final String id;
  final String assignmentId;
  final String studentId;
  final String draftId;
  final String draftVersionId;
  final String? evaluationId;
  final String status;
  final double? finalScore;
  final String? teacherNotes;
  final String? submittedAt;
  final String? studentName;
  final String? studentEmail;
  final EvaluationModel? evaluation;

  SubmissionModel({
    required this.id,
    required this.assignmentId,
    required this.studentId,
    required this.draftId,
    required this.draftVersionId,
    this.evaluationId,
    required this.status,
    this.finalScore,
    this.teacherNotes,
    this.submittedAt,
    this.studentName,
    this.studentEmail,
    this.evaluation,
  });

  bool get isGraded => status.toUpperCase() == 'GRADED' || finalScore != null;

  factory SubmissionModel.fromJson(Map<String, dynamic> json) {
    return SubmissionModel(
      id: json['id']?.toString() ?? '',
      assignmentId: json['assignment_id']?.toString() ?? '',
      studentId: json['student_id']?.toString() ?? '',
      draftId: json['draft_id']?.toString() ?? '',
      draftVersionId: json['draft_version_id']?.toString() ?? '',
      evaluationId: json['evaluation_id']?.toString(),
      status: json['status']?.toString() ?? 'SUBMITTED',
      finalScore: (json['final_score'] as num?)?.toDouble(),
      teacherNotes: json['teacher_notes']?.toString(),
      submittedAt: json['submitted_at']?.toString(),
      studentName: json['student_name']?.toString(),
      studentEmail: json['student_email']?.toString(),
      evaluation: json['evaluation'] != null && json['evaluation'] is Map<String, dynamic>
          ? EvaluationModel.fromJson(json['evaluation'] as Map<String, dynamic>)
          : null,
    );
  }
}
