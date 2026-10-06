import { IVehicleEquipment, VehicleEquipmentModel } from '@vehicles/model';
import {
  VehicleEquipmentFilterQuery,
  VehicleEquipmentResponseDTO,
} from '@vehicles/schema';
import { serializeEquipment } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { FilterQuery } from 'mongoose';

import { VehicleEquipmentNotFoundError } from '@utils/errors';

export const getEquipmentList = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: VehicleEquipmentFilterQuery = {
    page: 1,
    limit: 20,
  },
): Promise<VehicleEquipmentResponseDTO[]> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const filter: FilterQuery<IVehicleEquipment> = {
    ownerId,
    vehicleId: vehicle._id,
  };

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }

  const items = await VehicleEquipmentModel.find(filter)
    .sort({ date: -1, _id: -1 })
    .skip((query.page - 1) * query.limit)
    .limit(query.limit);

  return items.map(serializeEquipment);
};

export const getEquipment = async (
  ownerId: string,
  vehicleIdentifier: string,
  equipmentId: string,
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

  return serializeEquipment(equipment);
};
