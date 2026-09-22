import { InvestmentOperationModel } from '@investment/model';
import {
  InvestmentOperationCreateDTO,
  InvestmentOperationResponseDTO,
} from '@investment/schema';
import { serializeOperation } from '@investment/serializers';
import { findInstrumentById } from '@investment/services/instruments';

import {
  OperationKindNotAllowedForInstrumentError,
  SnapshotNotAllowedForInstrumentError,
} from '@utils/errors';

export const createOperation = async (
  ownerId: string,
  dto: InvestmentOperationCreateDTO,
): Promise<InvestmentOperationResponseDTO> => {
  const instrument = await findInstrumentById(ownerId, dto.instrumentId);
  const operationKind = dto.kind ?? 'snapshot';

  if (
    operationKind === 'snapshot' &&
    (instrument.kind === 'termDeposit' || instrument.kind === 'savings')
  ) {
    throw new SnapshotNotAllowedForInstrumentError(instrument.kind);
  }

  if (
    (operationKind === 'interest' || operationKind === 'fee') &&
    (instrument.kind === 'share' || instrument.kind === 'fund')
  ) {
    throw new OperationKindNotAllowedForInstrumentError(operationKind, instrument.kind);
  }

  const operation = await InvestmentOperationModel.create({
    ownerId,
    instrumentId: dto.instrumentId,
    transactionId: null,
    kind: operationKind,
    amount: dto.amount,
    currency: dto.currency.toUpperCase(),
    date: dto.date,
    note: dto.note,
  });

  return serializeOperation(operation);
};
