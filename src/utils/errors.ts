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

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, "Unauthorized");
  }
}

export class ValidationError extends AppError {
  constructor(details?: unknown) {
    super(422, "Validation error", details);
  }
}

export class TransactionNotFoundError extends Error {
  readonly code = 'TRANSACTION_NOT_FOUND'

  constructor(readonly transactionId: string) {
    super("Transaction not found");
  }
}

export class TransactionOwnershipError extends Error {
  readonly code = 'TRANSACTION_OWNERSHIP_VIOLATION'

  constructor(
    readonly wrongUserId: string,
    readonly transactionId: string,
    readonly transactionOwnerId: string,
  ) {
    super('Transaction does not belong to the current user')
  }
}