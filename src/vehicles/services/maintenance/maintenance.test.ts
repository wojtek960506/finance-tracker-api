import {
  IVehicle,
  IVehicleMaintenance,
  VehicleMaintenanceModel,
  VehicleModel,
} from '@vehicles/model';
import {
  VehicleMaintenanceCreateDTO,
  VehicleMaintenanceUpdateDTO,
} from '@vehicles/schema';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VehicleMaintenanceNotFoundError, VehicleNotFoundError } from '@utils/errors';

import { createMaintenance } from './create-maintenance';
import { deleteMaintenance } from './delete-maintenance';
import { getMaintenance, getMaintenanceList } from './get-maintenance';
import { updateMaintenance } from './update-maintenance';

describe('Maintenance CRUD Services', () => {
  const ownerId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId().toString();
  const maintenanceId = new Types.ObjectId().toString();

  const mockVehicleDoc = (data: Partial<IVehicle> = {}): IVehicle =>
    ({
      _id: new Types.ObjectId(data._id?.toString() || vehicleId),
      ownerId: new Types.ObjectId(data.ownerId?.toString() || ownerId),
      slug: data.slug || 'suzuki-sv-650',
      name: data.name || 'Suzuki SV650',
      type: 'motorcycle',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    }) as unknown as IVehicle;

  const mockMaintenanceDoc = (
    data: Partial<IVehicleMaintenance> = {},
  ): IVehicleMaintenance =>
    ({
      _id: new Types.ObjectId(data._id?.toString() || maintenanceId),
      ownerId: new Types.ObjectId(data.ownerId?.toString() || ownerId),
      vehicleId: new Types.ObjectId(data.vehicleId?.toString() || vehicleId),
      section: data.section || 'ownMaintenance',
      date: data.date || new Date('2026-05-01'),
      costPln: data.costPln ?? 180,
      odometerKm: data.odometerKm ?? 41000,
      description: data.description || 'Oil + filter change',
      serviceProvider: data.serviceProvider || 'Self',
      serviceAddress: data.serviceAddress || 'Warszawa, Opolska 1',
      createdAt: data.createdAt || new Date('2026-05-01'),
      updatedAt: data.updatedAt || new Date('2026-05-01'),
      save: vi.fn().mockResolvedValue(this),
      deleteOne: vi.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
      ...data,
    }) as unknown as IVehicleMaintenance;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createMaintenance', () => {
    const createDto: VehicleMaintenanceCreateDTO = {
      section: 'ownMaintenance',
      date: new Date('2026-05-01'),
      costPln: 180,
      odometerKm: 41000,
      description: 'Oil + filter change',
      serviceProvider: 'Self',
      serviceAddress: 'Warszawa, Opolska 1',
    };

    it('creates maintenance associated with resolved vehicle', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const createdDoc = mockMaintenanceDoc();
      vi.spyOn(VehicleMaintenanceModel, 'create').mockResolvedValue(createdDoc as any);

      const result = await createMaintenance(ownerId, 'suzuki-sv-650', createDto);

      expect(VehicleMaintenanceModel.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId,
        vehicleId: new Types.ObjectId(vehicleId),
      });
      expect(result.section).toBe('ownMaintenance');
      expect(result.costPln).toBe(180);
    });

    it('throws VehicleNotFoundError when vehicle is not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);

      await expect(createMaintenance(ownerId, 'non-existent', createDto)).rejects.toThrow(
        VehicleNotFoundError,
      );
    });
  });

  describe('getMaintenanceList', () => {
    it('returns maintenance entries sorted newest first with pagination and summary', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const doc1 = mockMaintenanceDoc({ section: 'ownMaintenance', costPln: 200 });
      const doc2 = mockMaintenanceDoc({ section: 'ownMaintenance', costPln: 500 });

      const limitMock = vi.fn().mockResolvedValue([doc1, doc2]);
      const sortMock = vi.fn().mockReturnValue({ limit: limitMock });
      vi.spyOn(VehicleMaintenanceModel, 'find').mockReturnValue({
        sort: sortMock,
      } as any);
      vi.spyOn(VehicleMaintenanceModel, 'countDocuments').mockResolvedValue(2);
      vi.spyOn(VehicleMaintenanceModel, 'aggregate').mockResolvedValue([
        { totalCostPln: 700, totalRecords: 2 },
      ]);

      const results = await getMaintenanceList(ownerId, vehicleId, {
        limit: 10,
        section: 'ownMaintenance',
      });

      expect(sortMock).toHaveBeenCalledWith({ date: -1, _id: -1 });
      expect(limitMock).toHaveBeenCalledWith(11);
      expect(results.items).toHaveLength(2);
      expect(results.items[0].section).toBe('ownMaintenance');
      expect(results.summary).toEqual({
        totalCostPln: 700,
        totalRecords: 2,
      });
      expect(results.pagination).toEqual({
        nextCursor: null,
        hasMore: false,
        total: 2,
      });
    });

    it('filters by section and date range when provided', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const limitMock = vi.fn().mockResolvedValue([]);
      const sortMock = vi.fn().mockReturnValue({ limit: limitMock });
      vi.spyOn(VehicleMaintenanceModel, 'find').mockReturnValue({
        sort: sortMock,
      } as any);
      vi.spyOn(VehicleMaintenanceModel, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(VehicleMaintenanceModel, 'aggregate').mockResolvedValue([]);

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-06-30');

      const results = await getMaintenanceList(ownerId, vehicleId, {
        limit: 10,
        section: 'ownMaintenance',
        startDate,
        endDate,
      });

      expect(VehicleMaintenanceModel.find).toHaveBeenCalledWith({
        ownerId: new Types.ObjectId(ownerId),
        vehicleId: new Types.ObjectId(vehicleId),
        section: 'ownMaintenance',
        date: { $gte: startDate, $lte: endDate },
      });
      expect(results.summary).toEqual({
        totalCostPln: 0,
        totalRecords: 0,
      });
      expect(results.pagination).toEqual({
        nextCursor: null,
        hasMore: false,
        total: 0,
      });
    });
  });

  describe('getMaintenance', () => {
    it('returns a single maintenance entry', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockMaintenanceDoc();
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue(doc);

      const result = await getMaintenance(ownerId, vehicleId, maintenanceId);

      expect(result.id).toBe(maintenanceId);
      expect(result.description).toBe('Oil + filter change');
    });

    it('throws VehicleMaintenanceNotFoundError when maintenance is missing', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue(null);

      await expect(getMaintenance(ownerId, vehicleId, maintenanceId)).rejects.toThrow(
        VehicleMaintenanceNotFoundError,
      );
    });
  });

  describe('updateMaintenance', () => {
    it('updates maintenance properties and saves document', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockMaintenanceDoc();
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue(doc);

      const updateDto: VehicleMaintenanceUpdateDTO = {
        costPln: 220,
        serviceProvider: 'Garage XYZ',
        serviceAddress: 'Kraków, Armii Krajowej 5',
      };

      const result = await updateMaintenance(
        ownerId,
        vehicleId,
        maintenanceId,
        updateDto,
      );

      expect(doc.save).toHaveBeenCalled();
      expect(result.costPln).toBe(220);
      expect(result.serviceProvider).toBe('Garage XYZ');
      expect(result.serviceAddress).toBe('Kraków, Armii Krajowej 5');
    });

    it('throws VehicleMaintenanceNotFoundError when maintenance to update is missing', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue(null);

      await expect(
        updateMaintenance(ownerId, vehicleId, maintenanceId, {}),
      ).rejects.toThrow(VehicleMaintenanceNotFoundError);
    });
  });

  describe('deleteMaintenance', () => {
    it('deletes maintenance successfully', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockMaintenanceDoc();
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue(doc);

      await deleteMaintenance(ownerId, vehicleId, maintenanceId);

      expect(doc.deleteOne).toHaveBeenCalled();
    });

    it('throws VehicleMaintenanceNotFoundError when maintenance to delete is missing', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue(null);

      await expect(deleteMaintenance(ownerId, vehicleId, maintenanceId)).rejects.toThrow(
        VehicleMaintenanceNotFoundError,
      );
    });
  });
});
