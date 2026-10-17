class TutorMessageModel {
  final String id;
  final String conversationId;
  final String role; // 'user' or 'assistant'
  final String content;
  final String? createdAt;
  final List<Map<String, dynamic>> retrievedSources;

  TutorMessageModel({
    required this.id,
    required this.conversationId,
    required this.role,
    required this.content,
    this.createdAt,
    this.retrievedSources = const [],
  });

  bool get isUser => role.toLowerCase() == 'user';
  bool get isAssistant => role.toLowerCase() == 'assistant' || role.toLowerCase() == 'ai';

  factory TutorMessageModel.fromJson(Map<String, dynamic> json) {
    final rawSources = json['retrieved_sources'] as List<dynamic>? ?? [];
    return TutorMessageModel(
      id: json['id']?.toString() ?? '',
      conversationId: json['conversation_id']?.toString() ?? '',
      role: json['role']?.toString().toLowerCase() ?? 'user',
      content: json['content']?.toString() ?? '',
      createdAt: json['created_at']?.toString(),
      retrievedSources: rawSources.map((s) => s is Map<String, dynamic> ? s : <String, dynamic>{}).toList(),
    );
  }
}
