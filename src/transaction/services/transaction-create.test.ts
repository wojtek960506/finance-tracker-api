import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as namedResourceDb from '@named-resource/db';
import * as namedResourceConfig from '@named-resource/kind-config';
import {
  ACCOUNT_TYPE_USER,
  getOtherAccountResultSerialized,
  getSystemExpenseAccountResultSerialized,
  getSystemIncomeAccountResultSerialized,
} from '@testing/factories/account';
import {
  CATEGORY_TYPE_SYSTEM,
  CATEGORY_TYPE_USER,
  EXCHANGE_CATEGORY_NAME,
  FOOD_CATEGORY_ID_STR,
  getExchangeCategoryResultJSON,
  getExchangeCategoryResultSerialized,
  getOtherCategoryResultSerialized,
  getTransferCategoryResultJSON,
  getTransferCategoryResultSerialized,
  getUserCategoryResultSerialized,
  TRANSFER_CATEGORY_NAME,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import {
  getBankTransferPaymentMethodResultSerialized,
  getOtherPaymentMethodResultSerialized,
} from '@testing/factories/payment-method';
import {
  EXCHANGE_TXN_EXPENSE_SRC_IDX,
  EXCHANGE_TXN_INCOME_SRC_IDX,
  getExchangeTransactionDTO,
  getExchangeTransactionProps,
  getExchangeTransactionResultSerialized,
  getStandardTransactionDTO,
  getStandardTransactionProps,
  getStandardTransactionResultSerialized,
  getTransferTransactionDTO,
  getTransferTransactionProps,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_SRC_IDX,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
  TRANSFER_TXN_INCOME_SRC_IDX,
} from '@testing/factories/transaction';
import * as dbTransactions from '@transaction/db';
import { TransactionModel } from '@transaction/model';
import { TransactionInvestmentDTO } from '@transaction/schema';
import { createRandomTransactions } from '@transaction/services';
import {
  getNextSourceIndex,
  getNextSourceIndices,
} from '@transaction/services/get-next-source-index';
import {
  AccountOwnershipError,
  AppError,
  CategoryNotFoundError,
  InvestmentInstrumentNotFoundError,
  PaymentMethodOwnershipError,
  SystemCategoryHasOwner,
  SystemCategoryNotAllowed,
  SystemCategoryWrongType,
} from '@utils/errors';

import { createTestTransactions } from './create-test-transactions/create-test-transactions';
import { createInvestmentTransaction } from './create-transaction/create-investment-transaction';
import {
  createExchangeTransaction,
  createStandardTransaction,
  createTransferTransaction,
} from './create-transaction/create-transaction';
import { createTransactions } from './create-transactions/create-transactions';

const sessionMock = {} as any;

vi.mock('@utils/with-session', () => ({
  withSession: vi.fn(async (fn: any, ...args: any[]) => fn(sessionMock, ...args)),
}));

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
  InvestmentOperationModel: {
    create: vi.fn(),
  },
}));

vi.mock('@transaction/services/get-next-source-index', () => ({
  getNextSourceIndex: vi.fn(),
  getNextSourceIndices: vi.fn(),
}));

vi.mock('@transaction/services/create-random-transactions', () => ({
  createRandomTransactions: vi.fn(),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    countDocuments: vi.fn(),
  },
}));

