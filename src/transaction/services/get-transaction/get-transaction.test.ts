import { describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import { findTransaction } from '@transaction/db';
import { serializeTransaction } from '@transaction/serializers';
import { getTransaction } from '@transaction/services';

vi.mock('@transaction/db', () => ({ findTransaction: vi.fn() }));
vi.mock('@transaction/serializers', () => ({ serializeTransaction: vi.fn() }));

describe('getTransaction', () => {
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
    expect(findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR);
    expect(serializeTransaction).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transactionSerialized);
  });
});
