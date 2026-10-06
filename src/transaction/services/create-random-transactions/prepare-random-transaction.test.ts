import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { TRANSACTION_TYPES } from '@utils/consts';
import { randomFromSet, randomNumber, weightedRandomFromSet } from '@utils/random';

import {
  prepareRandomExchangeTransactionPair,
  prepareRandomStandardTransaction,
  prepareRandomTransferTransactionPair,
} from './prepare-random-transaction';
import {
  TEST_CATEGORY_ID,
  TEST_DATE,
  TEST_OWNER_ID,
  TEST_SOURCE_INDEX,
} from './test-fixtures';

vi.mock('@utils/random', () => ({
  randomFromSet: vi.fn(),
  randomNumber: vi.fn(),
  weightedRandomFromSet: vi.fn(),
}));

describe('prepare-random-transaction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('prepareRandomStandardTransaction', () => {
    it('builds a standard random transaction with expected fields', () => {
      (randomNumber as Mock).mockReturnValue(123);
      (randomFromSet as Mock).mockReturnValueOnce('PLN');
      (weightedRandomFromSet as Mock).mockReturnValue('expense');

      const result = prepareRandomStandardTransaction(
        TEST_OWNER_ID,
        TEST_DATE,
        TEST_SOURCE_INDEX,
        TEST_CATEGORY_ID,
        'pm-1',
        'acc-1',
      );

      expect(randomNumber).toHaveBeenCalledOnce();
      expect(randomNumber).toHaveBeenCalledWith(10, 10000);
      expect(randomFromSet).toHaveBeenCalledTimes(1);
      expect(weightedRandomFromSet).toHaveBeenCalledOnce();
      expect(weightedRandomFromSet).toHaveBeenCalledWith(TRANSACTION_TYPES, {
        expense: 5,
        income: 1,
      });
      expect(result).toEqual({
        kind: 'standard',
        date: TEST_DATE,
        amount: 123,
        accountId: 'acc-1',
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

  describe('prepareRandomTransferTransactionPair', () => {
    it('builds an expense and income transfer pair with linked source refs', () => {
      (randomNumber as Mock).mockReturnValue(250);
      (randomFromSet as Mock).mockReturnValueOnce('EUR');

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
        kind: 'transfer',
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
        kind: 'transfer',
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

  describe('prepareRandomExchangeTransactionPair', () => {
    it('builds an exchange pair when expense amount is greater than income amount', () => {
      (randomNumber as Mock).mockReturnValueOnce(100).mockReturnValueOnce(20);
      (randomFromSet as Mock).mockReturnValueOnce('PLN').mockReturnValueOnce('USD');

      const [expense, income] = prepareRandomExchangeTransactionPair(
        TEST_OWNER_ID,
        TEST_DATE,
        TEST_SOURCE_INDEX,
        TEST_CATEGORY_ID,
        'pm-1',
        'acc-1',
      );

      expect(randomNumber).toHaveBeenCalledTimes(2);
      expect(randomNumber).toHaveBeenNthCalledWith(1, 10, 10000);
      expect(randomNumber).toHaveBeenNthCalledWith(2, 10, 10000);
      expect(randomFromSet).toHaveBeenCalledTimes(2);
      expect(expense).toEqual({
        kind: 'exchange',
        date: TEST_DATE,
        amount: 100,
        accountId: 'acc-1',
        ownerId: TEST_OWNER_ID,
        currency: 'PLN',
        categoryId: TEST_CATEGORY_ID,
        paymentMethodId: 'pm-1',
        sourceIndex: TEST_SOURCE_INDEX,
        sourceRefIndex: TEST_SOURCE_INDEX + 1,
        transactionType: 'expense',
        exchangeRate: 5,
        currencies: 'USD/PLN',
        description: 'PLN -> USD',
      });
      expect(income).toEqual({
        kind: 'exchange',
        date: TEST_DATE,
        amount: 20,
        accountId: 'acc-1',
        ownerId: TEST_OWNER_ID,
        currency: 'USD',
        categoryId: TEST_CATEGORY_ID,
        paymentMethodId: 'pm-1',
        sourceRefIndex: TEST_SOURCE_INDEX,
        sourceIndex: TEST_SOURCE_INDEX + 1,
        transactionType: 'income',
        exchangeRate: 5,
        currencies: 'USD/PLN',
        description: 'PLN -> USD',
      });
    });

    it('builds an exchange pair when expense amount is lower than income amount', () => {
      (randomNumber as Mock).mockReturnValueOnce(20).mockReturnValueOnce(100);
      (randomFromSet as Mock)
        .mockReturnValueOnce('EUR')
        .mockReturnValueOnce('GBP')
        .mockReturnValueOnce('acc-2');

      const [expense, income] = prepareRandomExchangeTransactionPair(
        TEST_OWNER_ID,
        TEST_DATE,
        TEST_SOURCE_INDEX,
        TEST_CATEGORY_ID,
        'pm-2',
        'acc-2',
      );

      expect(expense.exchangeRate).toBe(0.2);
      expect(income.exchangeRate).toBe(0.2);
      expect(expense.currencies).toBe('GBP/EUR');
      expect(income.currencies).toBe('GBP/EUR');
      expect(expense.description).toBe('EUR -> GBP');
      expect(income.description).toBe('EUR -> GBP');
    });
  });
});
