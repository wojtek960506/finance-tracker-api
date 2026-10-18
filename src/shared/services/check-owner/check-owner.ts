import { Types } from 'mongoose';

import {
  SportCategoryOwnershipError,
  SportEntryOwnershipError,
  TransactionOwnershipError,
} from '@utils/errors';
import { AccountOwnershipError } from '@utils/errors/account-errors';
import { CategoryOwnershipError } from '@utils/errors/category-errors';
import { PaymentMethodOwnershipError } from '@utils/errors/payment-method-errors';

export type CheckOwnerType =
  | 'transaction'
  | 'category'
  | 'paymentMethod'
  | 'account'
  | 'sportCategory'
  | 'sportEntry';

export const checkOwner = (
  userId: string | Types.ObjectId,
  objectId: string | Types.ObjectId,
  ownerId: string | Types.ObjectId,
  objectType: CheckOwnerType,
) => {
  userId = userId.toString();
  objectId = objectId.toString();
  ownerId = ownerId.toString();

  if (userId !== ownerId)
    switch (objectType) {
      case 'transaction':
        throw new TransactionOwnershipError(userId, objectId, ownerId);
      case 'category':
        throw new CategoryOwnershipError(userId, objectId, ownerId);
      case 'paymentMethod':
        throw new PaymentMethodOwnershipError(userId, objectId, ownerId);
      case 'account':
        throw new AccountOwnershipError(userId, objectId, ownerId);
      case 'sportCategory':
        throw new SportCategoryOwnershipError(userId, objectId, ownerId);
      case 'sportEntry':
        throw new SportEntryOwnershipError(userId, objectId, ownerId);
    }
};
