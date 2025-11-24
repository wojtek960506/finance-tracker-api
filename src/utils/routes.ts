import { AuthenticatedRequest, ParamsJustId } from "@routes/types";
import { TransactionPatchDTO, TransactionUpdateDTO } from "@schemas/transaction";
import { FastifyRequest } from "fastify";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { checkOwner, findTransaction } from "@routes/utils-routes";

export const updateTransactionHelper = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body: TransactionUpdateDTO | TransactionPatchDTO
  }>
) => {
  const { id } = req.params;
  const transaction = await findTransaction(id);

  checkOwner((req as AuthenticatedRequest).userId, transaction, "update");

  Object.assign(transaction, req.body);
  await transaction.save();

  return serializeTransaction(transaction);
}
