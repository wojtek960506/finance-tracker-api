import { InvestmentOperationModel } from '@investment/model';
import { InvestmentInstrumentSummaryDTO } from '@investment/schema';

import { calculateInstrumentSummary } from '../summary/calculate-instrument-summary';

import { findInstrumentById } from './find-instrument-by-id';

export const getInstrumentById = async (
  ownerId: string,
  id: string,
): Promise<InvestmentInstrumentSummaryDTO> => {
  const instrument = await findInstrumentById(ownerId, id);
  const operations = await InvestmentOperationModel.find({
    ownerId,
    instrumentId: instrument._id,
  }).sort({ date: 1, createdAt: 1 });

  return calculateInstrumentSummary(instrument, operations);
};
