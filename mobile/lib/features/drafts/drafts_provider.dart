import 'dart:io';
import 'package:flutter/foundation.dart';
import '../../core/models/draft_model.dart';
import '../../core/models/evaluation_model.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';

class DraftsProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  List<DraftModel> _drafts = [];
  DraftModel? _selectedDraft;
  EvaluationModel? _latestEvaluation;

  bool _isLoading = false;
  bool _isEvaluating = false;
  String? _errorMessage;

  DraftsProvider(this._apiClient);

  List<DraftModel> get drafts => _drafts;
  DraftModel? get selectedDraft => _selectedDraft;
  EvaluationModel? get latestEvaluation => _latestEvaluation;
  bool get isLoading => _isLoading;
  bool get isEvaluating => _isEvaluating;
  String? get errorMessage => _errorMessage;

  Future<void> fetchDrafts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.get(ApiEndpoints.drafts);
      if (responseData is List<dynamic>) {
        _drafts = responseData
            .map((d) => DraftModel.fromJson(d as Map<String, dynamic>))
            .toList();
      }
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<DraftModel?> fetchDraftDetail(String draftId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.get(ApiEndpoints.draftDetail(draftId));
      _selectedDraft = DraftModel.fromJson(responseData as Map<String, dynamic>);
      _isLoading = false;
      notifyListeners();
      return _selectedDraft;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<DraftModel?> createRawDraft({
    required String title,
    required String documentType,
    required String rawContent,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.post(
        ApiEndpoints.drafts,
        data: {
          'title': title.trim(),
          'document_type': documentType,
          'raw_content': rawContent.trim(),
        },
      );

      final newDraft = DraftModel.fromJson(responseData as Map<String, dynamic>);
      _drafts.insert(0, newDraft);
      _selectedDraft = newDraft;
      _isLoading = false;
      notifyListeners();
      return newDraft;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<DraftModel?> uploadDraftFile({
    required File file,
    String? title,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.postMultipart(
        ApiEndpoints.uploadDraft,
        file: file,
        fileField: 'file',
        additionalFields: {
          if (title != null && title.isNotEmpty) 'title': title.trim(),
        },
      );

      final newDraft = DraftModel.fromJson(responseData as Map<String, dynamic>);
      _drafts.insert(0, newDraft);
      _selectedDraft = newDraft;
      _isLoading = false;
      notifyListeners();
      return newDraft;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> addDraftVersion({
    required String draftId,
    required String content,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Endpoint expects content as form parameter or URL-encoded
      await _apiClient.post(
        ApiEndpoints.addDraftVersion(draftId),
        queryParameters: {'content': content},
      );
      // Refresh draft details
      await fetchDraftDetail(draftId);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<EvaluationModel?> triggerEvaluation(String draftId, [int? versionNumber]) async {
    _isEvaluating = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.post(
        ApiEndpoints.evaluations,
        data: {
          'draft_id': draftId,
          if (versionNumber != null) 'version_number': versionNumber,
        },
      );

      _latestEvaluation = EvaluationModel.fromJson(responseData as Map<String, dynamic>);
      _isEvaluating = false;
      notifyListeners();
      return _latestEvaluation;
    } catch (e) {
      _errorMessage = e.toString();
      _isEvaluating = false;
      notifyListeners();
      return null;
    }
  }
}
