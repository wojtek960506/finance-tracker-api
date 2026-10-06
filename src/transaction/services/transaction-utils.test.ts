import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { getSystemExpenseAccountResultSerialized } from '@testing/factories/account';
import {
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
  TRANSFER_CATEGORY_ID_STR,
} from '@testing/factories/category';
import { DATE_STR, USER_ID_OBJ, USER_ID_STR } from '@testing/factories/general';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  CASH_PAYMENT_METHOD_ID_OBJ,
  CASH_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
} from '@testing/factories/payment-method';
import {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_INCOME_ID_OBJ,
  ACCOUNT_INCOME_ID_STR,
  CURRENCY_EXPENSE,
  END_DATE_FILTER,
  EXCHANGE_TXN_EXPENSE_SRC_IDX,
  EXCHANGE_TXN_INCOME_SRC_IDX,
  getExchangeTransactionDTO,
  getExchangeTransactionProps,
  getStandardTransactionProps,
  getStandardTransactionResultJSON,
  getTransferTransactionDTO,
  getTransferTransactionProps,
  getTransferTransactionResultJSON,
  MAX_AMOUNT_FILTER,
  MIN_AMOUNT_FILTER,
  STANDARD_TXN_ID_STR,
  START_DATE_FILTER,
  TRANSACTION_TYPE_EXPENSE,
  TRANSFER_TXN_EXPENSE_ID_STR,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
  TRANSFER_TXN_INCOME_ID_STR,
  TRANSFER_TXN_INCOME_SRC_IDX,
} from '@testing/factories/transaction';
import { findTransaction } from '@transaction/db';
import { CounterModel, TransactionModel } from '@transaction/model';
import { TransactionExchangeDTO } from '@transaction/schema';
import { ValidationError } from '@utils/errors';

import { transactionToCsvRow } from './export-transactions/transaction-to-csv-row';
import { prepareTransferProps } from './prepare-transfer-props/prepare-transfer-props';
import { buildTransactionFilterQuery } from './build-transaction-query';
import { checkTransactionDependencies } from './check-transaction-dependencies';
import { getNextSourceIndex } from './get-next-source-index';
import { loadOwnedTransactionCascade } from './load-transaction-cascade';
import {
  prepareExchangeProps,
  prepareExchangeSpecificProps,
} from './prepare-exchange-props';

vi.mock('@transaction/db', () => ({
  findTransaction: vi.fn(),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    countDocuments: vi.fn(),
  },
  CounterModel: {
    findOneAndUpdate: vi.fn(),
  },
}));

