import { AppError } from "@utils/errors/general-errors";


export class TransactionNotFoundError extends AppError {
  readonly code = 'TRANSACTION_NOT_FOUND';

  constructor(readonly transactionId: string) {
    super(404, "Transaction not found");
  }
}

export class TransactionTransferCategoryError extends AppError {
  readonly code = 'TRANSACTION_TRANSFER_CATEGORY_ERROR'

  constructor(readonly transactionId: string) {
    super(400, "Transfer transaction should have 'myAccount' category");
  }
}

export class TransactionExchangeCategoryError extends AppError {
  readonly code = 'TRANSACTION_EXCHAGE_CATEGORY_ERROR'

  constructor(readonly transactionId: string) {
    super(400, "Exchange transaction should have 'exchange' category");
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