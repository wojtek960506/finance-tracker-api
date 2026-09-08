import { describe, expect, it } from 'vitest';

import {
  InvestmentInstrumentAlreadyExistsError,
  InvestmentInstrumentDependencyError,
  InvestmentInstrumentNotFoundError,
  InvestmentOperationNotFoundError,
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

    const errDelete = new SnapshotOperationOnlyError('delete');
    expect(errDelete.statusCode).toBe(400);
    expect(errDelete.code).toBe('SNAPSHOT_OPERATION_ONLY_ERROR');
    expect(errDelete.message).toBe(
      'Only snapshot operations can be deleted via this endpoint',
    );
    expect(errDelete.action).toBe('delete');
  });
});
