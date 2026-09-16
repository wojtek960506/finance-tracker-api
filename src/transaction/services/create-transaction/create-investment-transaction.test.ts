import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as namedResourceDb from '@named-resource/db';
import { getSystemExpenseAccountResultSerialized } from '@testing/factories/account';
import { USER_ID_STR } from '@testing/factories/general';
import { getBankTransferPaymentMethodResultSerialized } from '@testing/factories/payment-method';
import { getStandardTransactionResultSerialized } from '@testing/factories/transaction';
import * as dbTransactions from '@transaction/db';
import { TransactionInvestmentDTO } from '@transaction/schema';
import { getNextSourceIndex } from '@transaction/services';
import { InvestmentInstrumentNotFoundError } from '@utils/errors';

import { createInvestmentTransaction } from './create-investment-transaction';

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
}));

vi.mock('@utils/with-session', () => ({
  withSession: vi.fn(async (fn: any) => fn({} as any)),
}));

describe('create investment transaction', () => {
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

  const paymentMethod = getBankTransferPaymentMethodResultSerialized();
  const accountExpense = getSystemExpenseAccountResultSerialized();

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

  afterEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(mockInstrument as any);
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
    expect(InvestmentOperationModel.create).toHaveBeenCalledWith(
      [
        {
          ownerId: USER_ID_STR,
          instrumentId,
          transactionId: serializedTransaction.id,
          kind: 'buy',
          amount: 1000,
          currency: 'USD',
          date: newInstrumentDTO.date,
          note: 'New position',
        },
      ],
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

    await expect(createInvestmentTransaction(investmentDTO, USER_ID_STR)).rejects.toThrow(
      InvestmentInstrumentNotFoundError,
    );
  });
});
