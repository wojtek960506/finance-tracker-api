import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
} from '@vehicles/model';
import { LinkSpendingsToTransactionDTO, SpendingLinkResponseDTO } from '@vehicles/schema';

import { TransactionModel } from '@transaction/model';
import { TransactionNotFoundError, VehicleSpendingNotFoundError } from '@utils/errors';

export const linkSpendingsToTransaction = async (
  ownerId: string,
  dto: LinkSpendingsToTransactionDTO,
): Promise<SpendingLinkResponseDTO> => {
  const transaction = await TransactionModel.findOne({
    _id: dto.transactionId,
    ownerId,
  });

  if (!transaction) {
    throw new TransactionNotFoundError(dto.transactionId);
  }

  // 1. Verify existence and ownership of all spending entries before modifying
  const updateActions: (() => Promise<unknown>)[] = [];

  for (const item of dto.spendings) {
    if (item.spendingType === 'fuel') {
      const entry = await VehicleFuelEntryModel.findOne({
        _id: item.spendingId,
        ownerId,
      });
      if (!entry) {
        throw new VehicleSpendingNotFoundError(item.spendingType, item.spendingId);
      }
      updateActions.push(() =>
        VehicleFuelEntryModel.updateOne(
          { _id: item.spendingId, ownerId },
          { $set: { transactionId: dto.transactionId } },
        ),
      );
    } else if (item.spendingType === 'equipment') {
      const entry = await VehicleEquipmentModel.findOne({
        _id: item.spendingId,
        ownerId,
      });
      if (!entry) {
        throw new VehicleSpendingNotFoundError(item.spendingType, item.spendingId);
      }
      updateActions.push(() =>
        VehicleEquipmentModel.updateOne(
          { _id: item.spendingId, ownerId },
          { $set: { transactionId: dto.transactionId } },
        ),
      );
    } else if (item.spendingType === 'maintenance') {
      const entry = await VehicleMaintenanceModel.findOne({
        _id: item.spendingId,
        ownerId,
      });
      if (!entry) {
        throw new VehicleSpendingNotFoundError(item.spendingType, item.spendingId);
      }
      updateActions.push(() =>
        VehicleMaintenanceModel.updateOne(
          { _id: item.spendingId, ownerId },
          { $set: { transactionId: dto.transactionId } },
        ),
      );
    }
  }

  // 2. Execute all updates
  await Promise.all(updateActions.map((action) => action()));

  return {
    acknowledged: true,
    modifiedCount: updateActions.length,
  };
};
