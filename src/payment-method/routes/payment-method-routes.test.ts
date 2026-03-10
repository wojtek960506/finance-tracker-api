import { USER_ID_STR } from '@testing/factories/general';
import {
  CASH_PAYMENT_METHOD_ID_STR,
  getUpdatePaymentMethodProps,
  getUserPaymentMethodResultJSON,
  getUserPaymentMethodResultSerialized,
} from '@testing/factories/payment-method';
import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import * as dbPM from '@payment-method/db';
import * as servicePM from '@payment-method/services';

import { paymentMethodRoutes } from './payment-method-routes';

const MOCKED_RESULT = { result: 'result' };
const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));

describe('payment method routes', async () => {
  const app = Fastify();
  app.register(paymentMethodRoutes);
  await registerErrorHandler(app);

  const paymentMethodDTO = getUpdatePaymentMethodProps();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get payment methods - 'GET /'", async () => {
    vi.spyOn(dbPM, 'findPaymentMethods').mockResolvedValue([
      {
        toObject: () => getUserPaymentMethodResultJSON(),
      },
    ] as any);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(dbPM.findPaymentMethods).toHaveBeenCalledOnce();
    expect(dbPM.findPaymentMethods).toHaveBeenCalledWith(USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([getUserPaymentMethodResultSerialized()]);
  });

  it("should get payment method - 'GET /:id'", async () => {
    vi.spyOn(servicePM, 'getPaymentMethod').mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({
      method: 'GET',
      url: `/${CASH_PAYMENT_METHOD_ID_STR}`,
    });

    expect(servicePM.getPaymentMethod).toHaveBeenCalledOnce();
    expect(servicePM.getPaymentMethod).toHaveBeenCalledWith(
      CASH_PAYMENT_METHOD_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should create payment method - 'POST /'", async () => {
    vi.spyOn(servicePM, 'createPaymentMethod').mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({
      method: 'POST',
      url: '/',
      body: paymentMethodDTO,
    });

    expect(servicePM.createPaymentMethod).toHaveBeenCalledOnce();
    expect(servicePM.createPaymentMethod).toHaveBeenCalledWith(
      USER_ID_STR,
      paymentMethodDTO,
    );
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should update payment method - 'PUT /:id'", async () => {
    vi.spyOn(servicePM, 'updatePaymentMethod').mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({
      method: 'PUT',
      url: `/${CASH_PAYMENT_METHOD_ID_STR}`,
      body: paymentMethodDTO,
    });

    expect(servicePM.updatePaymentMethod).toHaveBeenCalledOnce();
    expect(servicePM.updatePaymentMethod).toHaveBeenCalledWith(
      CASH_PAYMENT_METHOD_ID_STR,
      USER_ID_STR,
      paymentMethodDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });
});
