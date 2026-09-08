import { IInvestmentInstrument, InvestmentInstrumentModel } from '@investment/model';
import { InvestmentInstrumentListResponseDTO } from '@investment/schema';
import { serializeInstrument } from '@investment/serializers';
import { InvestmentInstrumentKind } from '@investment/types';
import { FilterQuery } from 'mongoose';

export interface GetInstrumentsFilter {
  kind?: InvestmentInstrumentKind;
  currency?: string;
}

export const getInstruments = async (
  ownerId: string,
  filter: GetInstrumentsFilter = {},
): Promise<InvestmentInstrumentListResponseDTO> => {
  const query: FilterQuery<IInvestmentInstrument> = { ownerId };

  if (filter.kind) {
    query.kind = filter.kind;
  }

  if (filter.currency) {
    query.currency = filter.currency.toUpperCase();
  }

  const instruments = await InvestmentInstrumentModel.find(query).sort({
    name: 1,
  });

  return instruments.map(serializeInstrument);
};
