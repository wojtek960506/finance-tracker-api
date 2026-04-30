import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  getStandardTransactionResultJSON,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import { TransactionModel } from '@transaction/model';
import { TransactionNotFoundError } from '@utils/errors';

import { findTransaction, findTransactionNullable } from './find-transaction';

vi.mock('@transaction/model', () => ({ TransactionModel: { findOne: vi.fn() } }));

describe('findTransaction', () => {
  const transaction = getStandardTransactionResultJSON();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('transaction exists', async () => {
    (TransactionModel.findOne as Mock).mockResolvedValue(transaction);

    const result = await findTransaction(STANDARD_TXN_ID_STR);

    expect(TransactionModel.findOne).toHaveBeenCalledOnce();
    expect(TransactionModel.findOne).toHaveBeenCalledWith({
      _id: STANDARD_TXN_ID_STR,
      deletion: null,
    });
    expect(result).toEqual(transaction);
  });

  it('transaction does not exist', async () => {
    (TransactionModel.findOne as Mock).mockResolvedValue(undefined);

    await expect(findTransaction(STANDARD_TXN_ID_STR)).rejects.toThrow(
      TransactionNotFoundError,
    );

    expect(TransactionModel.findOne).toHaveBeenCalledOnce();
    expect(TransactionModel.findOne).toHaveBeenCalledWith({
      _id: STANDARD_TXN_ID_STR,
      deletion: null,
    });
  });

  it("finds trashed transaction when deletionState is 'trash'", async () => {
    (TransactionModel.findOne as Mock).mockResolvedValue(transaction);

    const result = await findTransactionNullable(STANDARD_TXN_ID_STR, {
      deletionState: 'trash',
    });

    expect(TransactionModel.findOne).toHaveBeenCalledOnce();
    expect(TransactionModel.findOne).toHaveBeenCalledWith({
      _id: STANDARD_TXN_ID_STR,
      'deletion.deletedAt': { $exists: true },
    });
    expect(result).toEqual(transaction);
  });

  it("finds transaction without deletion filter when deletionState is 'any'", async () => {
    (TransactionModel.findOne as Mock).mockResolvedValue(transaction);

    const result = await findTransactionNullable(STANDARD_TXN_ID_STR, {
      deletionState: 'any',
    });

    expect(TransactionModel.findOne).toHaveBeenCalledOnce();
    expect(TransactionModel.findOne).toHaveBeenCalledWith({
      _id: STANDARD_TXN_ID_STR,
    });
    expect(result).toEqual(transaction);
  });
});
