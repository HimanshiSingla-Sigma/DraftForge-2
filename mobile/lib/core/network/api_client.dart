import 'dart:io';
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../security/secure_storage_service.dart';
import 'api_exceptions.dart';

class ApiClient {
  late final Dio _dio;
  final SecureStorageService _storage = SecureStorageService();

  // Callback hook for 401 unauthenticated session expiry
  void Function()? onSessionExpired;

  ApiClient({void Function()? onSessionExpired}) {
    this.onSessionExpired = onSessionExpired;
    _dio = Dio(
      BaseOptions(
        baseURL: AppConfig.baseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            await _storage.clearSession();
            onSessionExpired?.call();
          }
          return handler.next(error);
        },
      ),
    );
  }

  // Generic Request Handlers with typed Exception Mapping
  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<dynamic> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.post(path, data: data, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<dynamic> postMultipart(
    String path, {
    required File file,
    required String fileField,
    Map<String, dynamic>? additionalFields,
  }) async {
    try {
      final fileName = file.path.split(Platform.pathSeparator).last;
      final formData = FormData.fromMap({
        fileField: await MultipartFile.fromFile(file.path, filename: fileName),
        if (additionalFields != null) ...additionalFields,
      });

      final response = await _dio.post(
        path,
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<dynamic> patch(String path, {dynamic data}) async {
    try {
      final response = await _dio.patch(path, data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  ApiException _handleDioError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return NetworkException();
    }

    final statusCode = error.response?.statusCode;
    final responseData = error.response?.data;

    String message = 'An unexpected error occurred.';
    if (responseData is Map<String, dynamic>) {
      message = responseData['detail']?.toString() ??
          responseData['message']?.toString() ??
          message;
    } else if (responseData is String && responseData.isNotEmpty) {
      message = responseData;
    }

    if (statusCode == 401) {
      return UnauthorizedException(message: message);
    } else if (statusCode == 403) {
      return ForbiddenException(message: message);
    }

    return ApiException(message: message, statusCode: statusCode, details: responseData);
  }
}