describe('transaction-utils services', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('buildTransactionFilterQuery', () => {
    const basicFilters = {
      transactionType: TRANSACTION_TYPE_EXPENSE,
      currency: CURRENCY_EXPENSE,
      categoryIds: [FOOD_CATEGORY_ID_STR],
      paymentMethodIds: [BANK_TRANSFER_PAYMENT_METHOD_ID_STR],
      accountIds: [ACCOUNT_EXPENSE_ID_STR],
    };
    const advancedFilters = {
      startDate: START_DATE_FILTER,
      endDate: END_DATE_FILTER,
      minAmount: MIN_AMOUNT_FILTER,
      maxAmount: MAX_AMOUNT_FILTER,
      excludeCategoryIds: [FOOD_CATEGORY_ID_STR],
    };

    it('build query with basic filters', () => {
      const query = buildTransactionFilterQuery(basicFilters, USER_ID_STR);

      expect(query.transactionType).toBe(TRANSACTION_TYPE_EXPENSE);
      expect(query.currency).toBe(CURRENCY_EXPENSE);
      expect(query.paymentMethodId).toEqual(BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ);
      expect(query.accountId).toEqual(ACCOUNT_EXPENSE_ID_OBJ);
      expect(query.categoryId).toEqual(FOOD_CATEGORY_ID_OBJ);
      expect(query.amount).toBeUndefined();
      expect(query.date).toBeUndefined();
    });

    it('build query with advanced filters', () => {
      const query = buildTransactionFilterQuery(advancedFilters, USER_ID_STR);

      expect(query.transactionType).toBeUndefined();
      expect(query.currency).toBeUndefined();
      expect(query.paymentMethodId).toBeUndefined();
      expect(query.accountId).toBeUndefined();

      expect(query.categoryId).toEqual({ $nin: [FOOD_CATEGORY_ID_OBJ] });

      expect(query.amount).toEqual({
        $gte: MIN_AMOUNT_FILTER,
        $lte: MAX_AMOUNT_FILTER,
      });
      expect(query.date).toEqual({
        $gte: START_DATE_FILTER,
        $lte: END_DATE_FILTER,
      });
    });

    it('build just part of advanced filters - startDate', () => {
      const query = buildTransactionFilterQuery(
        { startDate: START_DATE_FILTER },
        USER_ID_STR,
      );
      expect(query.date).toEqual({ $gte: START_DATE_FILTER });
    });

    it('build just part of advanced filters - endDate', () => {
      const query = buildTransactionFilterQuery(
        { endDate: END_DATE_FILTER },
        USER_ID_STR,
      );
      expect(query.date).toEqual({ $lte: END_DATE_FILTER });
    });

    it('build just part of advanced filters - minAmount', () => {
      const query = buildTransactionFilterQuery(
        { minAmount: MIN_AMOUNT_FILTER },
        USER_ID_STR,
      );
      expect(query.amount).toEqual({ $gte: MIN_AMOUNT_FILTER });
    });

    it('build just part of advanced filters - maxAmount', () => {
      const query = buildTransactionFilterQuery(
        { maxAmount: MAX_AMOUNT_FILTER },
        USER_ID_STR,
      );
      expect(query.amount).toEqual({ $lte: MAX_AMOUNT_FILTER });
    });

    it('build query with multi-value include filters', () => {
      const query = buildTransactionFilterQuery(
        {
          categoryIds: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
          paymentMethodIds: [
            BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
            CASH_PAYMENT_METHOD_ID_STR,
          ],
          accountIds: [ACCOUNT_EXPENSE_ID_STR, ACCOUNT_INCOME_ID_STR],
        },
        USER_ID_STR,
      );

      expect(query.categoryId).toEqual({
        $in: [FOOD_CATEGORY_ID_OBJ, EXCHANGE_CATEGORY_ID_OBJ],
      });
      expect(query.paymentMethodId).toEqual({
        $in: [BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ, CASH_PAYMENT_METHOD_ID_OBJ],
      });
      expect(query.accountId).toEqual({
        $in: [ACCOUNT_EXPENSE_ID_OBJ, ACCOUNT_INCOME_ID_OBJ],
      });
    });

    it('build query with multi-value exclude filters', () => {
      const query = buildTransactionFilterQuery(
        {
          excludeCategoryIds: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
          excludePaymentMethodIds: [
            BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
            CASH_PAYMENT_METHOD_ID_STR,
          ],
          excludeAccountIds: [ACCOUNT_EXPENSE_ID_STR, ACCOUNT_INCOME_ID_STR],
        },
        USER_ID_STR,
      );

      expect(query.categoryId).toEqual({
        $nin: [FOOD_CATEGORY_ID_OBJ, EXCHANGE_CATEGORY_ID_OBJ],
      });
      expect(query.paymentMethodId).toEqual({
        $nin: [BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ, CASH_PAYMENT_METHOD_ID_OBJ],
      });
      expect(query.accountId).toEqual({
        $nin: [ACCOUNT_EXPENSE_ID_OBJ, ACCOUNT_INCOME_ID_OBJ],
      });
    });

    it("throws when 'categoryIds' and 'excludeCategoryIds' are provided together", () => {
      const q = {
        categoryIds: [FOOD_CATEGORY_ID_STR],
        excludeCategoryIds: [FOOD_CATEGORY_ID_STR],
      };
      expect(() => buildTransactionFilterQuery(q, USER_ID_STR)).toThrow(ValidationError);
    });

    it("throws when 'paymentMethodIds' and 'excludePaymentMethodIds' are provided together", () => {
      const q = {
        paymentMethodIds: [BANK_TRANSFER_PAYMENT_METHOD_ID_STR],
        excludePaymentMethodIds: [CASH_PAYMENT_METHOD_ID_STR],
      };
      expect(() => buildTransactionFilterQuery(q, USER_ID_STR)).toThrow(ValidationError);
    });

    it("throws when 'accountIds' and 'excludeAccountIds' are provided together", () => {
      const q = {
        accountIds: [ACCOUNT_EXPENSE_ID_STR],
        excludeAccountIds: [ACCOUNT_INCOME_ID_STR],
      };
      expect(() => buildTransactionFilterQuery(q, USER_ID_STR)).toThrow(ValidationError);
    });

    it("adds trash filter when deletionState is 'trash'", () => {
      const query = buildTransactionFilterQuery({}, USER_ID_STR, 'trash');

      expect(query.deletion).toBeUndefined();
      expect(query['deletion.deletedAt']).toEqual({ $exists: true });
    });

    it("does not add deletion filter when deletionState is 'any'", () => {
      const query = buildTransactionFilterQuery({}, USER_ID_STR, 'any');

      expect(query.deletion).toBeUndefined();
      expect(query['deletion.deletedAt']).toBeUndefined();
    });
  });

  describe('checkTransactionDependencies', () => {
    it('returns undefined when no dependency exists for category', async () => {
      (TransactionModel.countDocuments as any).mockResolvedValue(0);

      const result = await checkTransactionDependencies('categoryId', 'cat-1');

      expect(TransactionModel.countDocuments).toHaveBeenCalledWith({
        categoryId: 'cat-1',
      });
      expect(result).toBeUndefined();
    });

    it('throws CategoryDependencyError when category is used in transactions', async () => {
      (TransactionModel.countDocuments as any).mockResolvedValue(2);

      await expect(checkTransactionDependencies('categoryId', 'cat-1')).rejects.toThrow(
        'Category is being used by some transactions',
      );
    });

    // prettier-ignore
    it(
      'throws PaymentMethodDependencyError when payment method is used in transactions',
      async () => {
        (TransactionModel.countDocuments as any).mockResolvedValue(1);

        await expect(
          checkTransactionDependencies('paymentMethodId', 'pm-1'),
        ).rejects.toThrow('Payment method is being used by some transactions');
      });

    it('throws AccountDependencyError when account is used in transactions', async () => {
      (TransactionModel.countDocuments as any).mockResolvedValue(1);

      await expect(checkTransactionDependencies('accountId', 'acc-1')).rejects.toThrow(
        'Account is being used by some transactions',
      );
    });
  });

  describe('transactionToCsvRow', () => {
    const { ownerId, categoryId, paymentMethodId, accountId, kind, ...transaction } =
      getStandardTransactionProps();
    const categoriesMap = {
      [FOOD_CATEGORY_ID_STR]: { name: FOOD_CATEGORY_NAME },
    };
    const paymentMethodsMap = {
      [BANK_TRANSFER_PAYMENT_METHOD_ID_STR]: {
        name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
      },
    };
    const account = getSystemExpenseAccountResultSerialized();
    const accountsMap = {
      [accountId]: { name: account.name },
    };

    it('transaction to csv row', () => {
      const result = transactionToCsvRow(
        { ...transaction, categoryId, paymentMethodId, accountId } as any,
        categoriesMap as any,
        paymentMethodsMap as any,
        accountsMap as any,
      );

      expect(result).toEqual({
        ...transaction,
        category: FOOD_CATEGORY_NAME,
        paymentMethod: PAYMENT_METHOD_BANK_TRANSFER_NAME,
        account: account.name,
        date: DATE_STR,
        currencies: undefined,
        exchangeRate: undefined,
        sourceRefIndex: undefined,
      });
    });
  });

  describe('getNextSourceIndex', () => {
    it('should return next source index', async () => {
      (CounterModel.findOneAndUpdate as Mock).mockResolvedValue({ seq: 1 });
      const USER_ID = '123';

      const nextSourceIndex = await getNextSourceIndex(USER_ID);

      expect(CounterModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(CounterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: { type: 'transactions', userId: USER_ID } },
        { $inc: { seq: 1 } },
        {
          upsert: true,
          returnDocument: 'after',
        },
      );
      expect(nextSourceIndex).toBe(1);
    });
  });

  describe('loadOwnedTransactionCascade', () => {
    it('returns only main transaction when there is no reference', async () => {
      const transaction = getStandardTransactionResultJSON();
      (findTransaction as Mock).mockResolvedValue(transaction);

      const result = await loadOwnedTransactionCascade(STANDARD_TXN_ID_STR, USER_ID_STR);

      expect(findTransaction).toHaveBeenCalledOnce();
      expect(findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR, {});
      expect(result).toEqual({
        transaction,
        reference: undefined,
        ids: [STANDARD_TXN_ID_STR],
      });
    });

    it('loads referenced transaction as well', async () => {
      const { expenseTransactionJSON, incomeTransactionJSON } =
        getTransferTransactionResultJSON();
      (findTransaction as Mock)
        .mockResolvedValueOnce({
          ...expenseTransactionJSON,
          ownerId: USER_ID_OBJ,
        })
        .mockResolvedValueOnce({
          ...incomeTransactionJSON,
          ownerId: USER_ID_OBJ,
        });

      const result = await loadOwnedTransactionCascade(
        TRANSFER_TXN_EXPENSE_ID_STR,
        USER_ID_STR,
        { deletionState: 'trash' },
      );

      expect(findTransaction).toHaveBeenNthCalledWith(1, TRANSFER_TXN_EXPENSE_ID_STR, {
        deletionState: 'trash',
      });
      expect(findTransaction).toHaveBeenNthCalledWith(2, TRANSFER_TXN_INCOME_ID_STR, {
        deletionState: 'trash',
      });
      expect(result.ids).toEqual([
        TRANSFER_TXN_EXPENSE_ID_STR,
        TRANSFER_TXN_INCOME_ID_STR,
      ]);
      expect(result.reference?._id.toString()).toBe(TRANSFER_TXN_INCOME_ID_STR);
    });
  });

  describe('prepareExchangeProps', () => {
    it('prepare props for create', () => {
      const dto = getExchangeTransactionDTO();
      const mockProps = getExchangeTransactionProps(true);

      const { expenseTransactionProps, incomeTransactionProps } = prepareExchangeProps(
        dto,
        { categoryId: EXCHANGE_CATEGORY_ID_STR },
        {
          ownerId: USER_ID_STR,
          sourceIndexExpense: EXCHANGE_TXN_EXPENSE_SRC_IDX,
          sourceIndexIncome: EXCHANGE_TXN_INCOME_SRC_IDX,
        },
      );

      expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
      expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
    });

    it('prepare props for update', () => {
      const dto = getExchangeTransactionDTO();
      const mockProps = getExchangeTransactionProps();

      const { expenseTransactionProps, incomeTransactionProps } = prepareExchangeProps(
        dto,
        { categoryId: EXCHANGE_CATEGORY_ID_STR },
      );

      expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
      expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
    });
  });

  describe('prepareExchangeSpecificProps', () => {
    it("expense's amount is higher than income's amount", () => {
      const props: Pick<
        TransactionExchangeDTO,
        'amountExpense' | 'amountIncome' | 'currencyExpense' | 'currencyIncome'
      > = {
        amountExpense: 10,
        amountIncome: 42.1,
        currencyExpense: 'EUR',
        currencyIncome: 'PLN',
      };

      const { currencies, exchangeRate } = prepareExchangeSpecificProps(props);

      expect(currencies).toBe('EUR/PLN');
      expect(exchangeRate).toBe(4.21);
    });

    it("expense's amount is smaller than income's amount", () => {
      const props: Pick<
        TransactionExchangeDTO,
        'amountExpense' | 'amountIncome' | 'currencyExpense' | 'currencyIncome'
      > = {
        amountExpense: 42.1,
        amountIncome: 10,
        currencyExpense: 'PLN',
        currencyIncome: 'EUR',
      };

      const { currencies, exchangeRate } = prepareExchangeSpecificProps(props);

      expect(currencies).toBe('EUR/PLN');
      expect(exchangeRate).toBe(4.21);
    });
  });

  describe('prepareTransferProps', () => {
    it('prepare props for create', () => {
      const dto = getTransferTransactionDTO();
      const mockProps = getTransferTransactionProps(true);

      const { expenseTransactionProps, incomeTransactionProps } = prepareTransferProps(
        dto,
        { categoryId: TRANSFER_CATEGORY_ID_STR },
        {
          ownerId: USER_ID_STR,
          sourceIndexExpense: TRANSFER_TXN_EXPENSE_SRC_IDX,
          sourceIndexIncome: TRANSFER_TXN_INCOME_SRC_IDX,
        },
      );

      expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
      expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
    });

    it('prepare props for update', () => {
      const dto = getTransferTransactionDTO();
      const mockProps = getTransferTransactionProps();

      const { expenseTransactionProps, incomeTransactionProps } = prepareTransferProps(
        dto,
        { categoryId: TRANSFER_CATEGORY_ID_STR },
      );

      expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
      expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
    });
  });
});
