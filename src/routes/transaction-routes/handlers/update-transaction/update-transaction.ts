import { FastifyRequest } from "fastify";
import { checkOwner, findTransaction } from "@routes/routes-utils";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";
import { TransactionPatchDTO, TransactionUpdateDTO } from "@schemas/transaction";


export const updateTransactionHandler = async (
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