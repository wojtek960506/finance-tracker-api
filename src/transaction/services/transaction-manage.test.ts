import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import * as investmentServices from '@investment/services';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as namedResourceDb from '@named-resource/db';
import * as namedResourceConfig from '@named-resource/kind-config';
import * as namedResourceServices from '@named-resource/services';
import {
  ACCOUNT_TYPE_USER,
  getOtherAccountResultSerialized,
  getSystemExpenseAccountResultSerialized,
  getSystemIncomeAccountResultSerialized,
} from '@testing/factories/account';
import {
  CATEGORY_TYPE_SYSTEM,
  CATEGORY_TYPE_USER,
  getExchangeCategoryResultJSON,
  getOtherCategoryResultSerialized,
  getTransferCategoryResultJSON,
  getUserCategoryResultSerialized,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import {
  getBankTransferPaymentMethodResultSerialized,
  getOtherPaymentMethodResultSerialized,
} from '@testing/factories/payment-method';
import {
  EXCHANGE_TXN_EXPENSE_ID_STR,
  getExchangeTransactionDTO,
  getExchangeTransactionResultJSON,
  getStandardTransactionDTO,
  getStandardTransactionNotPopulatedResultJSON,
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
  getTransferTransactionDTO,
  getTransferTransactionResultJSON,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_ID_STR,
  TRANSFER_TXN_EXPENSE_ID_STR,
} from '@testing/factories/transaction';
import * as dbTransactions from '@transaction/db';
import { TransactionModel } from '@transaction/model';
import { TransactionInvestmentDTO } from '@transaction/schema';
import { serializeTransaction } from '@transaction/serializers';
import {
  deleteTransaction,
  deleteTransactions,
  getTransaction,
  listTransactions,
  updateExchangeTransaction,
  updateInvestmentTransaction,
  updateStandardTransaction,
  updateTransferTransaction,
} from '@transaction/services';
import { loadOwnedTransactionDetails } from '@transaction/services/get-transaction/get-transaction';
import {
  AccountOwnershipError,
  CategoryNotFoundError,
  InvestmentInstrumentNotFoundError,
  NotFoundError,
  PaymentMethodOwnershipError,
  SystemCategoryHasOwner,
  SystemCategoryNotAllowed,
  SystemCategoryWrongType,
} from '@utils/errors';

vi.mock(import('@investment/services'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    prepareInvestmentOperationsMap: vi.fn().mockResolvedValue({}),
  };
});

vi.mock('@named-resource/services', () => ({
  prepareNamedResourcesMap: vi.fn().mockResolvedValue({}),
}));

vi.mock('@transaction/db', () => ({
  findTransaction: vi.fn(),
  findTransactionNullable: vi.fn(),
  findTransactions: vi.fn(),
  findTransactionsCount: vi.fn(),
  saveTransactionChanges: vi.fn(),
  saveTransactionPairChanges: vi.fn(),
  loadTransactionWithReference: vi.fn(),
  updateTransactionsDeletion: vi.fn(),
}));

vi.mock('@transaction/serializers', () => ({
  serializeTransaction: vi.fn(),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    find: vi.fn(),
  },
}));

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
  InvestmentOperationModel: {
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@utils/with-session', () => ({
  withSession: vi.fn(async (fn: any) => fn({} as any)),
}));

