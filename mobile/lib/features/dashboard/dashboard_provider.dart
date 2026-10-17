import 'package:flutter/foundation.dart';
import '../../core/models/progress_model.dart';
import '../../core/models/draft_model.dart';
import '../../core/models/assignment_model.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';

class DashboardProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  bool _isLoading = false;
  String? _errorMessage;

  StudentProgressModel? _progress;
  List<DraftModel> _recentDrafts = [];
  List<AssignmentModel> _assignments = [];

  DashboardProvider(this._apiClient);

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  StudentProgressModel? get progress => _progress;
  List<DraftModel> get recentDrafts => _recentDrafts;
  List<AssignmentModel> get assignments => _assignments;

  Future<void> loadDashboardMetrics() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Parallel fetch matching web StudentDashboard
      final results = await Future.wait([
        _apiClient.get(ApiEndpoints.progress).catchError((_) => null),
        _apiClient.get(ApiEndpoints.drafts).catchError((_) => null),
        _apiClient.get(ApiEndpoints.assignments).catchError((_) => null),
      ]);

      if (results[0] != null && results[0] is Map<String, dynamic>) {
        _progress = StudentProgressModel.fromJson(results[0] as Map<String, dynamic>);
      }

      if (results[1] != null && results[1] is List<dynamic>) {
        final allDrafts = (results[1] as List<dynamic>)
            .map((d) => DraftModel.fromJson(d as Map<String, dynamic>))
            .toList();
        _recentDrafts = allDrafts.take(4).toList();
      }

      if (results[2] != null && results[2] is List<dynamic>) {
        _assignments = (results[2] as List<dynamic>)
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
}
