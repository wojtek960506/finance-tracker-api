import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as namedResourceDb from '@named-resource/db';
import { getSystemExpenseAccountResultSerialized } from '@testing/factories/account';
import { USER_ID_STR } from '@testing/factories/general';
import { getBankTransferPaymentMethodResultSerialized } from '@testing/factories/payment-method';
import { getStandardTransactionResultSerialized } from '@testing/factories/transaction';
import * as dbTransactions from '@transaction/db';
import { TransactionInvestmentDTO } from '@transaction/schema';
import { InvestmentInstrumentNotFoundError } from '@utils/errors';

import { updateInvestmentTransaction } from './update-investment-transaction';

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    findOne: vi.fn(),
  },
  InvestmentOperationModel: {
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@utils/with-session', () => ({
  withSession: vi.fn(async (fn: any) => fn({} as any)),
}));

describe('update investment transaction', () => {
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

  const paymentMethod = getBankTransferPaymentMethodResultSerialized();
  const accountExpense = getSystemExpenseAccountResultSerialized();

  const investmentDTO: TransactionInvestmentDTO = {
    amount: 1500,
    currency: 'USD',
    date: new Date('2026-09-08'),
    description: 'Updated AAPL stock buy',
    paymentMethodId: paymentMethod.id,
    accountId: accountExpense.id,
    transactionType: 'expense',
    investment: {
      instrumentId,
      operationKind: 'buy',
      note: 'Updated note',
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(mockInstrument as any);
    vi.spyOn(dbTransactions, 'findTransaction').mockResolvedValue(
      existingTransactionDoc as any,
    );
    vi.spyOn(dbTransactions, 'saveTransactionChanges').mockResolvedValue(
      serializedTransaction as any,
    );
    vi.mocked(InvestmentOperationModel.findOneAndUpdate).mockResolvedValue({} as any);

    const result = await updateInvestmentTransaction(
      transactionId,
      USER_ID_STR,
      investmentDTO,
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
