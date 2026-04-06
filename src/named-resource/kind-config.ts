import { CheckOwnerType } from '@shared/services';
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

import { getNamedResourceModel, INamedResource } from './model';
import { serializeNamedResource } from './serializers';
import { NamedResourceKind } from './types';

export type NamedResourceResponse = {
  id: string;
  ownerId?: string;
  type: 'user' | 'system';
  name: string;
  nameNormalized: string;
  isFavorite: boolean;
};

export type NamedResourceMapItem = Pick<NamedResourceResponse, 'id' | 'type' | 'name'>;

export type NamedResourcesMap = Record<string, NamedResourceMapItem>;

type NamedResourceKindConfig = {
  model: ReturnType<typeof getNamedResourceModel>;
  serialize: (resource: INamedResource) => NamedResourceResponse;
  checkOwnerType: CheckOwnerType;
  notFoundErrorFactory: (id: string) => Error;
  alreadyExistsErrorFactory: (name: string) => Error;
  systemNameConflictErrorFactory: (name: string) => Error;
  systemUpdateNotAllowedFactory: (id: string) => Error;
  userMissingOwnerFactory: (id: string) => Error;
  systemResourceDeleteErrorFactory: (id: string) => Error;
  checkOccurrences: (id: string) => Promise<void>;
};

const serialize = (resource: INamedResource): NamedResourceResponse => {
  return serializeNamedResource<NamedResourceResponse>(resource);
};

const namedResourceConfigs: Record<NamedResourceKind, NamedResourceKindConfig> = {
  account: {
    model: getNamedResourceModel('account'),
    serialize,
    checkOwnerType: 'account',
    notFoundErrorFactory: (id) => new AccountNotFoundError(id),
    alreadyExistsErrorFactory: (name) => new AccountAlreadyExistsError(name),
    systemNameConflictErrorFactory: (name) => new AccountSystemNameConflictError(name),
    systemUpdateNotAllowedFactory: (id) => new SystemAccountUpdateNotAllowed(id),
    userMissingOwnerFactory: (id) => new UserAccountMissingOwner(id),
    systemResourceDeleteErrorFactory: (id) => new SystemAccountDeletionNotAllowed(id),
    checkOccurrences: (id) => checkTransactionDependencies('accountId', id),
  },
  category: {
    model: getNamedResourceModel('category'),
    serialize,
    checkOwnerType: 'category',
    notFoundErrorFactory: (id) => new CategoryNotFoundError(id),
    alreadyExistsErrorFactory: (name) => new CategoryAlreadyExistsError(name),
    systemNameConflictErrorFactory: (name) => new CategorySystemNameConflictError(name),
    systemUpdateNotAllowedFactory: (id) => new SystemCategoryUpdateNotAllowed(id),
    userMissingOwnerFactory: (id) => new UserCategoryMissingOwner(id),
    systemResourceDeleteErrorFactory: (id) => new SystemCategoryDeletionNotAllowed(id),
    checkOccurrences: (id) => checkTransactionDependencies('categoryId', id),
  },
  paymentMethod: {
    model: getNamedResourceModel('paymentMethod'),
    serialize,
    checkOwnerType: 'paymentMethod',
    notFoundErrorFactory: (id) => new PaymentMethodNotFoundError(id),
    alreadyExistsErrorFactory: (name) => new PaymentMethodAlreadyExistsError(name),
    systemNameConflictErrorFactory: (name) =>
      new PaymentMethodSystemNameConflictError(name),
    systemUpdateNotAllowedFactory: (id) => new SystemPaymentMethodUpdateNotAllowed(id),
    userMissingOwnerFactory: (id) => new UserPaymentMethodMissingOwner(id),
    systemResourceDeleteErrorFactory: (id) =>
      new SystemPaymentMethodDeletionNotAllowed(id),
    checkOccurrences: (id) => checkTransactionDependencies('paymentMethodId', id),
  },
};

export const getNamedResourceKindConfig = (kind: NamedResourceKind) => {
  return namedResourceConfigs[kind];
};