describe('transaction-manage services', () => {
  const foodCategory = getUserCategoryResultSerialized();
  const transferCategory = getTransferCategoryResultJSON();
  const exchangeCategory = getExchangeCategoryResultJSON();
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();
  const paymentMethod = getBankTransferPaymentMethodResultSerialized();
  const otherPaymentMethod = getOtherPaymentMethodResultSerialized();
  const accountExpense = getSystemExpenseAccountResultSerialized();
  const accountIncome = getSystemIncomeAccountResultSerialized();
  const otherAccount = getOtherAccountResultSerialized();
  const otherCategory = getOtherCategoryResultSerialized();
  const standardTxJSON = getStandardTransactionResultJSON();
  const standardTxNotPopulatedJSON = getStandardTransactionNotPopulatedResultJSON();
  const transferPairJSON = getTransferTransactionResultJSON();
  const exchangePairJSON = getExchangeTransactionResultJSON();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransaction & loadOwnedTransactionDetails', () => {
    it('get transaction', async () => {
      const populateMock = vi.fn();
      const transaction = {
        ...standardTxJSON,
        populate: populateMock,
      };
      const transactionSerialized = getStandardTransactionResultSerialized();

      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(transaction as any);
      vi.mocked(serializeTransaction).mockReturnValue(transactionSerialized);

      const result = await getTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

      expect(dbTransactions.findTransaction).toHaveBeenCalledOnce();
      expect(dbTransactions.findTransaction).toHaveBeenCalledWith(
        STANDARD_TXN_ID_STR,
        {},
      );
      expect(serializeTransaction).toHaveBeenCalledOnce();
      expect(serializeTransaction).toHaveBeenCalledWith(transaction, {
        investmentsMap: {},
      });
      expect(result).toEqual(transactionSerialized);
    });

    it('returns transaction with reference details when reference exists', async () => {
      const populateMock = vi.fn();
      const populateReferenceMock = vi.fn();
      const { expenseTransactionJSON, incomeTransactionJSON } = transferPairJSON;
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

      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(transaction as any);
      vi.mocked(dbTransactions.findTransactionNullable).mockResolvedValue(
        reference as any,
      );
      vi.mocked(serializeTransaction)
        .mockReturnValueOnce(expenseTransactionSerialized)
        .mockReturnValueOnce(incomeTransactionSerialized);

      const result = await getTransaction(transaction._id.toString(), USER_ID_STR);

      expect(dbTransactions.findTransactionNullable).toHaveBeenCalledWith(
        reference._id.toString(),
        {},
      );
      expect(serializeTransaction).toHaveBeenCalledTimes(2);
      expect(serializeTransaction).toHaveBeenNthCalledWith(1, transaction, {
        investmentsMap: {},
      });
      expect(serializeTransaction).toHaveBeenNthCalledWith(2, reference, {
        investmentsMap: {},
      });
      expect(result).toEqual({
        ...expenseTransactionSerialized,
        reference: incomeTransactionSerialized,
      });
    });

    it('fetches and passes investment map for investment transactions', async () => {
      const populateMock = vi.fn();
      const investmentTxJSON = {
        ...standardTxJSON,
        kind: 'investment',
        populate: populateMock,
      };
      const investmentDetails = {
        operationKind: 'buy' as const,
        instrument: {
          id: '651a00000000000000000001',
          name: 'Apple Inc.',
          kind: 'share' as const,
          currency: 'USD',
        },
      };
      const investmentsMap = {
        [investmentTxJSON._id.toString()]: investmentDetails,
      };

      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(
        investmentTxJSON as any,
      );
      vi.mocked(investmentServices.prepareInvestmentOperationsMap).mockResolvedValue(
        investmentsMap as any,
      );
      vi.mocked(serializeTransaction).mockReturnValue({
        ...getStandardTransactionResultSerialized(),
        kind: 'investment',
        investment: investmentDetails,
      });

      const result = await getTransaction(investmentTxJSON._id.toString(), USER_ID_STR);

      expect(investmentServices.prepareInvestmentOperationsMap).toHaveBeenCalledWith(
        USER_ID_STR,
        [investmentTxJSON._id.toString()],
      );
      expect(serializeTransaction).toHaveBeenCalledWith(investmentTxJSON, {
        investmentsMap,
      });
      expect(result.kind).toBe('investment');
      if (result.kind === 'investment') {
        expect(result.investment).toEqual(investmentDetails);
      }
    });

    // prettier-ignore
    it(
      'loadOwnedTransactionDetails returns undefined reference when nullable lookup misses',
      async () => {
      const populateMock = vi.fn();
      const { expenseTransactionJSON, incomeTransactionJSON } = transferPairJSON;
      const transaction = {
        ...expenseTransactionJSON,
        refId: incomeTransactionJSON._id,
        populate: populateMock,
      };

      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(transaction as any);
      vi.mocked(dbTransactions.findTransactionNullable).mockResolvedValue(undefined);

      const result = await loadOwnedTransactionDetails(
        transaction._id.toString(),
        USER_ID_STR,
      );

      expect(dbTransactions.findTransactionNullable).toHaveBeenCalledWith(
        incomeTransactionJSON._id.toString(),
        {},
      );
      expect(result).toEqual({
        transaction,
        reference: undefined,
      });
    });
  });

  describe('listTransactions', () => {
    it('queries transactions, resolves maps and serializes results', async () => {
      const txStandard = {
        _id: { toString: () => 'tx-1' },
        kind: 'standard',
        accountId: { toString: () => 'acc-1' },
        categoryId: { toString: () => 'cat-1' },
        paymentMethodId: { toString: () => 'pm-1' },
      };
      const txInvestment = {
        _id: { toString: () => 'tx-2' },
        kind: 'investment',
        accountId: { toString: () => 'acc-2' },
        categoryId: { toString: () => 'cat-2' },
        paymentMethodId: { toString: () => 'pm-2' },
      };

      vi.mocked(dbTransactions.findTransactions).mockResolvedValue([
        txStandard,
        txInvestment,
      ] as any);
      vi.mocked(dbTransactions.findTransactionsCount).mockResolvedValue(15);

      const investmentMap = {
        'tx-2': {
          operationKind: 'buy' as const,
          instrument: {
            id: 'inst-1',
            name: 'Tesla',
            kind: 'share' as const,
            currency: 'USD',
          },
        },
      };
      vi.mocked(investmentServices.prepareInvestmentOperationsMap).mockResolvedValue(
        investmentMap as any,
      );

      const serialize = vi.fn().mockImplementation((tx, maps) => ({
        id: tx._id.toString(),
        kind: tx.kind,
        inv: maps?.investmentsMap?.[tx._id.toString()],
      }));

      const result = await listTransactions({
        filter: { ownerId: 'u1' as any },
        query: { page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' },
        userId: 'u1',
        serialize,
      });

      expect(dbTransactions.findTransactions).toHaveBeenCalledWith(
        { ownerId: 'u1' },
        { page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' },
      );
      expect(dbTransactions.findTransactionsCount).toHaveBeenCalledWith({
        ownerId: 'u1',
      });
      expect(namedResourceServices.prepareNamedResourcesMap).toHaveBeenCalledTimes(3);
      expect(investmentServices.prepareInvestmentOperationsMap).toHaveBeenCalledWith(
        'u1',
        ['tx-2'],
      );

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
        items: [
          { id: 'tx-1', kind: 'standard', inv: undefined },
          { id: 'tx-2', kind: 'investment', inv: investmentMap['tx-2'] },
        ],
      });
    });
  });

  describe('updateStandardTransaction, updateTransfer, updateExchange', () => {
    it('updates standard transaction', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce(accountExpense as any);
      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(
        standardTxNotPopulatedJSON as any,
      );
      vi.mocked(dbTransactions.saveTransactionChanges).mockResolvedValue(
        standardTxNotPopulatedJSON as any,
      );

      const result = await updateStandardTransaction(
        STANDARD_TXN_ID_STR,
        USER_ID_STR,
        standardDTO,
      );

      expect(dbTransactions.saveTransactionChanges).toHaveBeenCalledWith(
        standardTxNotPopulatedJSON,
        standardDTO,
      );
      expect(result).toEqual(standardTxNotPopulatedJSON);
    });

    it('maps omitted standard resource ids to Other system resources on update', async () => {
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
      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(
        standardTxNotPopulatedJSON as any,
      );
      vi.mocked(dbTransactions.saveTransactionChanges).mockResolvedValue(
        standardTxNotPopulatedJSON as any,
      );

      await updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, dto);

      expect(dbTransactions.saveTransactionChanges).toHaveBeenCalledWith(
        standardTxNotPopulatedJSON,
        {
          ...dto,
          categoryId: otherCategory.id,
          paymentMethodId: otherPaymentMethod.id,
          accountId: otherAccount.id,
        },
      );
    });

    it('updates transfer transaction pair', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        transferCategory as any,
      );
      vi.mocked(dbTransactions.loadTransactionWithReference).mockResolvedValue(
        transferPairJSON as any,
      );
      vi.mocked(dbTransactions.saveTransactionPairChanges).mockResolvedValue(
        transferPairJSON as any,
      );

      const result = await updateTransferTransaction(
        TRANSFER_TXN_EXPENSE_ID_STR,
        USER_ID_STR,
        transferDTO,
      );

      expect(result).toEqual(transferPairJSON);
    });

    it('updates exchange transaction pair', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
        exchangeCategory as any,
      );
      vi.mocked(dbTransactions.loadTransactionWithReference).mockResolvedValue(
        exchangePairJSON as any,
      );
      vi.mocked(dbTransactions.saveTransactionPairChanges).mockResolvedValue(
        exchangePairJSON as any,
      );

      const result = await updateExchangeTransaction(
        EXCHANGE_TXN_EXPENSE_ID_STR,
        USER_ID_STR,
        exchangeDTO,
      );

      expect(result).toEqual(exchangePairJSON);
    });

    it('updates exchange transaction pair from a model-like system category', async () => {
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
      vi.mocked(dbTransactions.loadTransactionWithReference).mockResolvedValue(
        exchangePairJSON as any,
      );
      vi.mocked(dbTransactions.saveTransactionPairChanges).mockResolvedValue(
        exchangePairJSON as any,
      );

      const result = await updateExchangeTransaction(
        EXCHANGE_TXN_EXPENSE_ID_STR,
        USER_ID_STR,
        exchangeDTO,
      );

      expect(namedResourceConfig.getNamedResourceKindConfig).toHaveBeenCalledWith(
        'category',
      );
      expect(result).toEqual(exchangePairJSON);
    });

    it('throws when updating standard transaction with system category', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById').mockResolvedValueOnce({
        ...foodCategory,
        type: CATEGORY_TYPE_SYSTEM,
        name: 'exchange',
      } as any);

      await expect(
        updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
      ).rejects.toThrow(SystemCategoryNotAllowed);
    });

    it('throws when updating standard transaction with account not owned by user', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce(paymentMethod as any)
        .mockResolvedValueOnce({
          ...accountExpense,
          type: ACCOUNT_TYPE_USER,
          ownerId: '123',
          id: '1',
        } as any);

      await expect(
        updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
      ).rejects.toThrow(AccountOwnershipError);
    });

    // prettier-ignore
    it(
      'throws when updating standard transaction with payment method not owned by user',
      async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce({
          ...paymentMethod,
          type: CATEGORY_TYPE_USER,
          ownerId: '123',
          id: '1',
        } as any);

      await expect(
        updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
      ).rejects.toThrow(PaymentMethodOwnershipError);
    });

    it('throws when updating pair transaction with non-system category', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue({
        ...exchangeCategory,
        type: CATEGORY_TYPE_USER,
      } as any);

      await expect(
        updateExchangeTransaction(EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, exchangeDTO),
      ).rejects.toThrow(SystemCategoryWrongType);
    });

    it('throws when updating pair transaction system category has owner', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue({
        ...exchangeCategory,
        ownerId: USER_ID_STR,
      } as any);

      await expect(
        updateExchangeTransaction(EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, exchangeDTO),
      ).rejects.toThrow(SystemCategoryHasOwner);
    });

    it('throws when updating pair transaction category is missing', async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any)
        .mockResolvedValueOnce(paymentMethod as any);
      vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(null);

      await expect(
        updateExchangeTransaction(EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, exchangeDTO),
      ).rejects.toThrow(CategoryNotFoundError);
    });
  });

  describe('updateInvestmentTransaction', () => {
    const transactionId = '507f1f77bcf86cd799439010';
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
      amount: 1500,
      currency: 'USD',
      date: new Date('2026-09-08'),
      description: 'Updated AAPL stock buy',
      paymentMethodId: paymentMethod.id,
      accountId: accountExpense.id,
      investment: {
        instrumentId,
        operationKind: 'buy',
        note: 'Updated note',
      },
    };

    it('updates investment transaction and updates linked operation', async () => {
      const existingTransactionDoc = {
        _id: transactionId,
        ownerId: USER_ID_STR,
        kind: 'investment',
      };

      const serializedTransaction = {
        ...getStandardTransactionResultSerialized(),
        kind: 'investment',
        amount: 1500,
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
      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(
        existingTransactionDoc as any,
      );
      vi.mocked(dbTransactions.saveTransactionChanges).mockResolvedValue(
        serializedTransaction as any,
      );
      vi.mocked(InvestmentOperationModel.findOneAndUpdate).mockResolvedValue({} as any);

      const result = await updateInvestmentTransaction(
        transactionId,
        USER_ID_STR,
        investmentDTO,
      );

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith(
        {
          _id: instrumentId,
          ownerId: USER_ID_STR,
        },
        null,
        { session: expect.anything() },
      );
      expect(dbTransactions.saveTransactionChanges).toHaveBeenCalledWith(
        existingTransactionDoc,
        expect.objectContaining({
          amount: 1500,
          currency: 'USD',
          transactionType: 'expense',
          categoryId: investmentCategoryId,
          paymentMethodId: paymentMethod.id,
          accountId: accountExpense.id,
        }),
        expect.anything(),
      );
      expect(InvestmentOperationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { transactionId: existingTransactionDoc._id, ownerId: USER_ID_STR },
        {
          instrumentId,
          kind: 'buy',
          amount: 1500,
          currency: 'USD',
          date: investmentDTO.date,
          note: 'Updated note',
        },
        { session: expect.anything(), upsert: true },
      );
      expect(result).toEqual(serializedTransaction);
    });

    it('updates investment transaction with inline newInstrument', async () => {
      const existingTransactionDoc = {
        _id: transactionId,
        ownerId: USER_ID_STR,
        kind: 'investment',
      };

      const serializedTransaction = {
        ...getStandardTransactionResultSerialized(),
        kind: 'investment',
        amount: 1500,
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
          note: 'Updated note with new instrument',
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

      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(
        existingTransactionDoc as any,
      );
      vi.mocked(dbTransactions.saveTransactionChanges).mockResolvedValue(
        serializedTransaction as any,
      );
      vi.mocked(InvestmentOperationModel.findOneAndUpdate).mockResolvedValue({} as any);

      const result = await updateInvestmentTransaction(
        transactionId,
        USER_ID_STR,
        newInstrumentDTO,
      );

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith(
        {
          ownerId: USER_ID_STR,
          nameNormalized: 'microsoft',
        },
        null,
        { session: expect.anything() },
      );

      expect(InvestmentInstrumentModel.create).toHaveBeenCalledWith(
        [
          {
            ownerId: USER_ID_STR,
            name: 'Microsoft',
            nameNormalized: 'microsoft',
            kind: 'share',
            currency: 'USD',
            notes: undefined,
          },
        ],
        { session: expect.anything() },
      );
      expect(InvestmentOperationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { transactionId: existingTransactionDoc._id, ownerId: USER_ID_STR },
        {
          instrumentId,
          kind: 'buy',
          amount: 1500,
          currency: 'USD',
          date: newInstrumentDTO.date,
          note: 'Updated note with new instrument',
        },
        { session: expect.anything(), upsert: true },
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
        updateInvestmentTransaction(transactionId, USER_ID_STR, investmentDTO),
      ).rejects.toThrow(InvestmentInstrumentNotFoundError);
    });
  });

  describe('deleteTransaction & deleteTransactions', () => {
    it('delete transaction', async () => {
      const deleteResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
      const transaction = standardTxJSON;
      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(transaction as any);
      vi.mocked(dbTransactions.updateTransactionsDeletion).mockResolvedValue(
        deleteResult as any,
      );

      const result = await deleteTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

      expect(dbTransactions.findTransaction).toHaveBeenCalledOnce();
      expect(dbTransactions.findTransaction).toHaveBeenCalledWith(
        STANDARD_TXN_ID_STR,
        {},
      );
      expect(dbTransactions.updateTransactionsDeletion).toHaveBeenCalledOnce();
      expect(dbTransactions.updateTransactionsDeletion).toHaveBeenCalledWith(
        [
          {
            id: STANDARD_TXN_ID_STR,
            deletion: expect.objectContaining({}),
          },
        ],
        1,
      );
      expect(result).toEqual(deleteResult);
    });

    it('re-throws when updateTransactionsDeletion fails in deleteTransaction', async () => {
      const transaction = standardTxJSON;
      vi.mocked(dbTransactions.findTransaction).mockResolvedValue(transaction as any);
      vi.mocked(dbTransactions.updateTransactionsDeletion).mockRejectedValue(
        new NotFoundError('Transaction not found'),
      );

      await expect(deleteTransaction(STANDARD_TXN_ID_STR, USER_ID_STR)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('delete transactions for test user', async () => {
      const deleteResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
      vi.mocked(dbTransactions.updateTransactionsDeletion).mockResolvedValue(
        deleteResult as any,
      );
      (TransactionModel.find as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue([standardTxNotPopulatedJSON]),
      });

      const result = await deleteTransactions(USER_ID_STR);

      expect(TransactionModel.find).toHaveBeenCalledOnce();
      expect(dbTransactions.updateTransactionsDeletion).toHaveBeenCalledOnce();
      expect(dbTransactions.updateTransactionsDeletion).toHaveBeenCalledWith([
        {
          id: STANDARD_TXN_ID_STR,
          deletion: expect.objectContaining({}),
        },
      ]);
      expect(result).toEqual(deleteResult);
    });
  });
});
