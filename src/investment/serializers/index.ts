import { IInvestmentInstrument, IInvestmentOperation } from '@investment/model';
import {
  InvestmentInstrumentResponseDTO,
  InvestmentOperationResponseDTO,
} from '@investment/schema';

import { CurrencyCode } from '@currency/schema';

export const serializeInstrument = (
  instrument: IInvestmentInstrument,
): InvestmentInstrumentResponseDTO => ({
  id: instrument._id.toString(),
  ownerId: instrument.ownerId.toString(),
  name: instrument.name,
  nameNormalized: instrument.nameNormalized,
  kind: instrument.kind,
  currency: instrument.currency as CurrencyCode,
  notes: instrument.notes,
  createdAt: instrument.createdAt,
  updatedAt: instrument.updatedAt,
});

export const serializeOperation = (
  operation: IInvestmentOperation,
): InvestmentOperationResponseDTO => {
  const base = {
    id: operation._id.toString(),
    ownerId: operation.ownerId.toString(),
    instrumentId: operation.instrumentId.toString(),
    amount: operation.amount,
    currency: operation.currency as CurrencyCode,
    date: operation.date,
    note: operation.note,
    createdAt: operation.createdAt,
    updatedAt: operation.updatedAt,
  };

  if (operation.kind === 'snapshot') {
    return {
      ...base,
      kind: 'snapshot',
    };
  }

  return {
    ...base,
    kind: operation.kind,
    transactionId: operation.transactionId ? operation.transactionId.toString() : '',
  };
};
