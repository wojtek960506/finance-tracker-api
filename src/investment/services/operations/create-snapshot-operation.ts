import { InvestmentOperationModel } from '@investment/model';
import {
  InvestmentOperationResponseDTO,
  InvestmentSnapshotOperationDTO,
} from '@investment/schema';
import { serializeOperation } from '@investment/serializers';
import { findInstrumentById } from '@investment/services/instruments';

export const createSnapshotOperation = async (
  ownerId: string,
  dto: InvestmentSnapshotOperationDTO,
): Promise<InvestmentOperationResponseDTO> => {
  await findInstrumentById(ownerId, dto.instrumentId);

  const operation = await InvestmentOperationModel.create({
    ownerId,
    instrumentId: dto.instrumentId,
    transactionId: null,
    kind: 'snapshot',
    amount: dto.amount,
    currency: dto.currency.toUpperCase(),
    date: dto.date,
    note: dto.note,
  });

  return serializeOperation(operation);
};
