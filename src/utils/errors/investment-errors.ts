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

  constructor(readonly action: 'create' | 'delete') {
    super(400, `Only snapshot operations can be ${action}d via this endpoint`);
  }
}
