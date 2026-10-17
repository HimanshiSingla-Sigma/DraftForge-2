class DraftVersionModel {
  final String id;
  final String draftId;
  final int versionNumber;
  final String rawContent;
  final String? storagePath;
  final String? createdAt;

  DraftVersionModel({
    required this.id,
    required this.draftId,
    required this.versionNumber,
    required this.rawContent,
    this.storagePath,
    this.createdAt,
  });

  factory DraftVersionModel.fromJson(Map<String, dynamic> json) {
    return DraftVersionModel(
      id: json['id']?.toString() ?? '',
      draftId: json['draft_id']?.toString() ?? '',
      versionNumber: (json['version_number'] as num?)?.toInt() ?? 1,
      rawContent: json['raw_content']?.toString() ?? '',
      storagePath: json['storage_path']?.toString(),
      createdAt: json['created_at']?.toString(),
    );
  }
}

class DraftModel {
  final String id;
  final String userId;
  final String title;
  final String documentType;
  final String status;
  final String? createdAt;
  final String? updatedAt;
  final List<DraftVersionModel> versions;

  DraftModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.documentType,
    required this.status,
    this.createdAt,
    this.updatedAt,
    this.versions = const [],
  });

  int get latestVersionNumber =>
      versions.isEmpty ? 1 : versions.map((v) => v.versionNumber).reduce((a, b) => a > b ? a : b);

  DraftVersionModel? get latestVersion =>
      versions.isEmpty ? null : versions.firstWhere((v) => v.versionNumber == latestVersionNumber, orElse: () => versions.last);

  factory DraftModel.fromJson(Map<String, dynamic> json) {
    final rawVersions = json['versions'] as List<dynamic>? ?? [];
    return DraftModel(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Untitled Legal Draft',
      documentType: json['document_type']?.toString() ?? 'CONTRACT',
      status: json['status']?.toString() ?? 'DRAFT',
      createdAt: json['created_at']?.toString(),
      updatedAt: json['updated_at']?.toString(),
      versions: rawVersions.map((v) => DraftVersionModel.fromJson(v as Map<String, dynamic>)).toList(),
    );
  }
}
