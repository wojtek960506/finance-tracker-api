export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(404, message, details);
  }
}

export class UnauthorizedMissingTokenError extends AppError {
  readonly code = "UNAUTHORIZED_MISSING_TOKEN_ERROR";

  constructor() {
    super(401, "Missing token");
  }
}

export class UnauthorizedInvalidTokenError extends AppError {
  readonly code = "UNAUTHORIZED_INVALID_TOKEN_ERROR";

  constructor() {
    super(401, "Invalid or expired token");
  }
}

export class ValidationError extends AppError {
  constructor(details?: unknown) {
    super(422, "Validation error", details);
  }
}
