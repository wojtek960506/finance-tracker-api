import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { PaymentMethodModel } from '@payment-method/model';
import { serializePaymentMethod } from '@payment-method/serializers';
import * as namedResource from '@shared/named-resource';
import { PaymentMethodNotFoundError } from '@utils/errors';

import {
  findPaymentMethodById,
  findPaymentMethodByName,
  findPaymentMethods,
  persistPaymentMethod,
  savePaymentMethodChanges,
} from './payment-method.db';

vi.mock('@payment-method/model', () => ({
  PaymentMethodModel: {},
}));

vi.mock('@payment-method/serializers', () => ({
  serializePaymentMethod: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    findNamedResourceById: vi.fn(),
    findNamedResourceByName: vi.fn(),
    findNamedResources: vi.fn(),
    persistNamedResource: vi.fn(),
    saveNamedResourceChanges: vi.fn(),
  };
});

describe('payment-method db wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // prettier-ignore
  it(
    'findPaymentMethodById delegates to findNamedResourceById with not-found factory',
    async () => {
      const resultObj = { id: '1' };
      (namedResource.findNamedResourceById as Mock).mockResolvedValue(resultObj);

      const result = await findPaymentMethodById('pm-1');

      expect(namedResource.findNamedResourceById).toHaveBeenCalledOnce();
      const [modelArg, idArg, factoryArg] = (namedResource.findNamedResourceById as Mock)
        .mock.calls[0];
      expect(modelArg).toBe(PaymentMethodModel);
      expect(idArg).toBe('pm-1');
      expect(factoryArg('x')).toBeInstanceOf(PaymentMethodNotFoundError);
      expect(result).toBe(resultObj);
    }
  );

  it('findPaymentMethodByName delegates to findNamedResourceByName', async () => {
    const resultObj = { id: '1' };
    (namedResource.findNamedResourceByName as Mock).mockResolvedValue(resultObj);

    const result = await findPaymentMethodByName('Card', 'u1');

    expect(namedResource.findNamedResourceByName).toHaveBeenCalledWith(
      PaymentMethodModel,
      'Card',
      'u1',
    );
    expect(result).toBe(resultObj);
  });

  it('findPaymentMethods delegates to findNamedResources', async () => {
    const resultObj = [{ id: '1' }];
    (namedResource.findNamedResources as Mock).mockResolvedValue(resultObj);

    const result = await findPaymentMethods('u1', ['p1']);

    expect(namedResource.findNamedResources).toHaveBeenCalledWith(
      PaymentMethodModel,
      'u1',
      ['p1'],
    );
    expect(result).toBe(resultObj);
  });

  it('persistPaymentMethod delegates to persistNamedResource with serializer', async () => {
    const props = {
      ownerId: 'u1',
      type: 'user' as const,
      name: 'Card',
      nameNormalized: 'card',
    };
    const resultObj = { id: '1' };
    (namedResource.persistNamedResource as Mock).mockResolvedValue(resultObj);

    const result = await persistPaymentMethod(props);

    expect(namedResource.persistNamedResource).toHaveBeenCalledWith(
      PaymentMethodModel,
      props,
      serializePaymentMethod,
    );
    expect(result).toBe(resultObj);
  });

  it('savePaymentMethodChanges delegates to saveNamedResourceChanges with serializer', async () => {
    const paymentMethod = { _id: '1' } as any;
    const props = { name: 'New', nameNormalized: 'new' };
    const resultObj = { id: '1', name: 'New' };
    (namedResource.saveNamedResourceChanges as Mock).mockResolvedValue(resultObj);

    const result = await savePaymentMethodChanges(paymentMethod, props);

    expect(namedResource.saveNamedResourceChanges).toHaveBeenCalledWith(
      paymentMethod,
      props,
      serializePaymentMethod,
    );
    expect(result).toBe(resultObj);
  });
});
