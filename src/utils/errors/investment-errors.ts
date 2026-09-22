import { AppError } from './general-errors';

export class InvestmentInstrumentNotFoundError extends AppError {
  readonly code = 'INVESTMENT_INSTRUMENT_NOT_FOUND_ERROR';

  constructor(readonly instrumentId: string) {
    super(404, `Investment instrument with id '${instrumentId}' not found`);
  }
}

export class InvestmentInstrumentAlreadyExistsError extends AppError {
  readonly code = 'INVESTMENT_INSTRUMENT_ALREADY_EXISTS_ERROR';

  constructor(readonly instrumentName: string) {
    super(409, `Investment instrument with name '${instrumentName}' already exists`);
  }
}

export class InvestmentInstrumentDependencyError extends AppError {
  readonly code = 'INVESTMENT_INSTRUMENT_DEPENDENCY_ERROR';

  constructor(readonly instrumentId: string) {
    super(403, 'Investment instrument is being used by some operations');
  }
}

export class InvestmentOperationNotFoundError extends AppError {
  readonly code = 'INVESTMENT_OPERATION_NOT_FOUND_ERROR';

  constructor(readonly operationId: string) {
    super(404, `Investment operation with id '${operationId}' not found`);
  }
}

export class SnapshotOperationOnlyError extends AppError {
  readonly code = 'SNAPSHOT_OPERATION_ONLY_ERROR';

  constructor(readonly action: 'create' | 'delete' | 'update') {
    super(400, `Only snapshot operations can be ${action}d via this endpoint`);
  }
}

export class CannotEditLinkedTransactionOperationError extends AppError {
  readonly code = 'CANNOT_EDIT_LINKED_TRANSACTION_OPERATION';

  constructor() {
    super(
      400,
      'Cannot edit linked transaction operation directly. Please edit the root transaction.',
    );
  }
}

export class SnapshotNotAllowedForInstrumentError extends AppError {
  readonly code = 'SNAPSHOT_NOT_ALLOWED_FOR_INSTRUMENT';

  constructor(readonly instrumentKind: string) {
    super(400, `Snapshots are not allowed for '${instrumentKind}' instruments`);
  }
}

export class OperationKindNotAllowedForInstrumentError extends AppError {
  readonly code = 'OPERATION_KIND_NOT_ALLOWED_FOR_INSTRUMENT';

  constructor(
    readonly operationKind: string,
    readonly instrumentKind: string,
  ) {
    super(
      400,
      `Operation of kind '${operationKind}' is not allowed for '${instrumentKind}' instruments`,
    );
  }
}
