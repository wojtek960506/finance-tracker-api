import { VehicleEquipmentModel } from '@vehicles/model';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleEquipmentNotFoundError } from '@utils/errors';

export const deleteEquipment = async (
  ownerId: string,
  vehicleIdentifier: string,
  equipmentId: string,
): Promise<void> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const equipment = await VehicleEquipmentModel.findOne({
    _id: equipmentId,
    ownerId,
    vehicleId: vehicle._id,
  });

  if (!equipment) {
    throw new VehicleEquipmentNotFoundError(equipmentId);
  }

  await equipment.deleteOne();
};
