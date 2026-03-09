import { afterEach, describe, expect, it, vi } from 'vitest';

import { PaymentMethodModel } from '@payment-method/model';
import { PAYMENT_METHODS } from '@utils/consts';
import { withSession } from '@utils/with-session';

import { upsertSystemPaymentMethods } from './upsert-system-payment-methods';

const sessionMock = {} as any;

vi.mock('@utils/with-session', () => ({
  withSession: vi
    .fn()
    .mockImplementation(async (func, ...args) => await func(sessionMock, ...args)),
}));

describe('upsertSystemPaymentMethods', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to withSession', async () => {
    vi.spyOn(PaymentMethodModel, 'updateOne').mockResolvedValue({} as any);

    await upsertSystemPaymentMethods();

    expect(withSession).toHaveBeenCalledOnce();
  });

  it('upserts all expected system payment methods', async () => {
    vi.spyOn(PaymentMethodModel, 'updateOne').mockResolvedValue({} as any);

    await upsertSystemPaymentMethods();

    const methods = Array.from(PAYMENT_METHODS);

    expect(PaymentMethodModel.updateOne).toHaveBeenCalledTimes(methods.length);

    methods.forEach((paymentMethodName, index) => {
      const doc = {
        type: 'system',
        name: paymentMethodName,
        nameNormalized: paymentMethodName.toLowerCase(),
      };
      expect(PaymentMethodModel.updateOne).toHaveBeenNthCalledWith(
        index + 1,
        doc,
        { $setOnInsert: doc },
        { upsert: true, session: sessionMock },
      );
    });
  });
});
