export class HttpError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(status: number, message: string, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(msg = 'Bad Request', code?: string, details?: any) {
    return new HttpError(400, msg, code, details);
  }
  
  static unauthorized(msg = 'Unauthorized', code?: string) {
    return new HttpError(401, msg, code);
  }
  
  static forbidden(msg = 'Forbidden', code?: string) {
    return new HttpError(403, msg, code);
  }
  
  static notFound(msg = 'Not Found', code?: string) {
    return new HttpError(404, msg, code);
  }
  
  static conflict(msg = 'Conflict', code?: string) {
    return new HttpError(409, msg, code);
  }

  static tooManyRequests(msg = 'Too Many Requests', code?: string) {
    return new HttpError(429, msg, code);
  }

  static internalServerError(msg = 'Internal Server Error', code?: string) {
    return new HttpError(500, msg, code);
  }

  static serviceUnavailable(msg = 'Service Unavailable', code?: string) {
    return new HttpError(503, msg, code);
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: this.details,
      status: this.status,
    };
  }
}