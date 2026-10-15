import { IVehicleEquipment, VehicleEquipmentModel } from '@vehicles/model';
import {
  VehicleEquipmentFilterQuery,
  VehicleEquipmentResponseDTO,
  VehicleEquipmentSummaryDTO,
  VehicleEquipmentWithSummaryResponseDTO,
} from '@vehicles/schema';
import { serializeEquipment } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { FilterQuery, Types } from 'mongoose';

import { VehicleEquipmentNotFoundError } from '@utils/errors';

export const getEquipmentList = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: VehicleEquipmentFilterQuery = {
    page: 1,
    limit: 20,
  },
): Promise<VehicleEquipmentWithSummaryResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);
  const ownerObjectId = new Types.ObjectId(ownerId);
  const vehicleObjectId = new Types.ObjectId(vehicle._id);

  const filter: FilterQuery<IVehicleEquipment> = {
    ownerId: ownerObjectId,
    vehicleId: vehicleObjectId,
  };

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }

  const [items, summaryAgg] = await Promise.all([
    VehicleEquipmentModel.find(filter)
      .sort({ date: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    VehicleEquipmentModel.aggregate<{ totalCostPln: number; totalItems: number }>([
      {
        $match: {
          ownerId: ownerObjectId,
          vehicleId: vehicleObjectId,
          ...(filter.date ? { date: filter.date } : {}),
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
