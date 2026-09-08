import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';

import { InvestmentInstrumentDependencyError } from '@utils/errors';

import { findInstrumentById } from './find-instrument-by-id';

export const deleteInstrument = async (
  ownerId: string,
  id: string,
): Promise<{ id: string }> => {
  await findInstrumentById(ownerId, id);

  const operationsCount = await InvestmentOperationModel.countDocuments({
    instrumentId: id,
    ownerId,
  });

  if (operationsCount > 0) {
    throw new InvestmentInstrumentDependencyError(id);
  }

  await InvestmentInstrumentModel.deleteOne({ _id: id, ownerId });

  return { id };
};
