import { describe, expect, it } from 'vitest';

import {
  CannotEditLinkedTransactionOperationError,
  InvestmentInstrumentAlreadyExistsError,
  InvestmentInstrumentDependencyError,
  InvestmentInstrumentNotFoundError,
  InvestmentOperationNotFoundError,
  OperationKindNotAllowedForInstrumentError,
  SnapshotNotAllowedForInstrumentError,
  SnapshotOperationOnlyError,
} from './investment-errors';

describe('investment errors', () => {
  it('InvestmentInstrumentNotFoundError sets defaults', () => {
    const err = new InvestmentInstrumentNotFoundError('inst-1');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('INVESTMENT_INSTRUMENT_NOT_FOUND_ERROR');
    expect(err.message).toBe("Investment instrument with id 'inst-1' not found");
    expect(err.instrumentId).toBe('inst-1');
  });

  it('InvestmentInstrumentAlreadyExistsError sets defaults', () => {
    const err = new InvestmentInstrumentAlreadyExistsError('VWCE ETF');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('INVESTMENT_INSTRUMENT_ALREADY_EXISTS_ERROR');
    expect(err.message).toBe("Investment instrument with name 'VWCE ETF' already exists");
    expect(err.instrumentName).toBe('VWCE ETF');
  });

  it('InvestmentInstrumentDependencyError sets defaults', () => {
    const err = new InvestmentInstrumentDependencyError('inst-1');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('INVESTMENT_INSTRUMENT_DEPENDENCY_ERROR');
    expect(err.message).toBe('Investment instrument is being used by some operations');
    expect(err.instrumentId).toBe('inst-1');
  });

  it('InvestmentOperationNotFoundError sets defaults', () => {
    const err = new InvestmentOperationNotFoundError('op-1');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('INVESTMENT_OPERATION_NOT_FOUND_ERROR');
    expect(err.message).toBe("Investment operation with id 'op-1' not found");
    expect(err.operationId).toBe('op-1');
  });

  it('SnapshotOperationOnlyError sets defaults for create and delete', () => {
    const errCreate = new SnapshotOperationOnlyError('create');
    expect(errCreate.statusCode).toBe(400);
    expect(errCreate.code).toBe('SNAPSHOT_OPERATION_ONLY_ERROR');
    expect(errCreate.message).toBe(
      'Only snapshot operations can be created via this endpoint',
    );
    expect(errCreate.action).toBe('create');

    const errUpdate = new SnapshotOperationOnlyError('update');
    expect(errUpdate.statusCode).toBe(400);
    expect(errUpdate.code).toBe('SNAPSHOT_OPERATION_ONLY_ERROR');
    expect(errUpdate.message).toBe(
      'Only snapshot operations can be updated via this endpoint',
    );
    expect(errUpdate.action).toBe('update');
  });

  it('CannotEditLinkedTransactionOperationError sets defaults', () => {
    const err = new CannotEditLinkedTransactionOperationError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('CANNOT_EDIT_LINKED_TRANSACTION_OPERATION');
    expect(err.message).toBe(
      'Cannot edit linked transaction operation directly. Please edit the root transaction.',
    );
  });

  it('SnapshotNotAllowedForInstrumentError sets defaults', () => {
    const err = new SnapshotNotAllowedForInstrumentError('termDeposit');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('SNAPSHOT_NOT_ALLOWED_FOR_INSTRUMENT');
    expect(err.message).toBe("Snapshots are not allowed for 'termDeposit' instruments");
    expect(err.instrumentKind).toBe('termDeposit');
  });

  it('OperationKindNotAllowedForInstrumentError sets defaults', () => {
    const err = new OperationKindNotAllowedForInstrumentError('interest', 'share');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('OPERATION_KIND_NOT_ALLOWED_FOR_INSTRUMENT');
    expect(err.message).toBe(
      "Operation of kind 'interest' is not allowed for 'share' instruments",
    );
    expect(err.operationKind).toBe('interest');
    expect(err.instrumentKind).toBe('share');
  });
});
