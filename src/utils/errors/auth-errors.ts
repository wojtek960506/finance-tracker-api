import { AppError } from "./general-errors";


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

export class UnauthorizedInvalidCredentialsError extends AppError {
  readonly code = "UNAUTHORIZED_INVALID_CREDENTIALS_ERROR";

  constructor() {
    super(401, "Invalid credentials");
  }
}

export class UnauthorizedUserNotFoundError extends AppError {
  readonly code = "UNAUTHORIZED_USER_NOT_FOUND_ERROR";

  constructor(email: string) {
    super(401, `User with email '${email}' not found`);
  }
};
