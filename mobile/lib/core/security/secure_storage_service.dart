import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const String _keyToken = 'draftforge_token';
  static const String _keyUserId = 'draftforge_user_id';
  static const String _keyUserEmail = 'draftforge_user_email';
  static const String _keyUserRole = 'draftforge_user_role';
  static const String _keyUserName = 'draftforge_user_name';

  // Token Management
  Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  // User Profile Caching
  Future<void> saveUserSession({
    required String token,
    required String userId,
    required String email,
    required String role,
    String? fullName,
  }) async {
    await _storage.write(key: _keyToken, value: token);
    await _storage.write(key: _keyUserId, value: userId);
    await _storage.write(key: _keyUserEmail, value: email);
    await _storage.write(key: _keyUserRole, value: role);
    if (fullName != null) {
      await _storage.write(key: _keyUserName, value: fullName);
    }
  }

  Future<Map<String, String?>> getUserSession() async {
    final token = await _storage.read(key: _keyToken);
    final userId = await _storage.read(key: _keyUserId);
    final email = await _storage.read(key: _keyUserEmail);
    final role = await _storage.read(key: _keyUserRole);
    final name = await _storage.read(key: _keyUserName);

    return {
      'token': token,
      'userId': userId,
      'email': email,
      'role': role,
      'fullName': name,
    };
  }

  Future<void> clearSession() async {
    await _storage.deleteAll();
  }
}
