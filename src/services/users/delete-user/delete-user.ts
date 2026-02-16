import { ClientSession } from "mongoose";
import { UserModel } from "@models/user-model";
import { UserResponseDTO } from "@schemas/user";
import { withSession } from "@utils/with-session";
import { serializeUser } from "@schemas/serializers";
import { CategoryModel } from "@models/category-model";
import { TransactionModel } from "@models/transaction-model";
import {
  UserNotFoundError,
  UserNotDeletedError,
  UserNotAuthorizedToDeleteError,
} from "@utils/errors/user-errors";


const deleteUserCore = async (
  session: ClientSession,
  id: string,
): Promise<UserResponseDTO> => {

  const user = await UserModel.findById(id);
  if (!user) throw new UserNotFoundError(id);

  // delete all transactions of the user
  const {
    deletedCount: deletedTransactionsCount
  } = await TransactionModel.deleteMany({ ownerId: id }, { session });
  // delete all categories of the user
  const {
    deletedCount: deletedCategoriesCount
  } = await CategoryModel.deleteMany({ ownerId: id }, { session });

  const { deletedCount } = await UserModel.deleteOne({ _id: id }, { session });
  if (deletedCount !== 1) throw new UserNotDeletedError(id);

  console.log('------------------------------------------------');
  console.log('Deleted user with id:', id);
  console.log('Deleted transactions count:', deletedTransactionsCount);
  console.log('Deleted categories count:', deletedCategoriesCount);
  console.log('------------------------------------------------');

  return serializeUser(user);
}

export const deleteUser = async (
  id: string,
  authenticatedId: string
): Promise<UserResponseDTO> => {

  const authenticatedUser = await UserModel.findById(authenticatedId);
  if (!authenticatedUser) throw new UserNotFoundError(authenticatedId);
  // for now for testing purposes user with email `test1@test.com` can delete any user
  if (id !== authenticatedId && authenticatedUser.email !== "test1@test.com")
    throw new UserNotAuthorizedToDeleteError(id, authenticatedId);

  return withSession(deleteUserCore, id);
}
