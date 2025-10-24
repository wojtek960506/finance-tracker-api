import { Transaction } from "@models/Transaction";
import { ParamsJustId } from "@routes/types";
import { TransactionPatchDTO, TransactionUpdateDTO } from "@schemas/transaction";
import { FastifyReply, FastifyRequest } from "fastify";

export const updateTransactionHelper = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body: TransactionUpdateDTO | TransactionPatchDTO
  }>,
  res: FastifyReply,
  isFullUpdate: boolean
) => {
  const { id } = req.params;

  const updateBody = isFullUpdate ? req.body : { $set: req.body};

  // `new: true` - return the updated document
  const updated = await Transaction.findByIdAndUpdate(id, updateBody, { new: true });
  if (!updated)
    return res.code(404).send({ message: `Transaction with ID '${id}' not found` });
  return res.send({ message: `Transaction with ID '${id}' updated`, data: updated });
}