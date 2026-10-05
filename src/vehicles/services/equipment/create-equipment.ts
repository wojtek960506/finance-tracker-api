import { VehicleEquipmentModel } from '@vehicles/model';
import { VehicleEquipmentCreateDTO, VehicleEquipmentResponseDTO } from '@vehicles/schema';
import { serializeEquipment } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

export const createEquipment = async (
  ownerId: string,
  vehicleIdentifier: string,
  dto: VehicleEquipmentCreateDTO,
): Promise<VehicleEquipmentResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const equipment = await VehicleEquipmentModel.create({
    ...dto,
    ownerId,
    vehicleId: vehicle._id,
  });

  return serializeEquipment(equipment);
};
