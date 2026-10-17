import 'user_model.dart';

class AuthResponseModel {
  final String accessToken;
  final String tokenType;
  final UserModel user;

  AuthResponseModel({
    required this.accessToken,
    this.tokenType = 'bearer',
    required this.user,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      accessToken: json['access_token']?.toString() ?? '',
      tokenType: json['token_type']?.toString() ?? 'bearer',
      user: UserModel.fromJson(json),
    );
  }
}

class InvitationVerificationModel {
  final bool valid;
  final String email;
  final String role;
  final String? assignedName;
  final String? expiresAt;
  final String? message;

  InvitationVerificationModel({
    required this.valid,
    required this.email,
    required this.role,
    this.assignedName,
    this.expiresAt,
    this.message,
  });

  factory InvitationVerificationModel.fromJson(Map<String, dynamic> json) {
    return InvitationVerificationModel(
      valid: json['valid'] == true,
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString().toUpperCase() ?? 'STUDENT',
      assignedName: json['assigned_name']?.toString(),
      expiresAt: json['expires_at']?.toString(),
      message: json['message']?.toString(),
    );
  }
}
