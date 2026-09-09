import { InvestmentInstrumentModel } from '@investment/model';
import { ClientSession } from 'mongoose';

import { TransactionInvestmentNewInstrumentDTO } from '@transaction/schema';

export const findOrCreateInstrument = async (
  ownerId: string,
  newInstrument: TransactionInvestmentNewInstrumentDTO,
  fallbackCurrency: string,
  session?: ClientSession,
): Promise<string> => {
  const nameTrimmed = newInstrument.name.trim();
  const nameNormalized = nameTrimmed.toLowerCase();

  const existing = session
    ? await InvestmentInstrumentModel.findOne({ ownerId, nameNormalized }, null, {
        session,
      })
    : await InvestmentInstrumentModel.findOne({ ownerId, nameNormalized });
  if (existing) {
    return existing._id.toString();
  }

  const currency = (newInstrument.currency ?? fallbackCurrency).toUpperCase();

  const [created] = await InvestmentInstrumentModel.create(
    [
      {
        ownerId,
        name: nameTrimmed,
        nameNormalized,
        kind: newInstrument.kind,
        currency,
        notes: newInstrument.notes,
      },
    ],
    session ? { session } : {},
  );

  return created._id.toString();
};
