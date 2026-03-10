import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as db from '@payment-method/db';
import { serializePaymentMethod } from '@payment-method/serializers';
import * as services from '@payment-method/services';
import * as namedResource from '@shared/named-resource';

import { getOrCreatePaymentMethod } from './get-or-create-payment-method';

const getOrCreateImpl = vi.fn();

vi.mock('@payment-method/db', () => ({
  findPaymentMethodByName: vi.fn(),
}));

vi.mock('@payment-method/serializers', () => ({
  serializePaymentMethod: vi.fn(),
}));

vi.mock('@payment-method/services', () => ({
  createPaymentMethod: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    getOrCreateNamedResource: vi.fn(() => getOrCreateImpl),
  };
});

describe('getOrCreatePaymentMethod wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to getOrCreateNamedResource with payment-method deps', async () => {
    getOrCreateImpl.mockResolvedValue({ id: '1' });

    const result = await getOrCreatePaymentMethod('u1', 'Card');

    expect(namedResource.getOrCreateNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.getOrCreateNamedResource as Mock).mock.calls[0];
    expect(deps.findByName).toBe(db.findPaymentMethodByName);
    expect(deps.serialize).toBe(serializePaymentMethod);
    expect(deps.create).toBe(services.createPaymentMethod);
    expect(getOrCreateImpl).toHaveBeenCalledWith('u1', 'Card');
    expect(result).toEqual({ id: '1' });
  });
});
