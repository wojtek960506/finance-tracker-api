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
  OperationKindNotAllowedForInstrumentError,
  SnapshotNotAllowedForInstrumentError,
} from '@utils/errors';

export const updateOperation = async (
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

  if (operation.transactionId != null) {
    throw new CannotEditLinkedTransactionOperationError();
  }

  if (dto.instrumentId !== undefined) {
    const targetInstrument = await findInstrumentById(ownerId, dto.instrumentId);

    if (
      operation.kind === 'snapshot' &&
      (targetInstrument.kind === 'termDeposit' || targetInstrument.kind === 'savings')
    ) {
      throw new SnapshotNotAllowedForInstrumentError(targetInstrument.kind);
    }

    if (
      (operation.kind === 'interest' || operation.kind === 'fee') &&
      (targetInstrument.kind === 'share' || targetInstrument.kind === 'fund')
    ) {
      throw new OperationKindNotAllowedForInstrumentError(
        operation.kind,
        targetInstrument.kind,
      );
    }

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
