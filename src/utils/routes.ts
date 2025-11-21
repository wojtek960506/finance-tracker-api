import { TransactionModel } from "@models/transaction-model";
import { ParamsJustId } from "@routes/types";
import { TransactionPatchDTO, TransactionResponseDTO, TransactionUpdateDTO } from "@schemas/transaction";
import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "./errors";
import { serializeTransaction } from "@schemas/serialize-transaction";

export const updateTransactionHelper = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body: TransactionUpdateDTO | TransactionPatchDTO
  }>,
  res: FastifyReply<{ Reply: TransactionResponseDTO }>,
  isFullUpdate: boolean
) => {
  const { id } = req.params;
  const updated = await getUpdatedTransaction(id, req.body, isFullUpdate)
  if (!updated)
    throw new NotFoundError(`Transaction with ID '${id}' not found`);

  return res.send(serializeTransaction(updated));
}

export const getUpdatedTransaction = async <T extends boolean>(
  id: string,
  body: T extends true ? TransactionUpdateDTO : TransactionPatchDTO,
  isFullUpdate: T
) => {

  const updateBody = isFullUpdate ? body : { $set: body };

  // `new: true` - return the updated document
  return await TransactionModel.findByIdAndUpdate(id, updateBody, { new: true });
}