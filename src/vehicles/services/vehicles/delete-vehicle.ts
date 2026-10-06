import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
} from '@vehicles/model';

import { VehicleDependencyError } from '@utils/errors';

import { findVehicleByIdOrSlug } from './find-vehicle-by-id-or-slug';

export const deleteVehicle = async (
  ownerId: string,
  identifier: string,
): Promise<void> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, identifier);

  const [fuelCount, equipmentCount, maintenanceCount] = await Promise.all([
    VehicleFuelEntryModel.countDocuments({ ownerId, vehicleId: vehicle._id }),
    VehicleEquipmentModel.countDocuments({ ownerId, vehicleId: vehicle._id }),
    VehicleMaintenanceModel.countDocuments({ ownerId, vehicleId: vehicle._id }),
  ]);

  if (fuelCount + equipmentCount + maintenanceCount > 0) {
    throw new VehicleDependencyError(vehicle._id.toString());
  }

  await vehicle.deleteOne();
};
