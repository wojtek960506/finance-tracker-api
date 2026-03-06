import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import { serializeTransaction } from '@transaction/serializers';

import { persistTransaction } from './persist-transaction';

import {
  getStandardTransactionProps,
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
} from '@/testing/factories/transaction';

vi.mock('@transaction/model', () => ({
  TransactionModel: { create: vi.fn() },
}));

vi.mock('@transaction/serializers', () => ({
  serializeTransaction: vi.fn(),
}));

describe('persistTransaction', async () => {
  const populateMock = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  const props = getStandardTransactionProps();
  const transactionJSON = getStandardTransactionResultJSON();
  const transactionSerialized = getStandardTransactionResultSerialized();

  it('transaction is persisted', async () => {
    const iTransaction = { ...transactionJSON, populate: populateMock };
    (TransactionModel.create as Mock).mockResolvedValue(iTransaction);
    (serializeTransaction as Mock).mockReturnValueOnce(transactionSerialized);

    const result = await persistTransaction(props);

    expect(TransactionModel.create).toHaveBeenCalledOnce();
    expect(TransactionModel.create).toHaveBeenCalledWith(props);
    expect(serializeTransaction).toHaveBeenCalledWith(iTransaction);
    expect(result).toEqual(transactionSerialized);
  });
});
