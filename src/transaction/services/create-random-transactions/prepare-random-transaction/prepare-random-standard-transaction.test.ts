import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { TRANSACTION_TYPES } from '@utils/consts';
import { randomFromSet, randomNumber, weightedRandomFromSet } from '@utils/random';

import {
  TEST_CATEGORY_ID,
  TEST_DATE,
  TEST_OWNER_ID,
  TEST_SOURCE_INDEX,
} from '../test-fixtures';

import { prepareRandomStandardTransaction } from './prepare-random-standard-transaction';

vi.mock('@utils/random', () => ({
  randomFromSet: vi.fn(),
  randomNumber: vi.fn(),
  weightedRandomFromSet: vi.fn(),
}));

describe('prepareRandomStandardTransaction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('builds a standard random transaction with expected fields', () => {
    (randomNumber as Mock).mockReturnValue(123);
    (randomFromSet as Mock).mockReturnValueOnce('PLN').mockReturnValueOnce('wallet');
    (weightedRandomFromSet as Mock).mockReturnValue('expense');

    // TODO - create some constant for these values (probably similar as TEST_CATEGORY)
    const result = prepareRandomStandardTransaction(
      TEST_OWNER_ID,
      TEST_DATE,
      TEST_SOURCE_INDEX,
      TEST_CATEGORY_ID,
      'pm-1',
    );

    expect(randomNumber).toHaveBeenCalledOnce();
    expect(randomNumber).toHaveBeenCalledWith(10, 10000);
    expect(randomFromSet).toHaveBeenCalledTimes(2);
    expect(weightedRandomFromSet).toHaveBeenCalledOnce();
    expect(weightedRandomFromSet).toHaveBeenCalledWith(TRANSACTION_TYPES, {
      expense: 5,
      income: 1,
    });
    expect(result).toEqual({
      date: TEST_DATE,
      amount: 123,
      account: 'wallet',
      ownerId: TEST_OWNER_ID,
      currency: 'PLN',
      categoryId: TEST_CATEGORY_ID,
      paymentMethodId: 'pm-1',
      sourceIndex: TEST_SOURCE_INDEX,
      transactionType: 'expense',
      description: 'expense - 123 PLN - 2020-01-01',
    });
  });
});
