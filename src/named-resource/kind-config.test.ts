import { beforeEach, describe, expect, it, vi } from 'vitest';

const { accountModel, categoryModel, paymentMethodModel } = vi.hoisted(() => ({
  accountModel: { modelName: 'account-model' },
  categoryModel: { modelName: 'category-model' },
  paymentMethodModel: { modelName: 'payment-method-model' },
}));

vi.mock('./model', () => ({
  getNamedResourceModel: vi.fn((kind: string) => {
    if (kind === 'account') return accountModel;
    if (kind === 'category') return categoryModel;
    return paymentMethodModel;
  }),
}));

vi.mock('./serializers', () => ({
  serializeNamedResource: vi.fn((resource) => ({
    id: resource._id.toString(),
    ownerId: resource.ownerId?.toString(),
    type: resource.type,
    name: resource.name,
    nameNormalized: resource.nameNormalized,
  })),
}));

vi.mock('@transaction/services', () => ({
  checkTransactionDependencies: vi.fn(),
}));

import { checkTransactionDependencies } from '@transaction/services';
import {
  AccountAlreadyExistsError,
  AccountNotFoundError,
  AccountSystemNameConflictError,
  CategoryAlreadyExistsError,
  CategoryNotFoundError,
  CategorySystemNameConflictError,
  PaymentMethodAlreadyExistsError,
  PaymentMethodNotFoundError,
  PaymentMethodSystemNameConflictError,
  SystemAccountDeletionNotAllowed,
  SystemAccountUpdateNotAllowed,
  SystemCategoryDeletionNotAllowed,
  SystemCategoryUpdateNotAllowed,
  SystemPaymentMethodDeletionNotAllowed,
  SystemPaymentMethodUpdateNotAllowed,
  UserAccountMissingOwner,
  UserCategoryMissingOwner,
  UserPaymentMethodMissingOwner,
} from '@utils/errors';

import { getNamedResourceKindConfig } from './kind-config';

describe('getNamedResourceKindConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns account config with expected model and factories', async () => {
    const config = getNamedResourceKindConfig('account');

    expect(config.model).toBe(accountModel);
    expect(config.checkOwnerType).toBe('account');
    expect(config.notFoundErrorFactory('id1')).toBeInstanceOf(AccountNotFoundError);
    expect(config.alreadyExistsErrorFactory('Cash')).toBeInstanceOf(
      AccountAlreadyExistsError,
    );
    expect(config.systemNameConflictErrorFactory('Cash')).toBeInstanceOf(
      AccountSystemNameConflictError,
    );
    expect(config.systemUpdateNotAllowedFactory('id1')).toBeInstanceOf(
      SystemAccountUpdateNotAllowed,
    );
    expect(config.userMissingOwnerFactory('id1')).toBeInstanceOf(UserAccountMissingOwner);
    expect(config.systemResourceDeleteErrorFactory('id1')).toBeInstanceOf(
      SystemAccountDeletionNotAllowed,
    );

    await config.checkOccurrences('id1');
    expect(checkTransactionDependencies).toHaveBeenCalledWith('accountId', 'id1');
  });

  it('returns category config with expected model and factories', async () => {
    const config = getNamedResourceKindConfig('category');

    expect(config.model).toBe(categoryModel);
    expect(config.checkOwnerType).toBe('category');
    expect(config.notFoundErrorFactory('id2')).toBeInstanceOf(CategoryNotFoundError);
    expect(config.alreadyExistsErrorFactory('Food')).toBeInstanceOf(
      CategoryAlreadyExistsError,
    );
    expect(config.systemNameConflictErrorFactory('Food')).toBeInstanceOf(
      CategorySystemNameConflictError,
    );
    expect(config.systemUpdateNotAllowedFactory('id2')).toBeInstanceOf(
      SystemCategoryUpdateNotAllowed,
    );
    expect(config.userMissingOwnerFactory('id2')).toBeInstanceOf(
      UserCategoryMissingOwner,
    );
    expect(config.systemResourceDeleteErrorFactory('id2')).toBeInstanceOf(
      SystemCategoryDeletionNotAllowed,
    );

    await config.checkOccurrences('id2');
    expect(checkTransactionDependencies).toHaveBeenCalledWith('categoryId', 'id2');
  });

  it('returns payment method config with expected model and factories', async () => {
    const config = getNamedResourceKindConfig('paymentMethod');

    expect(config.model).toBe(paymentMethodModel);
    expect(config.checkOwnerType).toBe('paymentMethod');
    expect(config.notFoundErrorFactory('id3')).toBeInstanceOf(PaymentMethodNotFoundError);
    expect(config.alreadyExistsErrorFactory('Cash')).toBeInstanceOf(
      PaymentMethodAlreadyExistsError,
    );
    expect(config.systemNameConflictErrorFactory('Cash')).toBeInstanceOf(
      PaymentMethodSystemNameConflictError,
    );
    expect(config.systemUpdateNotAllowedFactory('id3')).toBeInstanceOf(
      SystemPaymentMethodUpdateNotAllowed,
    );
    expect(config.userMissingOwnerFactory('id3')).toBeInstanceOf(
      UserPaymentMethodMissingOwner,
    );
    expect(config.systemResourceDeleteErrorFactory('id3')).toBeInstanceOf(
      SystemPaymentMethodDeletionNotAllowed,
    );

    await config.checkOccurrences('id3');
    expect(checkTransactionDependencies).toHaveBeenCalledWith('paymentMethodId', 'id3');
  });

  it('serializes through shared named resource serializer', () => {
    const config = getNamedResourceKindConfig('category');
    const resource = {
      _id: { toString: () => 'r1' },
      ownerId: { toString: () => 'u1' },
      type: 'user',
      name: 'Food',
      nameNormalized: 'food',
    };

    expect(config.serialize(resource as any)).toEqual({
      id: 'r1',
      ownerId: 'u1',
      type: 'user',
      name: 'Food',
      nameNormalized: 'food',
    });
  });
});
