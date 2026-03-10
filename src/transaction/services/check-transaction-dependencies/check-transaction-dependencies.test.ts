import { describe, expect, it, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';

import { checkTransactionDependencies } from './check-transaction-dependencies';

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    countDocuments: vi.fn(),
  },
}));

describe('checkTransactionDependencies', () => {
  it('returns undefined when no dependency exists for category', async () => {
    (TransactionModel.countDocuments as any).mockResolvedValue(0);

    const result = await checkTransactionDependencies('categoryId', 'cat-1');

    expect(TransactionModel.countDocuments).toHaveBeenCalledWith({
      categoryId: 'cat-1',
    });
    expect(result).toBeUndefined();
  });

  it('throws CategoryDependencyError when category has transactions', async () => {
    (TransactionModel.countDocuments as any).mockResolvedValue(2);

    await expect(checkTransactionDependencies('categoryId', 'cat-1')).rejects.toThrow(
      'Category is being used by some transactions',
    );
  });

  it('throws PaymentMethodDependencyError when payment method has transactions', async () => {
    (TransactionModel.countDocuments as any).mockResolvedValue(1);

    await expect(checkTransactionDependencies('paymentMethodId', 'pm-1')).rejects.toThrow(
      'Payment method is being used by some transactions',
    );
  });
});
