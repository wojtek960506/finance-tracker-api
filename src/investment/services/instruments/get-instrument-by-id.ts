import { InvestmentInstrumentResponseDTO } from '@investment/schema';
import { serializeInstrument } from '@investment/serializers';

import { findInstrumentById } from './find-instrument-by-id';

export const getInstrumentById = async (
  ownerId: string,
  id: string,
): Promise<InvestmentInstrumentResponseDTO> => {
  const instrument = await findInstrumentById(ownerId, id);
  return serializeInstrument(instrument);
};
