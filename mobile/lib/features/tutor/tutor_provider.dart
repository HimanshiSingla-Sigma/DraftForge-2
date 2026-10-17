import 'package:flutter/foundation.dart';
import '../../core/models/tutor_message_model.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';

class TutorProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  String? _conversationId;
  List<TutorMessageModel> _messages = [];
  bool _isLoading = false;
  bool _isSending = false;
  String? _errorMessage;

  TutorProvider(this._apiClient);

  String? get conversationId => _conversationId;
  List<TutorMessageModel> get messages => _messages;
  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  String? get errorMessage => _errorMessage;

  Future<void> initializeConversation() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Fetch conversations or create default
      final convsData = await _apiClient.get(ApiEndpoints.conversations);
      if (convsData is List<dynamic> && convsData.isNotEmpty) {
        _conversationId = (convsData.first as Map<String, dynamic>)['id']?.toString();
      } else {
        final newConv = await _apiClient.post(
          ApiEndpoints.conversations,
          data: {'title': 'Mobile Socratic Legal Guidance'},
        );
        _conversationId = (newConv as Map<String, dynamic>)['id']?.toString();
      }

      if (_conversationId != null) {
        await _fetchMessages(_conversationId!);
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _fetchMessages(String convId) async {
    try {
      final messagesData = await _apiClient.get(ApiEndpoints.conversationMessages(convId));
      if (messagesData is List<dynamic>) {
        _messages = messagesData
            .map((m) => TutorMessageModel.fromJson(m as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {
      // ignore
    }
  }

  Future<bool> sendMessage(String text) async {
    if (_conversationId == null || text.trim().isEmpty) return false;

    final userMessage = TutorMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      conversationId: _conversationId!,
      role: 'user',
      content: text.trim(),
      createdAt: DateTime.now().toIso8601String(),
    );

    _messages.add(userMessage);
    _isSending = true;
    notifyListeners();

    try {
      final responseData = await _apiClient.post(
        ApiEndpoints.sendChatMessage,
        data: {
          'conversation_id': _conversationId,
          'message': text.trim(),
        },
      );

      // Endpoint returns ChatTurnResponse: { user_message: ..., ai_message: ... }
      if (responseData is Map<String, dynamic>) {
        final aiMessageData = responseData['ai_message'] as Map<String, dynamic>?;
        if (aiMessageData != null) {
          final aiMessage = TutorMessageModel.fromJson(aiMessageData);
          _messages.add(aiMessage);
        }
      }

      _isSending = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isSending = false;
      notifyListeners();
      return false;
    }
  }
}
