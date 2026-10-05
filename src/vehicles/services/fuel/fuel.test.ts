import {
  IVehicle,
  IVehicleFuelEntry,
  VehicleFuelEntryModel,
  VehicleModel,
} from '@vehicles/model';
import { VehicleFuelEntryCreateDTO, VehicleFuelEntryUpdateDTO } from '@vehicles/schema';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VehicleFuelEntryNotFoundError, VehicleNotFoundError } from '@utils/errors';

import { createFuelEntry } from './create-fuel-entry';
import { deleteFuelEntry } from './delete-fuel-entry';
import { getFuelEntries } from './get-fuel-entries';
import { getFuelEntry } from './get-fuel-entry';
import { updateFuelEntry } from './update-fuel-entry';

describe('Fuel CRUD Services', () => {
  const ownerId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId().toString();
  const fuelEntryId = new Types.ObjectId().toString();

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

  const mockFuelDoc = (data: Partial<IVehicleFuelEntry> = {}): IVehicleFuelEntry =>
    ({
      _id: new Types.ObjectId(data._id?.toString() || fuelEntryId),
      ownerId: new Types.ObjectId(data.ownerId?.toString() || ownerId),
      vehicleId: new Types.ObjectId(data.vehicleId?.toString() || vehicleId),
      date: data.date || new Date('2026-05-01'),
      fuelLiters: data.fuelLiters ?? 15,
      isFullTank: data.isFullTank ?? true,
      unitPricePln: data.unitPricePln ?? 6.5,
      costPln: data.costPln ?? 97.5,
      odometerKm: data.odometerKm ?? 40000,
      createdAt: data.createdAt || new Date('2026-05-01'),
      updatedAt: data.updatedAt || new Date('2026-05-01'),
      save: vi.fn().mockResolvedValue(this),
      deleteOne: vi.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
    }) as unknown as IVehicleFuelEntry;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createFuelEntry', () => {
    const createDto: VehicleFuelEntryCreateDTO = {
      date: new Date('2026-05-01'),
      fuelLiters: 15,
      isFullTank: true,
      unitPricePln: 6.5,
      costPln: 97.5,
      odometerKm: 40000,
      stationBrand: 'Orlen',
    };

    it('creates fuel entry associated with resolved vehicle', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const createdFuelDoc = mockFuelDoc();
      vi.spyOn(VehicleFuelEntryModel, 'create').mockResolvedValue(createdFuelDoc as any);

      const result = await createFuelEntry(ownerId, 'suzuki-sv-650', createDto);

      expect(VehicleFuelEntryModel.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId,
        vehicleId: new Types.ObjectId(vehicleId),
      });
      expect(result.fuelLiters).toBe(15);
      expect(result.costPln).toBe(97.5);
    });

    it('throws VehicleNotFoundError when vehicle is not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);

      await expect(createFuelEntry(ownerId, 'non-existent', createDto)).rejects.toThrow(
        VehicleNotFoundError,
      );
    });
  });

  describe('getFuelEntries', () => {
    it('returns enriched fuel entries sorted newest first with pagination', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const doc1 = mockFuelDoc({
        _id: new Types.ObjectId(),
        date: new Date('2026-05-01'),
        odometerKm: 40000,
        fuelLiters: 14,
        costPln: 91,
        isFullTank: true,
      });
      const doc2 = mockFuelDoc({
        _id: new Types.ObjectId(),
        date: new Date('2026-05-15'),
        odometerKm: 40300,
        fuelLiters: 15,
        costPln: 97.5,
        isFullTank: true,
      });

      vi.spyOn(VehicleFuelEntryModel, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([doc1, doc2]),
      } as any);

      const results = (await getFuelEntries(ownerId, vehicleId, {
        page: 1,
        limit: 10,
        enriched: true,
      })) as any[];

      expect(results).toHaveLength(2);
      // Newest first -> doc2 is first
      expect(results[0].odometerKm).toBe(40300);
      expect(results[0].distanceSincePreviousKm).toBe(300);
      expect(results[0].consumptionLPer100Km).toBe(5); // 15L / 300km * 100
      expect(results[1].odometerKm).toBe(40000);
      expect(results[1].distanceSincePreviousKm).toBeNull();
    });

    it('filters entries by date range and isFullTank', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const doc1 = mockFuelDoc({
        _id: new Types.ObjectId(),
        date: new Date('2026-05-01'),
        isFullTank: true,
      });
      const doc2 = mockFuelDoc({
        _id: new Types.ObjectId(),
        date: new Date('2026-05-10'),
        isFullTank: false,
      });

      vi.spyOn(VehicleFuelEntryModel, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([doc1, doc2]),
      } as any);

      const results = await getFuelEntries(ownerId, vehicleId, {
        page: 1,
        limit: 10,
        isFullTank: true,
        startDate: new Date('2026-04-30'),
        endDate: new Date('2026-05-05'),
        enriched: true,
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(doc1._id.toString());
    });

    it('retrieves raw fuel entries directly when enriched is false', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const doc = mockFuelDoc();
      const limitMock = vi.fn().mockResolvedValue([doc]);
      const skipMock = vi.fn().mockReturnValue({ limit: limitMock });
      const sortMock = vi.fn().mockReturnValue({ skip: skipMock });
      vi.spyOn(VehicleFuelEntryModel, 'find').mockReturnValue({
        sort: sortMock,
      } as any);

      const results = await getFuelEntries(ownerId, vehicleId, {
        page: 2,
        limit: 5,
        enriched: false,
      });

      expect(skipMock).toHaveBeenCalledWith(5);
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(results).toHaveLength(1);
      expect((results[0] as any).distanceSincePreviousKm).toBeUndefined();
    });
  });

  describe('getFuelEntry', () => {
    it('returns a single enriched fuel entry with cycle calculation', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const doc1 = mockFuelDoc({
        _id: new Types.ObjectId(),
        date: new Date('2026-05-01'),
        odometerKm: 40000,
        isFullTank: true,
      });
      const targetId = new Types.ObjectId();
      const doc2 = mockFuelDoc({
        _id: targetId,
        date: new Date('2026-05-15'),
        odometerKm: 40200,
        fuelLiters: 10,
        costPln: 65,
        isFullTank: true,
      });

      vi.spyOn(VehicleFuelEntryModel, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([doc1, doc2]),
      } as any);

      const result = await getFuelEntry(ownerId, vehicleId, targetId.toString());

      expect(result.id).toBe(targetId.toString());
      expect(result.distanceSincePreviousKm).toBe(200);
      expect(result.consumptionLPer100Km).toBe(5);
    });

    it('throws VehicleFuelEntryNotFoundError when entry is not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleFuelEntryModel, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      await expect(
        getFuelEntry(ownerId, vehicleId, '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(VehicleFuelEntryNotFoundError);
    });
  });

  describe('updateFuelEntry', () => {
    it('updates raw fuel entry properties', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockFuelDoc();
      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue(doc);

      const updateDto: VehicleFuelEntryUpdateDTO = {
        stationBrand: 'Shell',
        costPln: 100,
      };

      const result = await updateFuelEntry(ownerId, vehicleId, fuelEntryId, updateDto);

      expect(doc.save).toHaveBeenCalled();
      expect(result.costPln).toBe(100);
      expect(result.stationBrand).toBe('Shell');
    });

    it('throws VehicleFuelEntryNotFoundError when entry to update is missing', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue(null);

      await expect(updateFuelEntry(ownerId, vehicleId, fuelEntryId, {})).rejects.toThrow(
        VehicleFuelEntryNotFoundError,
      );
    });
  });

  describe('deleteFuelEntry', () => {
    it('deletes fuel entry successfully', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockFuelDoc();
      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue(doc);

      await deleteFuelEntry(ownerId, vehicleId, fuelEntryId);

      expect(doc.deleteOne).toHaveBeenCalled();
    });

    it('throws VehicleFuelEntryNotFoundError when entry to delete is missing', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue(null);

      await expect(deleteFuelEntry(ownerId, vehicleId, fuelEntryId)).rejects.toThrow(
        VehicleFuelEntryNotFoundError,
      );
    });
  });
});
