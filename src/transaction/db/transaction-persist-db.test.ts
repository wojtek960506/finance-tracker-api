import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  EXCHANGE_TXN_EXPENSE_ID_OBJ,
  EXCHANGE_TXN_INCOME_ID_OBJ,
  getExchangeTransactionProps,
  getExchangeTransactionResultJSON,
  getExchangeTransactionResultSerialized,
  getStandardTransactionDTO,
  getStandardTransactionProps,
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
} from '@testing/factories/transaction';
import { TransactionModel } from '@transaction/model';
import { serializeTransaction } from '@transaction/serializers';
import { withSession } from '@utils/with-session';

import { persistTransaction, persistTransactionPair } from './persist-transaction';
import {
  saveTransactionChanges,
  saveTransactionPairChanges,
} from './save-transaction-changes';

vi.mock('@utils/with-session', () => ({
  withSession: vi.fn().mockImplementation(async (func, ...args) => {
    return await func({}, ...args);
  }),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@transaction/serializers', () => ({
  serializeTransaction: vi.fn(),
}));

describe('transaction-persist-db', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('persistTransaction', () => {
    const populateMock = vi.fn();
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

  describe('persistTransactionPair', () => {
    const { incomeProps, expenseProps } = getExchangeTransactionProps(true);
    const { incomeTransactionJSON, expenseTransactionJSON } =
      getExchangeTransactionResultJSON();
    const { incomeTransactionSerialized, expenseTransactionSerialized } =
      getExchangeTransactionResultSerialized();

    it('2 transactions are created and updated', async () => {
      (TransactionModel.create as Mock).mockResolvedValue([
        { _id: EXCHANGE_TXN_EXPENSE_ID_OBJ },
        { _id: EXCHANGE_TXN_INCOME_ID_OBJ },
      ]);

      const mockQuery1 = {
        populate: vi.fn().mockResolvedValue(expenseTransactionJSON),
      };
      const mockQuery2 = {
        populate: vi.fn().mockResolvedValue(incomeTransactionJSON),
      };

      (TransactionModel.findOneAndUpdate as Mock)
        .mockReturnValueOnce(mockQuery1)
        .mockReturnValueOnce(mockQuery2);
      (serializeTransaction as Mock)
        .mockReturnValueOnce(expenseTransactionSerialized)
        .mockReturnValueOnce(incomeTransactionSerialized);

      const result = await persistTransactionPair(expenseProps, incomeProps);

      expect(TransactionModel.create).toHaveBeenCalledOnce();
      expect(TransactionModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(TransactionModel.create).toHaveBeenCalledWith([expenseProps, incomeProps], {
        session: expect.anything(),
        ordered: true,
      });
      expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        1,
        { _id: EXCHANGE_TXN_EXPENSE_ID_OBJ },
        { refId: EXCHANGE_TXN_INCOME_ID_OBJ },
        { session: expect.anything(), new: true },
      );
      expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        2,
        { _id: EXCHANGE_TXN_INCOME_ID_OBJ },
        { refId: EXCHANGE_TXN_EXPENSE_ID_OBJ },
        { session: expect.anything(), new: true },
      );
      expect(withSession).toHaveBeenCalledOnce();
      expect(result).toEqual([expenseTransactionSerialized, incomeTransactionSerialized]);
    });
  });

  describe('saveTransactionChanges', () => {
    const saveMock = vi.fn();
    const populateMock = vi.fn();

    const dto = getStandardTransactionDTO();
    const transactionJSON = getStandardTransactionResultJSON();
    const transactionSerialized = getStandardTransactionResultSerialized();

    const newProps = { ...dto, amount: 123 };
    const transaction = {
      ...transactionJSON,
      save: saveMock,
      populate: populateMock,
    } as any;
    const transactionAfterUpdate = { ...transaction, ...dto, amount: 123 };
    const transactionAfterSerialization = {
      ...transactionSerialized,
      amount: 123,
    };

    it('save single transaction changes', async () => {
      (serializeTransaction as Mock).mockReturnValue(transactionAfterSerialization);

      const result = await saveTransactionChanges(transaction, newProps);

      expect(saveMock).toHaveBeenCalledOnce();
      expect(populateMock).toHaveBeenCalledOnce();
      expect(serializeTransaction).toHaveBeenCalledOnce();
      expect(serializeTransaction).toHaveBeenCalledWith(transactionAfterUpdate);
      expect(result).toEqual(transactionAfterSerialization);
    });
  });

  describe('saveTransactionPairChanges', () => {
    const [saveMock1, saveMock2] = [vi.fn(), vi.fn()];
    const [populateMock1, populateMock2] = [vi.fn(), vi.fn()];

    const { expenseProps, incomeProps } = getExchangeTransactionProps();
    const { expenseTransactionSerialized, incomeTransactionSerialized } =
      getExchangeTransactionResultSerialized();

    const transactionExpense = {
      ...expenseTransactionSerialized,
      ...expenseProps,
      save: saveMock1,
      populate: populateMock1,
    } as any;
    const transactionIncome = {
      ...incomeTransactionSerialized,
      ...incomeProps,
      save: saveMock2,
      populate: populateMock2,
    } as any;

    it('reference transaction is an income', async () => {
      (serializeTransaction as Mock)
        .mockReturnValueOnce(transactionExpense)
        .mockReturnValueOnce(transactionIncome);

      const result = await saveTransactionPairChanges(
        transactionExpense,
        transactionIncome,
        expenseProps,
        incomeProps,
      );

      expect(serializeTransaction).toHaveBeenCalledTimes(2);
      expect(serializeTransaction).toHaveBeenNthCalledWith(1, transactionExpense);
      expect(serializeTransaction).toHaveBeenNthCalledWith(2, transactionIncome);
      expect(saveMock1).toHaveBeenCalledOnce();
      expect(populateMock1).toHaveBeenCalledOnce();
      expect(saveMock2).toHaveBeenCalledOnce();
      expect(populateMock2).toHaveBeenCalledOnce();
      expect(withSession).toHaveBeenCalledOnce();
      expect(result).toEqual([transactionExpense, transactionIncome]);
    });

    it('reference transaction is an expense', async () => {
      const mainTransactionIsIncome = {
        ...incomeTransactionSerialized,
        ...incomeProps,
        save: saveMock2,
        populate: populateMock2,
      } as any;

      const refTransactionIsExpense = {
        ...expenseTransactionSerialized,
        ...expenseProps,
        save: saveMock1,
        populate: populateMock1,
      } as any;

      (serializeTransaction as Mock)
        .mockReturnValueOnce(mainTransactionIsIncome)
        .mockReturnValueOnce(refTransactionIsExpense);

      const result = await saveTransactionPairChanges(
        mainTransactionIsIncome,
        refTransactionIsExpense,
        expenseProps,
        incomeProps,
      );

      expect(serializeTransaction).toHaveBeenCalledTimes(2);
      expect(serializeTransaction).toHaveBeenNthCalledWith(1, mainTransactionIsIncome);
      expect(serializeTransaction).toHaveBeenNthCalledWith(2, refTransactionIsExpense);
      expect(saveMock1).toHaveBeenCalledOnce();
      expect(populateMock1).toHaveBeenCalledOnce();
      expect(saveMock2).toHaveBeenCalledOnce();
      expect(populateMock2).toHaveBeenCalledOnce();
      expect(withSession).toHaveBeenCalledOnce();
      expect(result).toEqual([mainTransactionIsIncome, refTransactionIsExpense]);
    });
  });
});
