import { ClientSession } from 'mongoose';

import { CategoryModel } from '@category/model';
import { PaymentMethodModel } from '@payment-method/model';
import { TransactionModel } from '@transaction/model';
import { UserModel } from '@user/model';
import { UserResponseDTO } from '@user/schema';
import { serializeUser } from '@user/serializers';
import {
  UserNotAuthorizedToDeleteError,
  UserNotDeletedError,
  UserNotFoundError,
} from '@utils/errors/user-errors';
import { withSession } from '@utils/with-session';

const deleteUserCore = async (
  session: ClientSession,
  id: string,
): Promise<UserResponseDTO> => {
  const user = await UserModel.findById(id);
  if (!user) throw new UserNotFoundError(id);

  // delete all transactions of the user
  const { deletedCount: deletedTransactionsCount } = await TransactionModel.deleteMany(
    { ownerId: id },
    { session },
  );
  // delete all categories of the user
  const { deletedCount: deletedCategoriesCount } = await CategoryModel.deleteMany(
    { ownerId: id },
    { session },
  );
  // delete all payment methods of the user
  const { deletedCount: deletedPaymentMethodsCount } =
    await PaymentMethodModel.deleteMany({ ownerId: id }, { session });

  const { deletedCount } = await UserModel.deleteOne({ _id: id }, { session });
  if (deletedCount !== 1) throw new UserNotDeletedError(id);

  console.log('------------------------------------------------');
  console.log('Deleted user with id:', id);
  console.log('Deleted transactions count:', deletedTransactionsCount);
  console.log('Deleted categories count:', deletedCategoriesCount);
  console.log('Deleted payment methods count:', deletedPaymentMethodsCount);
  console.log('------------------------------------------------');

  return serializeUser(user);
};

export const deleteUser = async (
  id: string,
  authenticatedId: string,
): Promise<UserResponseDTO> => {
  const authenticatedUser = await UserModel.findById(authenticatedId);
  if (!authenticatedUser) throw new UserNotFoundError(authenticatedId);
  // for now for testing purposes user with email `test1@test.com` can delete any user
  if (id !== authenticatedId && authenticatedUser.email !== 'test1@test.com')
    throw new UserNotAuthorizedToDeleteError(id, authenticatedId);

  return withSession(deleteUserCore, id);
};
