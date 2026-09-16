import { InvestmentOperationModel } from '@investment/model';

import {
  InvestmentOperationNotFoundError,
  SnapshotOperationOnlyError,
} from '@utils/errors';

export const deleteSnapshotOperation = async (
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

  if (operation.kind !== 'snapshot') {
    throw new SnapshotOperationOnlyError('delete');
  }

  await InvestmentOperationModel.deleteOne({ _id: id, ownerId });

  return { id };
};
