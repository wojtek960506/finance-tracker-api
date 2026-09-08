import { IInvestmentInstrument, InvestmentInstrumentModel } from '@investment/model';

import { InvestmentInstrumentNotFoundError } from '@utils/errors';

export const findInstrumentById = async (
  ownerId: string,
  id: string,
): Promise<IInvestmentInstrument> => {
  const instrument = await InvestmentInstrumentModel.findOne({
    _id: id,
    ownerId,
  });

  if (!instrument) {
    throw new InvestmentInstrumentNotFoundError(id);
  }

  return instrument;
};
