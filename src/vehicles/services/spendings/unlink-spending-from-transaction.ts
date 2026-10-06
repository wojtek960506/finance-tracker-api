import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
} from '@vehicles/model';
import { SpendingLinkResponseDTO, SpendingTypeDTO } from '@vehicles/schema';

import { VehicleSpendingNotFoundError } from '@utils/errors';

export const unlinkSpendingFromTransaction = async (
  ownerId: string,
  spendingType: SpendingTypeDTO,
  spendingId: string,
): Promise<SpendingLinkResponseDTO> => {
  let doc: { save: () => Promise<unknown>; transactionId?: unknown } | null = null;

  if (spendingType === 'fuel') {
    doc = await VehicleFuelEntryModel.findOne({ _id: spendingId, ownerId });
  } else if (spendingType === 'equipment') {
    doc = await VehicleEquipmentModel.findOne({ _id: spendingId, ownerId });
  } else if (spendingType === 'maintenance') {
    doc = await VehicleMaintenanceModel.findOne({ _id: spendingId, ownerId });
  }

  if (!doc) {
    throw new VehicleSpendingNotFoundError(spendingType, spendingId);
  }

  doc.transactionId = null;
  await doc.save();

  return {
    acknowledged: true,
    modifiedCount: 1,
  };
};
