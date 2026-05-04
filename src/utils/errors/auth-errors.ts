import { AppError } from './general-errors';

export class UnauthorizedMissingTokenError extends AppError {
  readonly code = 'UNAUTHORIZED_MISSING_TOKEN_ERROR';

  constructor() {
    super(401, 'Missing token');
  }
}

export class UnauthorizedInvalidTokenError extends AppError {
  readonly code = 'UNAUTHORIZED_INVALID_TOKEN_ERROR';

  constructor() {
    super(401, 'Invalid or expired token');
  }
}

export class UnauthorizedInvalidCredentialsError extends AppError {
  readonly code = 'UNAUTHORIZED_INVALID_CREDENTIALS_ERROR';

  constructor() {
    super(401, 'Invalid credentials');
  }
}

export class UnauthorizedEmailNotVerifiedError extends AppError {
  readonly code = 'AUTH_EMAIL_NOT_VERIFIED';

  constructor() {
    super(403, 'Email verification required');
  }
}

export class UnauthorizedUserNotFoundError extends AppError {
  readonly code = 'UNAUTHORIZED_USER_NOT_FOUND_ERROR';

  constructor(email: string) {
    super(401, `User with email '${email}' not found`);
  }
}

export class UnauthorizedMissingRefreshTokenError extends AppError {
  readonly code = 'UNAUTHORIZED_MISSING_REFRESH_TOKEN_ERROR';

  constructor() {
    super(401, 'Missing refresh token');
  }
}

export class UnauthorizedInvalidRefreshTokenError extends AppError {
  readonly code = 'UNAUTHORIZED_INVALID_REFRESH_TOKEN_ERROR';

  constructor() {
    super(401, 'Invalid refresh token');
  }
}

export class InvalidEmailVerificationTokenError extends AppError {
  readonly code = 'AUTH_INVALID_EMAIL_VERIFICATION_TOKEN';

  constructor() {
    super(400, 'Invalid email verification token');
  }
}

export class ExpiredEmailVerificationTokenError extends AppError {
  readonly code = 'AUTH_EXPIRED_EMAIL_VERIFICATION_TOKEN';

  constructor() {
    super(400, 'Email verification token expired');
  }
}
