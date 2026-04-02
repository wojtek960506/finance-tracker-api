export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    code = 'APP_ERROR',
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND_ERROR';

  constructor(message: string, details?: unknown) {
    super(404, message, details);
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';

  constructor(details?: unknown) {
    super(422, 'Validation error', details);
  }
}
