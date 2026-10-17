class AssignmentModel {
  final String id;
  final String teacherId;
  final String title;
  final String? description;
  final String documentType;
  final String instructions;
  final String? deadline;
  final String status;
  final int submissionsCount;

  AssignmentModel({
    required this.id,
    required this.teacherId,
    required this.title,
    this.description,
    required this.documentType,
    required this.instructions,
    this.deadline,
    required this.status,
    this.submissionsCount = 0,
  });

  bool get isActive => status.toUpperCase() == 'ACTIVE';

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    return AssignmentModel(
      id: json['id']?.toString() ?? '',
      teacherId: json['teacher_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Coursework Assignment',
      description: json['description']?.toString(),
      documentType: json['document_type']?.toString() ?? 'CONTRACT',
      instructions: json['instructions']?.toString() ?? '',
      deadline: json['deadline']?.toString(),
      status: json['status']?.toString() ?? 'ACTIVE',
      submissionsCount: (json['submissions_count'] as num?)?.toInt() ?? 0,
    );
  }
}
