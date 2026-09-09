import { ClientSession } from 'mongoose';

import { TransactionInvestmentDetailsDTO } from '@transaction/schema';

import { findInstrumentById } from './find-instrument-by-id';
import { findOrCreateInstrument } from './find-or-create-instrument';

export const resolveInstrumentId = async (
  ownerId: string,
  investment: TransactionInvestmentDetailsDTO,
  fallbackCurrency: string,
  session?: ClientSession,
): Promise<string> => {
  if ('instrumentId' in investment && investment.instrumentId) {
    const instrument = await findInstrumentById(
      ownerId,
      investment.instrumentId,
      session,
    );
    return instrument._id.toString();
  }

  return findOrCreateInstrument(
    ownerId,
    (investment as any).newInstrument,
    fallbackCurrency,
    session,
  );
};
