import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
  getTransferTransactionResultJSON,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import { findTransaction, findTransactionNullable } from '@transaction/db';
import { serializeTransaction } from '@transaction/serializers';
import { getTransaction } from '@transaction/services';

import { loadOwnedTransactionDetails } from './get-transaction';

vi.mock('@transaction/db', () => ({
  findTransaction: vi.fn(),
  findTransactionNullable: vi.fn(),
}));
vi.mock('@transaction/serializers', () => ({ serializeTransaction: vi.fn() }));

describe('getTransaction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('get transaction', async () => {
    const populateMock = vi.fn();
    const transaction = {
      ...getStandardTransactionResultJSON(),
      populate: populateMock,
    };
    const transactionSerialized = getStandardTransactionResultSerialized();

    (findTransaction as Mock).mockResolvedValue(transaction);
    (serializeTransaction as Mock).mockReturnValue(transactionSerialized);

    const result = await getTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

    expect(findTransaction).toHaveBeenCalledOnce();
    expect(findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR, {});
    expect(serializeTransaction).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transactionSerialized);
  });

  it('returns transaction with reference details when reference exists', async () => {
    const populateMock = vi.fn();
    const populateReferenceMock = vi.fn();
    const { expenseTransactionJSON, incomeTransactionJSON } =
      getTransferTransactionResultJSON();
    const { expenseTransactionSerialized, incomeTransactionSerialized } =
      getTransferTransactionResultSerialized();
    const transaction = {
      ...expenseTransactionJSON,
      populate: populateMock,
    };
    const reference = {
      ...incomeTransactionJSON,
      populate: populateReferenceMock,
    };

    (findTransaction as Mock).mockResolvedValue(transaction);
    (findTransactionNullable as Mock).mockResolvedValue(reference);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(expenseTransactionSerialized)
      .mockReturnValueOnce(incomeTransactionSerialized);

    const result = await getTransaction(transaction._id.toString(), USER_ID_STR);

    expect(findTransactionNullable).toHaveBeenCalledWith(reference._id.toString(), {});
    expect(serializeTransaction).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      ...expenseTransactionSerialized,
      reference: incomeTransactionSerialized,
    });
  });

  // prettier-ignore
  it(
    'loadOwnedTransactionDetails returns undefined reference when nullable lookup misses',
      async () => {
      const populateMock = vi.fn();
      const { expenseTransactionJSON, incomeTransactionJSON } =
        getTransferTransactionResultJSON();
      const transaction = {
        ...expenseTransactionJSON,
        refId: incomeTransactionJSON._id,
        populate: populateMock,
      };

      (findTransaction as Mock).mockResolvedValue(transaction);
      (findTransactionNullable as Mock).mockResolvedValue(undefined);

      const result = await loadOwnedTransactionDetails(
        transaction._id.toString(),
        USER_ID_STR,
      );

      expect(findTransactionNullable).toHaveBeenCalledWith(
        incomeTransactionJSON._id.toString(),
        {},
      );
      expect(result).toEqual({
        transaction,
        reference: undefined,
      });
    }
  );
});
