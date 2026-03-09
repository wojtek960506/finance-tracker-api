import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  createPaymentMethod,
  getPaymentMethod,
  preparePaymentMethodsMap,
  updatePaymentMethod,
} from './payment-method.services';

import * as db from '@/payment-method/db';
import { serializePaymentMethod } from '@/payment-method/serializers';
import * as namedResource from '@/shared/named-resource';
import {
  PaymentMethodAlreadyExistsError,
  SystemPaymentMethodUpdateNotAllowed,
  UserPaymentMethodMissingOwner,
} from '@/utils/errors';

const { createImpl, getImpl, updateImpl } = vi.hoisted(() => ({
  createImpl: vi.fn(),
  getImpl: vi.fn(),
  updateImpl: vi.fn(),
}));

vi.mock('@payment-method/db', () => ({
  findPaymentMethodById: vi.fn(),
  findPaymentMethodByName: vi.fn(),
  findPaymentMethods: vi.fn(),
  persistPaymentMethod: vi.fn(),
  savePaymentMethodChanges: vi.fn(),
}));

vi.mock('@payment-method/serializers', () => ({
  serializePaymentMethod: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    createNamedResource: vi.fn(() => createImpl),
    getNamedResource: vi.fn(() => getImpl),
    updateNamedResource: vi.fn(() => updateImpl),
    prepareNamedResourcesMap: vi.fn(),
  };
});

describe('payment-method services wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createPaymentMethod is built with createNamedResource and forwards execution', async () => {
    createImpl.mockResolvedValue({ id: '1' });

    const result = await createPaymentMethod('u1', { name: 'Card' } as any);

    expect(namedResource.createNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.createNamedResource as Mock).mock.calls[0];
    expect(deps.findByName).toBe(db.findPaymentMethodByName);
    expect(deps.persist).toBe(db.persistPaymentMethod);
    expect(deps.alreadyExistsErrorFactory('Card')).toBeInstanceOf(
      PaymentMethodAlreadyExistsError,
    );
    expect(createImpl).toHaveBeenCalledWith('u1', { name: 'Card' });
    expect(result).toEqual({ id: '1' });
  });

  it('getPaymentMethod delegates through getNamedResource with paymentMethod owner type', async () => {
    getImpl.mockResolvedValue({ id: '1' });

    const result = await getPaymentMethod('pm-1', 'u1');

    expect(namedResource.getNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.getNamedResource as Mock).mock.calls[0];
    expect(deps.findById).toBe(db.findPaymentMethodById);
    expect(deps.serialize).toBe(serializePaymentMethod);
    expect(deps.ownerType).toBe('paymentMethod');
    expect(getImpl).toHaveBeenCalledWith('pm-1', 'u1');
    expect(result).toEqual({ id: '1' });
  });

  it('updatePaymentMethod delegates through updateNamedResource with paymentMethod errors', async () => {
    updateImpl.mockResolvedValue({ id: '1' });

    const result = await updatePaymentMethod('pm-1', 'u1', { name: 'New' } as any);

    expect(namedResource.updateNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.updateNamedResource as Mock).mock.calls[0];
    expect(deps.findById).toBe(db.findPaymentMethodById);
    expect(deps.saveChanges).toBe(db.savePaymentMethodChanges);
    expect(deps.ownerType).toBe('paymentMethod');
    expect(deps.systemUpdateNotAllowedFactory('x')).toBeInstanceOf(
      SystemPaymentMethodUpdateNotAllowed,
    );
    expect(deps.userMissingOwnerFactory('x')).toBeInstanceOf(
      UserPaymentMethodMissingOwner,
    );
    expect(updateImpl).toHaveBeenCalledWith('pm-1', 'u1', { name: 'New' });
    expect(result).toEqual({ id: '1' });
  });

  it('preparePaymentMethodsMap delegates list fetch and map preparation', async () => {
    const paymentMethods = [
      { _id: { toString: () => 'p1' }, name: 'Card', type: 'user' },
    ];
    const prepared = { p1: { id: 'p1', name: 'Card', type: 'user' } };
    (db.findPaymentMethods as Mock).mockResolvedValue(paymentMethods);
    (namedResource.prepareNamedResourcesMap as Mock).mockReturnValue(prepared);

    const result = await preparePaymentMethodsMap('u1', [
      { paymentMethodId: { toString: () => 'p1' } } as any,
    ]);

    expect(db.findPaymentMethods).toHaveBeenCalledWith('u1', ['p1']);
    expect(namedResource.prepareNamedResourcesMap).toHaveBeenCalledWith(paymentMethods);
    expect(result).toEqual(prepared);
  });
});
