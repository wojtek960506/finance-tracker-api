import { AppError } from "@utils/errors";
import { UserModel } from "@models/user-model";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";


export const deleteAllTransactionsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const user = await UserModel.findById(ownerId);
  if (user?.email !== "test1@test.com")
    throw new AppError(403, "Only one particular test user can delete its transactions");

  return res.code(200).send(await TransactionModel.deleteMany({ ownerId }));
}
