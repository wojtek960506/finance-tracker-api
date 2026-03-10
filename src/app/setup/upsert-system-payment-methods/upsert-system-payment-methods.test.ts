import { describe, expect, it, Mock, vi } from 'vitest';

import { upsertSystemNamedResources } from '@app/setup';
import { PaymentMethodModel } from '@payment-method/model';
import { SYSTEM_PAYMENT_METHOD_NAMES } from '@utils/consts';

import { upsertSystemPaymentMethods } from './upsert-system-payment-methods';

vi.mock('@app/setup', () => ({
  upsertSystemNamedResources: vi.fn(),
}));

describe('upsertSystemPaymentMethods', () => {
  it('delegates to upsertSystemNamedResources', async () => {
    (upsertSystemNamedResources as Mock).mockResolvedValue({} as any);

    await upsertSystemPaymentMethods();

    expect(upsertSystemNamedResources).toHaveBeenCalledOnce();
    expect(upsertSystemNamedResources).toHaveBeenCalledWith(
      PaymentMethodModel,
      SYSTEM_PAYMENT_METHOD_NAMES,
    );
  });
});