describe('transaction-create services', () => {
  const foodCategory = getUserCategoryResultSerialized();
  const exchangeCategory = getExchangeCategoryResultJSON();
  const transferCategory = getTransferCategoryResultJSON();
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();
  const paymentMethod = getBankTransferPaymentMethodResultSerialized();
  const accountExpense = getSystemExpenseAccountResultSerialized();
  const accountIncome = getSystemIncomeAccountResultSerialized();
  const otherCategory = getOtherCategoryResultSerialized();
  const otherPaymentMethod = getOtherPaymentMethodResultSerialized();
  const otherAccount = getOtherAccountResultSerialized();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createStandardTransaction', () => {
    it('creates standard transaction', async () => {
      const transaction = getStandardTransactionResultSerialized();

      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any);
      vi.spyOn(dbTransactions, 'persistTransaction').mockResolvedValue(
        transaction as any,
      );
      (getNextSourceIndex as Mock).mockResolvedValue(STANDARD_TXN_SRC_IDX);

      const result = await createStandardTransaction(standardDTO, USER_ID_STR);

      expect(namedResourceDb.findNamedResourceById).toHaveBeenNthCalledWith(
        1,
        'category',
        FOOD_CATEGORY_ID_STR,
      );
      expect(namedResourceDb.findNamedResourceById).toHaveBeenNthCalledWith(
        2,
        'paymentMethod',
        standardDTO.paymentMethodId,
      );
      expect(namedResourceDb.findNamedResourceById).toHaveBeenNthCalledWith(
        3,
        'account',
        standardDTO.accountId,
      );
      expect(dbTransactions.persistTransaction).toHaveBeenCalledWith({
        ...standardDTO,
        kind: 'standard',
        ownerId: USER_ID_STR,
        sourceIndex: STANDARD_TXN_SRC_IDX,
      });
      expect(result).toEqual(transaction);
    });

    it('maps omitted standard resource ids to Other system resources', async () => {
      const transaction = getStandardTransactionResultSerialized();
      const dto = {
        ...standardDTO,
        categoryId: undefined,
        paymentMethodId: null,
        accountId: undefined,
      };

      vi.spyOn(namedResourceDb, 'findNamedResourceByName')
        .mockResolvedValueOnce(otherCategory as any)
        .mockResolvedValueOnce(otherPaymentMethod as any)
        .mockResolvedValueOnce(otherAccount as any);
      vi.spyOn(dbTransactions, 'persistTransaction').mockResolvedValue(
        transaction as any,
      );
      (getNextSourceIndex as Mock).mockResolvedValue(STANDARD_TXN_SRC_IDX);

      await createStandardTransaction(dto, USER_ID_STR);

      expect(namedResourceDb.findNamedResourceByName).toHaveBeenNthCalledWith(
        1,
        'category',
        'otherCategory',
      );
      expect(namedResourceDb.findNamedResourceByName).toHaveBeenNthCalledWith(
        2,
        'paymentMethod',
        'otherPaymentMethod',
      );
      expect(namedResourceDb.findNamedResourceByName).toHaveBeenNthCalledWith(
        3,
        'account',
        'otherAccount',
      );
      expect(dbTransactions.persistTransaction).toHaveBeenCalledWith({
        ...dto,
        kind: 'standard',
        categoryId: otherCategory.id,
        paymentMethodId: otherPaymentMethod.id,
        accountId: otherAccount.id,
        ownerId: USER_ID_STR,
        sourceIndex: STANDARD_TXN_SRC_IDX,
      });
    });

    it('allows explicit Other category for standard transaction', async () => {
      const transaction = getStandardTransactionResultSerialized();
      const dto = { ...standardDTO, categoryId: otherCategory.id };

      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(otherCategory as any)
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any);
      vi.spyOn(dbTransactions, 'persistTransaction').mockResolvedValue(
        transaction as any,
      );
      (getNextSourceIndex as Mock).mockResolvedValue(STANDARD_TXN_SRC_IDX);

      await createStandardTransaction(dto, USER_ID_STR);

      expect(dbTransactions.persistTransaction).toHaveBeenCalledWith({
        ...dto,
        kind: 'standard',
        ownerId: USER_ID_STR,
        sourceIndex: STANDARD_TXN_SRC_IDX,
      });
    });

    it('throws when standard transaction uses system category', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById').mockResolvedValueOnce({
        ...foodCategory,
        type: CATEGORY_TYPE_SYSTEM,
        name: EXCHANGE_CATEGORY_NAME,
      } as any);

      await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
        SystemCategoryNotAllowed,
      );
    });

    it('throws when payment method is not owned by user', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce({
          ...paymentMethod,
          type: CATEGORY_TYPE_USER,
          ownerId: '123',
          id: '1',
        } as any);

      await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
        PaymentMethodOwnershipError,
      );
    });

    it('throws when account is not owned by user', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce({
          ...accountExpense,
          type: ACCOUNT_TYPE_USER,
          ownerId: '123',
          id: '1',
        } as any);

      await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
        AccountOwnershipError,
      );
    });
  });

  describe('createExchangeTransaction', () => {
    it('creates exchange transaction pair', async () => {
      const transactionPair = getExchangeTransactionResultSerialized();

      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        exchangeCategory as any,
      );
      vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
        transactionPair as any,
      );
      (getNextSourceIndex as Mock)
        .mockResolvedValueOnce(EXCHANGE_TXN_EXPENSE_SRC_IDX)
        .mockResolvedValueOnce(EXCHANGE_TXN_INCOME_SRC_IDX);

      const result = await createExchangeTransaction(exchangeDTO, USER_ID_STR);

      expect(namedResourceDb.findNamedResourceByName).toHaveBeenCalledWith(
        'category',
        EXCHANGE_CATEGORY_NAME,
      );
      expect(result).toEqual(transactionPair);
    });

    it('creates exchange transaction pair from a model-like system category', async () => {
      const transactionPair = getExchangeTransactionResultSerialized();
      const categoryModel = { toObject: vi.fn() };

      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        categoryModel as any,
      );
      vi.spyOn(namedResourceConfig, 'getNamedResourceKindConfig').mockReturnValue({
        serialize: vi.fn().mockReturnValue(exchangeCategory),
      } as any);
      vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
        transactionPair as any,
      );
      (getNextSourceIndex as Mock)
        .mockResolvedValueOnce(EXCHANGE_TXN_EXPENSE_SRC_IDX)
        .mockResolvedValueOnce(EXCHANGE_TXN_INCOME_SRC_IDX);

      const result = await createExchangeTransaction(exchangeDTO, USER_ID_STR);

      expect(namedResourceConfig.getNamedResourceKindConfig).toHaveBeenCalledWith(
        'category',
      );
      expect(result).toEqual(transactionPair);
    });

    it('throws when pair transaction resolves non-system category', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue({
        ...exchangeCategory,
        type: CATEGORY_TYPE_USER,
      } as any);

      await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
        SystemCategoryWrongType,
      );
    });

    it('throws when pair transaction system category has owner', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue({
        ...exchangeCategory,
        ownerId: USER_ID_STR,
      } as any);

      await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
        SystemCategoryHasOwner,
      );
    });

    it('throws when pair transaction category is missing', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(null);

      await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
        CategoryNotFoundError,
      );
    });
  });

  describe('createTransferTransaction', () => {
    it('creates transfer transaction pair', async () => {
      const transactionPair = getTransferTransactionResultSerialized();

      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        transferCategory as any,
      );
      vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
        transactionPair as any,
      );
      (getNextSourceIndex as Mock)
        .mockResolvedValueOnce(TRANSFER_TXN_EXPENSE_SRC_IDX)
        .mockResolvedValueOnce(TRANSFER_TXN_INCOME_SRC_IDX);

      const result = await createTransferTransaction(transferDTO, USER_ID_STR);

      expect(namedResourceDb.findNamedResourceByName).toHaveBeenCalledWith(
        'category',
        TRANSFER_CATEGORY_NAME,
      );
      expect(result).toEqual(transactionPair);
    });
  });

  describe('createInvestmentTransaction', () => {
    const instrumentId = '507f1f77bcf86cd799439012';
    const investmentCategoryId = '507f1f77bcf86cd799439099';

    const mockInstrument = {
      _id: instrumentId,
      ownerId: USER_ID_STR,
      name: 'Apple Inc.',
      kind: 'share',
      currency: 'USD',
    };

    const investmentCategory = {
      id: investmentCategoryId,
      type: 'system',
      name: 'investment',
    };

    const investmentDTO: TransactionInvestmentDTO = {
      amount: 1000,
      currency: 'USD',
      date: new Date('2026-09-08'),
      description: 'Buy AAPL stock',
      paymentMethodId: paymentMethod.id,
      accountId: accountExpense.id,
      investment: {
        instrumentId,
        operationKind: 'buy',
        note: 'Long position',
      },
    };

    it('creates investment transaction and linked operation', async () => {
      const serializedTransaction = {
        ...getStandardTransactionResultSerialized(),
        kind: 'investment',
      };

      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        investmentCategory as any,
      );
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any);

      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrument as any,
      );
      (getNextSourceIndex as Mock).mockResolvedValue(10);
      vi.spyOn(dbTransactions, 'persistTransaction').mockResolvedValue(
        serializedTransaction as any,
      );

      const result = await createInvestmentTransaction(investmentDTO, USER_ID_STR);

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith(
        {
          _id: instrumentId,
          ownerId: USER_ID_STR,
        },
        null,
        { session: expect.anything() },
      );
      expect(dbTransactions.persistTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'investment',
          amount: 1000,
          currency: 'USD',
          transactionType: 'expense',
          categoryId: investmentCategoryId,
          paymentMethodId: paymentMethod.id,
          accountId: accountExpense.id,
          ownerId: USER_ID_STR,
          sourceIndex: 10,
        }),
        expect.anything(),
      );
      expect(InvestmentOperationModel.create).toHaveBeenCalledWith(
        [
          {
            ownerId: USER_ID_STR,
            instrumentId,
            transactionId: serializedTransaction.id,
            kind: 'buy',
            amount: 1000,
            currency: 'USD',
            date: investmentDTO.date,
            note: 'Long position',
          },
        ],
        { session: expect.anything() },
      );
      expect(result).toEqual(serializedTransaction);
    });

    it('creates investment transaction with inline newInstrument', async () => {
      const serializedTransaction = {
        ...getStandardTransactionResultSerialized(),
        kind: 'investment',
      };

      const newInstrumentDTO: TransactionInvestmentDTO = {
        ...investmentDTO,
        investment: {
          newInstrument: {
            name: 'Microsoft',
            kind: 'share',
            currency: 'USD',
          },
          operationKind: 'buy',
          note: 'New position',
        },
      };

      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        investmentCategory as any,
      );
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any);

      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);
      vi.mocked(InvestmentInstrumentModel.create).mockResolvedValue([
        { _id: instrumentId },
      ] as any);

      (getNextSourceIndex as Mock).mockResolvedValue(10);
      vi.spyOn(dbTransactions, 'persistTransaction').mockResolvedValue(
        serializedTransaction as any,
      );

      const result = await createInvestmentTransaction(newInstrumentDTO, USER_ID_STR);

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith(
        {
          ownerId: USER_ID_STR,
          nameNormalized: 'microsoft',
        },
        null,
        { session: expect.anything() },
      );
      expect(result).toEqual(serializedTransaction);
    });

    it('throws InvestmentInstrumentNotFoundError if instrument not found', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        investmentCategory as any,
      );
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any);

      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      await expect(
        createInvestmentTransaction(investmentDTO, USER_ID_STR),
      ).rejects.toThrow(InvestmentInstrumentNotFoundError);
    });
  });

  describe('createTransactions in bulk', () => {
    it('prepares mixed transactions and persists them in a single batch', async () => {
      const exchangeCatSerialized = getExchangeCategoryResultSerialized();
      const transferCatSerialized = getTransferCategoryResultSerialized();
      const { expenseProps: exchangeExpenseProps, incomeProps: exchangeIncomeProps } =
        getExchangeTransactionProps(true);
      const { expenseProps: transferExpenseProps, incomeProps: transferIncomeProps } =
        getTransferTransactionProps(true);
      const expectedPreparedTransactions = [
        getStandardTransactionProps(),
        exchangeExpenseProps,
        exchangeIncomeProps,
        transferExpenseProps,
        transferIncomeProps,
      ];

      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName')
        .mockResolvedValueOnce(exchangeCatSerialized as any)
        .mockResolvedValueOnce(transferCatSerialized as any);
      vi.spyOn(dbTransactions, 'persistTransactions').mockResolvedValue([] as any);
      (getNextSourceIndices as Mock).mockResolvedValue([1, 2, 3, 4, 5]);

      await createTransactions(
        {
          transactions: [
            { ...standardDTO, kind: 'standard' },
            { ...exchangeDTO, kind: 'exchange' },
            { ...transferDTO, kind: 'transfer' },
          ],
        },
        USER_ID_STR,
      );

      expect(getNextSourceIndices).toHaveBeenCalledOnce();
      expect(getNextSourceIndices).toHaveBeenCalledWith(USER_ID_STR, 5);
      expect(dbTransactions.persistTransactions).toHaveBeenCalledOnce();
      expect(dbTransactions.persistTransactions).toHaveBeenCalledWith(
        expectedPreparedTransactions,
      );
    });
  });

  describe('createTestTransactions', () => {
    const TOTAL_TRANSACTIONS = 1000;
    const DEFAULT_TRANSACTIONS = 200;

    it('creates test transactions with provided totalTransactions', async () => {
      (TransactionModel.countDocuments as Mock).mockResolvedValue(0);
      (createRandomTransactions as Mock).mockResolvedValue(TOTAL_TRANSACTIONS);

      const result = await createTestTransactions(USER_ID_STR, TOTAL_TRANSACTIONS);

      expect(TransactionModel.countDocuments).toHaveBeenCalledOnce();
      expect(TransactionModel.countDocuments).toHaveBeenCalledWith({
        ownerId: USER_ID_STR,
      });
      expect(createRandomTransactions).toHaveBeenCalledOnce();
      expect(createRandomTransactions).toHaveBeenCalledWith(
        USER_ID_STR,
        TOTAL_TRANSACTIONS,
        sessionMock,
      );
      expect(result).toEqual({ insertedCount: TOTAL_TRANSACTIONS });
    });

    it('uses default totalTransactions when value is not provided', async () => {
      (TransactionModel.countDocuments as Mock).mockResolvedValue(0);
      (createRandomTransactions as Mock).mockResolvedValue(DEFAULT_TRANSACTIONS);

      const result = await createTestTransactions(USER_ID_STR);

      expect(TransactionModel.countDocuments).toHaveBeenCalledOnce();
      expect(createRandomTransactions).toHaveBeenCalledOnce();
      expect(result).toEqual({ insertedCount: DEFAULT_TRANSACTIONS });
    });

    it('throws when owner already has transactions', async () => {
      (TransactionModel.countDocuments as Mock).mockResolvedValue(1);

      const resultPromise = createTestTransactions(USER_ID_STR, TOTAL_TRANSACTIONS);
      await expect(resultPromise).rejects.toThrow(AppError);
      await expect(resultPromise).rejects.toThrow(
        'Cannot add test transactions to a user which already owns some transactions',
      );

      expect(createRandomTransactions).not.toHaveBeenCalled();
    });
  });
});
