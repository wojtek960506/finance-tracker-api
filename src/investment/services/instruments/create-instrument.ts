import { InvestmentInstrumentModel } from '@investment/model';
import {
  InvestmentInstrumentDTO,
  InvestmentInstrumentResponseDTO,
} from '@investment/schema';
import { serializeInstrument } from '@investment/serializers';

import { InvestmentInstrumentAlreadyExistsError } from '@utils/errors';

export const createInstrument = async (
  ownerId: string,
  dto: InvestmentInstrumentDTO,
): Promise<InvestmentInstrumentResponseDTO> => {
  const nameTrimmed = dto.name.trim();
  const nameNormalized = nameTrimmed.toLowerCase();

  const existing = await InvestmentInstrumentModel.findOne({
    ownerId,
    nameNormalized,
  });

  if (existing) {
    throw new InvestmentInstrumentAlreadyExistsError(dto.name);
  }

  const instrument = await InvestmentInstrumentModel.create({
    ownerId,
    name: nameTrimmed,
    nameNormalized,
    kind: dto.kind,
    currency: dto.currency.toUpperCase(),
    notes: dto.notes,
  });

  return serializeInstrument(instrument);
};
