import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { randomFromSet, randomNumber } from '@utils/random';

import {
  TEST_CATEGORY_ID,
  TEST_DATE,
  TEST_OWNER_ID,
  TEST_SOURCE_INDEX,
} from '../test-fixtures';

import { prepareRandomTransferTransactionPair } from './prepare-random-transfer-transaction-pair';

vi.mock('@utils/random', () => ({
  randomFromSet: vi.fn(),
  randomNumber: vi.fn(),
}));

describe('prepareRandomTransferTransactionPair', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('builds an expense and income transfer pair with linked source refs', () => {
    (randomNumber as Mock).mockReturnValue(250);
    (randomFromSet as Mock).mockReturnValueOnce('EUR');

    // TODO - create some constant for these values (probably similar as TEST_CATEGORY_ID)
    const [expense, income] = prepareRandomTransferTransactionPair(
      TEST_OWNER_ID,
      TEST_DATE,
      TEST_SOURCE_INDEX,
      TEST_CATEGORY_ID,
      'pm-1',
      'acc-1',
      'acc-2',
    );

    expect(randomNumber).toHaveBeenCalledOnce();
    expect(randomNumber).toHaveBeenCalledWith(10, 10000);
    expect(randomFromSet).toHaveBeenCalledTimes(1);
    expect(expense).toEqual({
      date: TEST_DATE,
      amount: 250,
      ownerId: TEST_OWNER_ID,
      currency: 'EUR',
      categoryId: TEST_CATEGORY_ID,
      paymentMethodId: 'pm-1',
      accountId: 'acc-1',
      sourceIndex: TEST_SOURCE_INDEX,
      sourceRefIndex: TEST_SOURCE_INDEX + 1,
      transactionType: 'expense',
      description: 'Money Transfer: acc-1 --> acc-2',
    });
    expect(income).toEqual({
      date: TEST_DATE,
      amount: 250,
      ownerId: TEST_OWNER_ID,
      currency: 'EUR',
      categoryId: TEST_CATEGORY_ID,
      paymentMethodId: 'pm-1',
      accountId: 'acc-2',
      sourceRefIndex: TEST_SOURCE_INDEX,
      sourceIndex: TEST_SOURCE_INDEX + 1,
      transactionType: 'income',
      description: 'Money Transfer: acc-1 --> acc-2',
    });
  });
});
