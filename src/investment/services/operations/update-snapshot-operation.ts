import { InvestmentOperationModel } from '@investment/model';
import {
  InvestmentOperationResponseDTO,
  InvestmentOperationUpdateDTO,
} from '@investment/schema';
import { serializeOperation } from '@investment/serializers';
import { findInstrumentById } from '@investment/services/instruments';
import { Types } from 'mongoose';

import {
  CannotEditLinkedTransactionOperationError,
  InvestmentOperationNotFoundError,
} from '@utils/errors';

export const updateSnapshotOperation = async (
  ownerId: string,
  id: string,
  dto: InvestmentOperationUpdateDTO,
): Promise<InvestmentOperationResponseDTO> => {
  const operation = await InvestmentOperationModel.findOne({
    _id: id,
    ownerId,
    deletion: null,
  });

  if (!operation) {
    throw new InvestmentOperationNotFoundError(id);
  }

  if (operation.kind !== 'snapshot' || operation.transactionId != null) {
    throw new CannotEditLinkedTransactionOperationError();
  }

  if (dto.instrumentId !== undefined) {
    await findInstrumentById(ownerId, dto.instrumentId);
    operation.instrumentId = new Types.ObjectId(dto.instrumentId) as any;
  }

  if (dto.amount !== undefined) {
    operation.amount = dto.amount;
  }

  if (dto.currency !== undefined) {
    operation.currency = dto.currency.toUpperCase();
  }

  if (dto.date !== undefined) {
    operation.date = dto.date;
  }

  if (dto.note !== undefined) {
    operation.note = dto.note;
  } else if (dto.notes !== undefined) {
    operation.note = dto.notes;
  }

  await operation.save();

  return serializeOperation(operation);
};
