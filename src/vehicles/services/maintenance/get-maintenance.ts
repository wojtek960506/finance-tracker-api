import { IVehicleMaintenance, VehicleMaintenanceModel } from '@vehicles/model';
import {
  VehicleMaintenanceFilterQuery,
  VehicleMaintenanceResponseDTO,
  VehicleMaintenanceSummaryDTO,
  VehicleMaintenanceWithSummaryResponseDTO,
} from '@vehicles/schema';
import { serializeMaintenance } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { FilterQuery, Types } from 'mongoose';

import { VehicleMaintenanceNotFoundError } from '@utils/errors';

export const getMaintenanceList = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: VehicleMaintenanceFilterQuery = {
    page: 1,
    limit: 20,
  },
): Promise<VehicleMaintenanceWithSummaryResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);
  const ownerObjectId = new Types.ObjectId(ownerId);
  const vehicleObjectId = new Types.ObjectId(vehicle._id);

  const filter: FilterQuery<IVehicleMaintenance> = {
    ownerId: ownerObjectId,
    vehicleId: vehicleObjectId,
  };

  if (query.section) {
    filter.section = query.section;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }

  const isPreviousOwnerOnly = query.section === 'previousOwnerServices';

  const [items, summaryAgg] = await Promise.all([
    VehicleMaintenanceModel.find(filter)
      .sort({ date: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    isPreviousOwnerOnly
      ? Promise.resolve([])
      : VehicleMaintenanceModel.aggregate<{ totalCostPln: number; totalRecords: number }>(
          [
            {
              $match: {
                ownerId: ownerObjectId,
                vehicleId: vehicleObjectId,
                section: 'ownMaintenance',
                ...(filter.date ? { date: filter.date } : {}),
              },
            },
            {
              $group: {
                _id: null,
                totalCostPln: { $sum: '$costPln' },
                totalRecords: { $sum: 1 },
              },
            },
          ],
        ),
  ]);

  const summary: VehicleMaintenanceSummaryDTO = {
    totalCostPln:
      summaryAgg.length > 0
        ? Math.round((summaryAgg[0].totalCostPln + Number.EPSILON) * 100) / 100
        : 0,
    totalRecords: summaryAgg.length > 0 ? summaryAgg[0].totalRecords : 0,
  };

  return {
    items: items.map(serializeMaintenance),
    summary,
  };
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
