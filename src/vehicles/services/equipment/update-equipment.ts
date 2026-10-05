import { VehicleEquipmentModel } from '@vehicles/model';
import { VehicleEquipmentResponseDTO, VehicleEquipmentUpdateDTO } from '@vehicles/schema';
import { serializeEquipment } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleEquipmentNotFoundError } from '@utils/errors';

export const updateEquipment = async (
  ownerId: string,
  vehicleIdentifier: string,
  equipmentId: string,
  dto: VehicleEquipmentUpdateDTO,
): Promise<VehicleEquipmentResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const equipment = await VehicleEquipmentModel.findOne({
    _id: equipmentId,
    ownerId,
    vehicleId: vehicle._id,
  });

  if (!equipment) {
    throw new VehicleEquipmentNotFoundError(equipmentId);
  }

  Object.assign(equipment, dto);
  await equipment.save();

  return serializeEquipment(equipment);
};
