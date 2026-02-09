import { AppError } from "@utils/errors";
import { UserModel } from "@models/user-model";
import { removeTransactions } from "@db/transactions";
import { DeleteManyReply } from "@routes/routes-types";


export const deleteTransactions = async (ownerId: string): Promise<DeleteManyReply> => {
  // just for easier testing. I think that in final version other users will not have
  // possibility to delete all of their transactions at once
  const user = await UserModel.findById(ownerId);
  if (user?.email !== "test1@test.com")
    throw new AppError(403, "Only one particular test user can delete its transactions");
  return removeTransactions(ownerId);
}
