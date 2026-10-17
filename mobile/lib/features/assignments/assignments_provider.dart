import 'package:flutter/foundation.dart';
import '../../core/models/assignment_model.dart';
import '../../core/models/submission_model.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';

class AssignmentsProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  List<AssignmentModel> _assignments = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  AssignmentsProvider(this._apiClient);

  List<AssignmentModel> get assignments => _assignments;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  Future<void> fetchAssignments() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.get(ApiEndpoints.assignments);
      if (responseData is List<dynamic>) {
        _assignments = responseData
            .map((a) => AssignmentModel.fromJson(a as Map<String, dynamic>))
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

  Future<SubmissionModel?> submitAssignment({
    required String assignmentId,
    required String draftId,
    required String draftVersionId,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.post(
        ApiEndpoints.submissions,
        data: {
          'assignment_id': assignmentId,
          'draft_id': draftId,
          'draft_version_id': draftVersionId,
        },
      );

      final submission = SubmissionModel.fromJson(responseData as Map<String, dynamic>);
      _isSubmitting = false;
      notifyListeners();
      return submission;
    } catch (e) {
      _errorMessage = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return null;
    }
  }
}
