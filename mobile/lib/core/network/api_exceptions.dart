class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => message;
}

class UnauthorizedException extends ApiException {
  UnauthorizedException({String message = 'Session expired. Please log in again.'})
      : super(message: message, statusCode: 401);
}

class ForbiddenException extends ApiException {
  ForbiddenException({String message = 'Access denied. You do not have permission.'})
      : super(message: message, statusCode: 403);
}

class NetworkException extends ApiException {
  NetworkException({String message = 'Unable to connect to DraftForge server. Please check your internet connection.'})
      : super(message: message);
}
