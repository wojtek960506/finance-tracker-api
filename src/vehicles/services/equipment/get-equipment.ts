import { DEFAULT_VEHICLES_LIMIT } from '@vehicles/consts';
import { IVehicleEquipment, VehicleEquipmentModel } from '@vehicles/model';
import {
  VehicleEquipmentFilterQuery,
  VehicleEquipmentResponseDTO,
  VehicleEquipmentSummaryDTO,
  VehicleEquipmentWithSummaryResponseDTO,
} from '@vehicles/schema';
import { serializeEquipment } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { decodeCursor, encodeCursor } from '@vehicles/utils/cursor';
import { FilterQuery, Types } from 'mongoose';

import { VehicleEquipmentNotFoundError } from '@utils/errors';

export const getEquipmentList = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: Partial<VehicleEquipmentFilterQuery> = {},
): Promise<VehicleEquipmentWithSummaryResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);
  const ownerObjectId = new Types.ObjectId(ownerId);
  const vehicleObjectId = new Types.ObjectId(vehicle._id);

  const baseFilter: FilterQuery<IVehicleEquipment> = {
    ownerId: ownerObjectId,
    vehicleId: vehicleObjectId,
  };

  if (query.startDate || query.endDate) {
    baseFilter.date = {};
    if (query.startDate) baseFilter.date.$gte = query.startDate;
    if (query.endDate) baseFilter.date.$lte = query.endDate;
  }

  const queryFilter: FilterQuery<IVehicleEquipment> = { ...baseFilter };

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

  const limit = query.limit ?? DEFAULT_VEHICLES_LIMIT;

  const [rawItems, summaryAgg] = await Promise.all([
    VehicleEquipmentModel.find(queryFilter)
      .sort({ date: -1, _id: -1 })
      .limit(limit + 1),
    VehicleEquipmentModel.aggregate<{ totalCostPln: number; totalItems: number }>([
      {
        $match: {
          ownerId: ownerObjectId,
          vehicleId: vehicleObjectId,
          ...(baseFilter.date ? { date: baseFilter.date } : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalCostPln: { $sum: '$costPln' },
          totalItems: { $sum: 1 },
        },
      },
    ]),
  ]);

  const hasMore = rawItems.length > limit;
  const items = hasMore ? rawItems.slice(0, limit) : rawItems;
  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.date, lastItem._id.toString()) : null;

  const summary: VehicleEquipmentSummaryDTO = {
    totalCostPln:
      summaryAgg.length > 0
        ? Math.round((summaryAgg[0].totalCostPln + Number.EPSILON) * 100) / 100
        : 0,
    totalItems: summaryAgg.length > 0 ? summaryAgg[0].totalItems : 0,
  };

  return {
    items: items.map(serializeEquipment),
    summary,
    pagination: {
      nextCursor,
      hasMore,
      total: summary.totalItems,
    },
  };
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
