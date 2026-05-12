import { findNamedResourceById, findNamedResourceByName } from '@named-resource/db';
import { checkOwner } from '@shared/services';
import {
  OTHER_ACCOUNT_NAME,
  OTHER_CATEGORY_NAME,
  OTHER_PAYMENT_METHOD_NAME,
} from '@utils/consts';
import { CategoryNotFoundError, SystemCategoryNotAllowed } from '@utils/errors';

export type OptionalObjectId = string | null | undefined;

const findRequiredSystemResource = async (
  kind: 'category' | 'paymentMethod' | 'account',
  systemName: string,
) => {
  const resource = await findNamedResourceByName(kind, systemName);
  if (!resource && kind === 'category') throw new CategoryNotFoundError(undefined, systemName);
  if (!resource) throw new Error(`Missing required system ${kind}: '${systemName}'`);
  return resource;
};

export const resolveCategoryId = async (
  categoryId: OptionalObjectId,
  ownerId: string,
) => {
  const category = categoryId
    ? await findNamedResourceById('category', categoryId)
    : await findRequiredSystemResource('category', OTHER_CATEGORY_NAME);

  if (category.type === 'system' && category.name !== OTHER_CATEGORY_NAME)
    throw new SystemCategoryNotAllowed(category.id);
  if (category.type !== 'system') checkOwner(ownerId, category.id, category.ownerId!, 'category');
  return category.id;
};

export const resolvePaymentMethodId = async (
  paymentMethodId: OptionalObjectId,
  ownerId: string,
) => {
  const paymentMethod = paymentMethodId
    ? await findNamedResourceById('paymentMethod', paymentMethodId)
    : await findRequiredSystemResource('paymentMethod', OTHER_PAYMENT_METHOD_NAME);
  if (paymentMethod.type !== 'system')
    checkOwner(ownerId, paymentMethod.id, paymentMethod.ownerId!, 'paymentMethod');
  return paymentMethod.id;
};

export const resolveAccountId = async (
  accountId: OptionalObjectId,
  ownerId: string,
) => {
  const account = accountId
    ? await findNamedResourceById('account', accountId)
    : await findRequiredSystemResource('account', OTHER_ACCOUNT_NAME);
  if (account.type !== 'system')
    checkOwner(ownerId, account.id, account.ownerId!, 'account');
  return account.id;
};
