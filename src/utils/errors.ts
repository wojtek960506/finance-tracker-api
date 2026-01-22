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

export class TransactionNotFoundError extends AppError {
  readonly code = 'TRANSACTION_NOT_FOUND';

  constructor(readonly transactionId: string) {
    super(404, "Transaction not found");
  }
}

export class TransactionExchangeCategoryError extends AppError {
  readonly code = 'TRANSACTION_EXCHAGE_CATEGORY_ERROR'

  constructor(readonly transactionId: string) {
    super(400, "Transaction should have 'exchange' category");
  }
}

export class TransactionMissingReferenceError extends AppError {
  readonly code = 'TRANSACTION_MISSING_REFERENCE_ERROR'

  constructor(readonly transactionId: string) {
    super(400, "Transaction is missing reference");
  }
}

export class TransactionWrongReferenceError extends AppError {
  readonly code = 'TRANSACTION_WRONG_REFERENCE_ERROR'

  constructor(readonly transactionId: string, readonly transactionRefId: string) {
    super(400, "Wrong reference in transaction");
  }
}

export class TransactionWrongTypesError extends AppError {
  readonly code = 'TRANSACTION_WRONG_TYPES_ERROR'

  constructor(readonly transactionId: string, readonly transactionRefId: string) {
    super(
      400,
      "Wrong transaction types in a referenced pair of transactions. " +
      "They should not be the same"
    )
  }
}

export class TransactionOwnershipError extends AppError {
  readonly code = 'TRANSACTION_OWNERSHIP_VIOLATION'

  constructor(
    readonly wrongUserId: string,
    readonly transactionId: string,
    readonly transactionOwnerId: string,
  ) {
    super(403, 'Transaction does not belong to the current user')
  }
}