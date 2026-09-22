import { InvestmentOperationModel } from '@investment/model';

import {
  CannotEditLinkedTransactionOperationError,
  InvestmentOperationNotFoundError,
} from '@utils/errors';

export const deleteOperation = async (
  ownerId: string,
  id: string,
): Promise<{ id: string }> => {
  const operation = await InvestmentOperationModel.findOne({
    _id: id,
    ownerId,
  });

  if (!operation) {
    throw new InvestmentOperationNotFoundError(id);
  }

  if (operation.transactionId != null) {
    throw new CannotEditLinkedTransactionOperationError();
  }

  await InvestmentOperationModel.deleteOne({ _id: id, ownerId });

  return { id };
};
