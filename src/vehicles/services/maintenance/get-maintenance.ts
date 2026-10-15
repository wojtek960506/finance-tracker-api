import { DEFAULT_VEHICLES_LIMIT } from '@vehicles/consts';
import { IVehicleMaintenance, VehicleMaintenanceModel } from '@vehicles/model';
import {
  VehicleMaintenanceFilterQuery,
  VehicleMaintenanceResponseDTO,
  VehicleMaintenanceSummaryDTO,
  VehicleMaintenanceWithSummaryResponseDTO,
} from '@vehicles/schema';
import { serializeMaintenance } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { decodeCursor, encodeCursor } from '@vehicles/utils/cursor';
import { FilterQuery, Types } from 'mongoose';

import { VehicleMaintenanceNotFoundError } from '@utils/errors';

export const getMaintenanceList = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: Partial<VehicleMaintenanceFilterQuery> = {},
): Promise<VehicleMaintenanceWithSummaryResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);
  const ownerObjectId = new Types.ObjectId(ownerId);
  const vehicleObjectId = new Types.ObjectId(vehicle._id);
  const section = query.section ?? 'ownMaintenance';

  const baseFilter: FilterQuery<IVehicleMaintenance> = {
    ownerId: ownerObjectId,
    vehicleId: vehicleObjectId,
    section,
  };

  if (query.startDate || query.endDate) {
    baseFilter.date = {};
    if (query.startDate) baseFilter.date.$gte = query.startDate;
    if (query.endDate) baseFilter.date.$lte = query.endDate;
  }

  const queryFilter: FilterQuery<IVehicleMaintenance> = { ...baseFilter };

  if (query.cursor) {
    const decoded = decodeCursor(query.cursor);
    if (decoded) {
      const cursorObjectId = Types.ObjectId.isValid(decoded.id)
        ? new Types.ObjectId(decoded.id)
        : null;
      queryFilter.$or = [
        { date: { $lt: decoded.date } },
        ...(cursorObjectId ? [{ date: decoded.date, _id: { $lt: cursorObjectId } }] : []),
      ];
    }
  }

  const isPreviousOwnerOnly = section === 'previousOwnerServices';
  const limit = query.limit ?? DEFAULT_VEHICLES_LIMIT;

  const [rawItems, totalCount, summaryAgg] = await Promise.all([
    VehicleMaintenanceModel.find(queryFilter)
      .sort({ date: -1, _id: -1 })
      .limit(limit + 1),
    VehicleMaintenanceModel.countDocuments(baseFilter),
    isPreviousOwnerOnly
      ? Promise.resolve([])
      : VehicleMaintenanceModel.aggregate<{ totalCostPln: number; totalRecords: number }>(
          [
            {
              $match: {
                ownerId: ownerObjectId,
                vehicleId: vehicleObjectId,
                section: 'ownMaintenance',
                ...(baseFilter.date ? { date: baseFilter.date } : {}),
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

  const hasMore = rawItems.length > limit;
  const items = hasMore ? rawItems.slice(0, limit) : rawItems;
  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.date, lastItem._id.toString()) : null;

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
    pagination: {
      nextCursor,
      hasMore,
      total: totalCount,
    },
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
