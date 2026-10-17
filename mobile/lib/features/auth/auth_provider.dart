import 'package:flutter/foundation.dart';
import '../../core/models/user_model.dart';
import '../../core/models/auth_response_model.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';
import '../../core/security/secure_storage_service.dart';

enum AuthStatus {
  uninitialized,
  authenticated,
  unauthenticated,
}

class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient;
  final SecureStorageService _storage = SecureStorageService();

  AuthStatus _status = AuthStatus.uninitialized;
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._apiClient) {
    _apiClient.onSessionExpired = _handleSessionExpired;
    initializeSession();
  }

  AuthStatus get status => _status;
  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _status == AuthStatus.authenticated && _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> initializeSession() async {
    _status = AuthStatus.uninitialized;
    notifyListeners();

    try {
      final session = await _storage.getUserSession();
      final token = session['token'];
      if (token != null && token.isNotEmpty) {
        // Validate token with live /auth/me endpoint
        try {
          final meData = await _apiClient.get(ApiEndpoints.me);
          _currentUser = UserModel.fromJson(meData as Map<String, dynamic>);
          _status = AuthStatus.authenticated;
          notifyListeners();
          return;
        } catch (_) {
          // Token is invalid or expired
          await _storage.clearSession();
        }
      }
      _status = AuthStatus.unauthenticated;
    } catch (_) {
      _status = AuthStatus.unauthenticated;
    } finally {
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.post(
        ApiEndpoints.login,
        data: {
          'email': email.trim().toLowerCase(),
          'password': password,
        },
      );

      final authResponse = AuthResponseModel.fromJson(responseData as Map<String, dynamic>);
      _currentUser = authResponse.user;

      await _storage.saveUserSession(
        token: authResponse.accessToken,
        userId: authResponse.user.id,
        email: authResponse.user.email,
        role: authResponse.user.role,
        fullName: authResponse.user.fullName,
      );

      _status = AuthStatus.authenticated;
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

  Future<InvitationVerificationModel?> verifyInvitationToken(String token) async {
    try {
      final responseData = await _apiClient.get(
        ApiEndpoints.verifyInvitation,
        queryParameters: {'token': token.trim()},
      );
      return InvitationVerificationModel.fromJson(responseData as Map<String, dynamic>);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> acceptInvitation({
    required String token,
    required String password,
    String? fullName,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responseData = await _apiClient.post(
        ApiEndpoints.acceptInvitation,
        data: {
          'token': token.trim(),
          'password': password,
          if (fullName != null && fullName.isNotEmpty) 'full_name': fullName.trim(),
        },
      );

      final authResponse = AuthResponseModel.fromJson(responseData as Map<String, dynamic>);
      _currentUser = authResponse.user;

      await _storage.saveUserSession(
        token: authResponse.accessToken,
        userId: authResponse.user.id,
        email: authResponse.user.email,
        role: authResponse.user.role,
        fullName: authResponse.user.fullName,
      );

      _status = AuthStatus.authenticated;
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

  Future<void> logout() async {
    await _storage.clearSession();
    _currentUser = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void _handleSessionExpired() {
    _currentUser = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
