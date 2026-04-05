import { USER_ID_STR } from '@testing/factories/general';
import {
  CASH_PAYMENT_METHOD_ID_STR,
  getUpdatePaymentMethodProps,
  getUserPaymentMethodResultSerialized,
} from '@testing/factories/payment-method';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';

import { paymentMethodRoutes } from './payment-method-routes';

const {
  createImpl,
  deleteImpl,
  favoriteImpl,
  getFavoritesImpl,
  getImpl,
  listImpl,
  unfavoriteImpl,
  updateImpl,
} = vi.hoisted(() => ({
  createImpl: vi.fn(),
  deleteImpl: vi.fn(),
  favoriteImpl: vi.fn(),
  getFavoritesImpl: vi.fn(),
  getImpl: vi.fn(),
  listImpl: vi.fn(),
  unfavoriteImpl: vi.fn(),
  updateImpl: vi.fn(),
}));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));
vi.mock('@shared/named-resource/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource/services')>();
  return {
    ...actual,
    createNamedResource: createImpl,
    deleteNamedResource: deleteImpl,
    favoriteNamedResource: favoriteImpl,
    getFavoriteNamedResources: getFavoritesImpl,
    getNamedResource: getImpl,
    listNamedResources: listImpl,
    unfavoriteNamedResource: unfavoriteImpl,
    updateNamedResource: updateImpl,
  };
});

describe('payment method routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(paymentMethodRoutes);
  await registerErrorHandler(app);

  const paymentMethodDTO = getUpdatePaymentMethodProps();
  const paymentMethodResult = getUserPaymentMethodResultSerialized();
  const deleteResult = { acknowledged: true, deletedCount: 1 };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get payment methods - 'GET /'", async () => {
    listImpl.mockResolvedValue([paymentMethodResult]);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(listImpl).toHaveBeenCalledWith('paymentMethod', USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([paymentMethodResult]);
  });

  it("should get payment method - 'GET /:id'", async () => {
    getImpl.mockResolvedValue(paymentMethodResult);

    const response = await app.inject({
      method: 'GET',
      url: `/${CASH_PAYMENT_METHOD_ID_STR}`,
    });

    expect(getImpl).toHaveBeenCalledWith(
      'paymentMethod',
      CASH_PAYMENT_METHOD_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(paymentMethodResult);
  });

  it("should get favorite payment methods - 'GET /favorites'", async () => {
    getFavoritesImpl.mockResolvedValue([paymentMethodResult]);

    const response = await app.inject({ method: 'GET', url: '/favorites' });

    expect(getFavoritesImpl).toHaveBeenCalledWith('paymentMethod', USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([paymentMethodResult]);
  });

  it("should create payment method - 'POST /'", async () => {
    createImpl.mockResolvedValue(paymentMethodResult);

    const response = await app.inject({
      method: 'POST',
      url: '/',
      body: paymentMethodDTO,
    });

    expect(createImpl).toHaveBeenCalledWith(
      'paymentMethod',
      USER_ID_STR,
      paymentMethodDTO,
    );
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(paymentMethodResult);
  });

  it("should update payment method - 'PUT /:id'", async () => {
    updateImpl.mockResolvedValue(paymentMethodResult);

    const response = await app.inject({
      method: 'PUT',
      url: `/${CASH_PAYMENT_METHOD_ID_STR}`,
      body: paymentMethodDTO,
    });

    expect(updateImpl).toHaveBeenCalledWith(
      'paymentMethod',
      CASH_PAYMENT_METHOD_ID_STR,
      USER_ID_STR,
      paymentMethodDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(paymentMethodResult);
  });

  it("should favorite payment method - 'POST /:id/favorite'", async () => {
    favoriteImpl.mockResolvedValue(paymentMethodResult);

    const response = await app.inject({
      method: 'POST',
      url: `/${CASH_PAYMENT_METHOD_ID_STR}/favorite`,
    });

    expect(favoriteImpl).toHaveBeenCalledWith(
      'paymentMethod',
      CASH_PAYMENT_METHOD_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(paymentMethodResult);
  });

  it("should unfavorite payment method - 'DELETE /:id/favorite'", async () => {
    unfavoriteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${CASH_PAYMENT_METHOD_ID_STR}/favorite`,
    });

    expect(unfavoriteImpl).toHaveBeenCalledWith(
      'paymentMethod',
      CASH_PAYMENT_METHOD_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });

  it("should delete payment method - 'DELETE /:id'", async () => {
    deleteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${CASH_PAYMENT_METHOD_ID_STR}`,
    });

    expect(deleteImpl).toHaveBeenCalledWith(
      'paymentMethod',
      CASH_PAYMENT_METHOD_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });
});
