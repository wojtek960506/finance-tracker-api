import { IInvestmentInstrument, InvestmentInstrumentModel } from '@investment/model';
import { ClientSession } from 'mongoose';

import { InvestmentInstrumentNotFoundError } from '@utils/errors';

export const findInstrumentById = async (
  ownerId: string,
  id: string,
  session?: ClientSession,
): Promise<IInvestmentInstrument> => {
  const instrument = session
    ? await InvestmentInstrumentModel.findOne({ _id: id, ownerId }, null, { session })
    : await InvestmentInstrumentModel.findOne({ _id: id, ownerId });

  if (!instrument) {
    throw new InvestmentInstrumentNotFoundError(id);
  }

  return instrument;
};
