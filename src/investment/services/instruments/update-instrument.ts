import { InvestmentInstrumentModel } from '@investment/model';
import {
  InvestmentInstrumentResponseDTO,
  InvestmentInstrumentUpdateDTO,
} from '@investment/schema';
import { serializeInstrument } from '@investment/serializers';

import { InvestmentInstrumentAlreadyExistsError } from '@utils/errors';

import { findInstrumentById } from './find-instrument-by-id';

export const updateInstrument = async (
  ownerId: string,
  id: string,
  dto: InvestmentInstrumentUpdateDTO,
): Promise<InvestmentInstrumentResponseDTO> => {
  const instrument = await findInstrumentById(ownerId, id);

  if (dto.name !== undefined) {
    const nameTrimmed = dto.name.trim();
    const nameNormalized = nameTrimmed.toLowerCase();

    if (nameNormalized !== instrument.nameNormalized) {
      const existing = await InvestmentInstrumentModel.findOne({
        ownerId,
        nameNormalized,
        _id: { $ne: id },
      });

      if (existing) {
        throw new InvestmentInstrumentAlreadyExistsError(dto.name);
      }

      instrument.name = nameTrimmed;
      instrument.nameNormalized = nameNormalized;
    }
  }

  if (dto.kind !== undefined) {
    instrument.kind = dto.kind;
  }

  if (dto.currency !== undefined) {
    instrument.currency = dto.currency.toUpperCase();
  }

  if (dto.notes !== undefined) {
    instrument.notes = dto.notes;
  }

  await instrument.save();

  return serializeInstrument(instrument);
};
