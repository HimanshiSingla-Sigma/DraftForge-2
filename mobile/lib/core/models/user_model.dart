class UserModel {
  final String id;
  final String email;
  final String role;
  final String? fullName;

  UserModel({
    required this.id,
    required this.email,
    required this.role,
    this.fullName,
  });

  bool get isStudent => role.toUpperCase() == 'STUDENT';
  bool get isTeacher => role.toUpperCase() == 'TEACHER';
  bool get isAdmin => role.toUpperCase() == 'ADMIN';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? json['user_id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString().toUpperCase() ?? 'STUDENT',
      fullName: json['full_name']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'role': role,
      'full_name': fullName,
    };
  }
}
