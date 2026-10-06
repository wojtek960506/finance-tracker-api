import { IVehicleMaintenance, VehicleMaintenanceModel } from '@vehicles/model';
import {
  VehicleMaintenanceFilterQuery,
  VehicleMaintenanceResponseDTO,
} from '@vehicles/schema';
import { serializeMaintenance } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { FilterQuery } from 'mongoose';

import { VehicleMaintenanceNotFoundError } from '@utils/errors';

export const getMaintenanceList = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: VehicleMaintenanceFilterQuery = {
    page: 1,
    limit: 20,
  },
): Promise<VehicleMaintenanceResponseDTO[]> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const filter: FilterQuery<IVehicleMaintenance> = {
    ownerId,
    vehicleId: vehicle._id,
  };

  if (query.section) {
    filter.section = query.section;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }

  const items = await VehicleMaintenanceModel.find(filter)
    .sort({ date: -1, _id: -1 })
    .skip((query.page - 1) * query.limit)
    .limit(query.limit);

  return items.map(serializeMaintenance);
};

export const getMaintenance = async (
  ownerId: string,
  vehicleIdentifier: string,
  maintenanceId: string,
): Promise<VehicleMaintenanceResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const maintenance = await VehicleMaintenanceModel.findOne({
    _id: maintenanceId,
    ownerId,
    vehicleId: vehicle._id,
  });

  if (!maintenance) {
    throw new VehicleMaintenanceNotFoundError(maintenanceId);
  }

  return serializeMaintenance(maintenance);
};
