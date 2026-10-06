import {
  IVehicle,
  IVehicleEquipment,
  VehicleEquipmentModel,
  VehicleModel,
} from '@vehicles/model';
import { VehicleEquipmentCreateDTO, VehicleEquipmentUpdateDTO } from '@vehicles/schema';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VehicleEquipmentNotFoundError, VehicleNotFoundError } from '@utils/errors';

import { createEquipment } from './create-equipment';
import { deleteEquipment } from './delete-equipment';
import { getEquipment, getEquipmentList } from './get-equipment';
import { updateEquipment } from './update-equipment';

describe('Equipment CRUD Services', () => {
  const ownerId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId().toString();
  const equipmentId = new Types.ObjectId().toString();

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

  const mockEquipmentDoc = (data: Partial<IVehicleEquipment> = {}): IVehicleEquipment =>
    ({
      _id: new Types.ObjectId(data._id?.toString() || equipmentId),
      ownerId: new Types.ObjectId(data.ownerId?.toString() || ownerId),
      vehicleId: new Types.ObjectId(data.vehicleId?.toString() || vehicleId),
      date: data.date || new Date('2026-05-01'),
      itemName: data.itemName || 'Crash bars',
      costPln: data.costPln ?? 350,
      description: data.description || 'Givi crash bars',
      createdAt: data.createdAt || new Date('2026-05-01'),
      updatedAt: data.updatedAt || new Date('2026-05-01'),
      save: vi.fn().mockResolvedValue(this),
      deleteOne: vi.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
      ...data,
    }) as unknown as IVehicleEquipment;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createEquipment', () => {
    const createDto: VehicleEquipmentCreateDTO = {
      date: new Date('2026-05-01'),
      itemName: 'Crash bars',
      costPln: 350,
      description: 'Givi crash bars',
    };

    it('creates equipment associated with resolved vehicle', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const createdDoc = mockEquipmentDoc();
      vi.spyOn(VehicleEquipmentModel, 'create').mockResolvedValue(createdDoc as any);

      const result = await createEquipment(ownerId, 'suzuki-sv-650', createDto);

      expect(VehicleEquipmentModel.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId,
        vehicleId: new Types.ObjectId(vehicleId),
      });
      expect(result.itemName).toBe('Crash bars');
      expect(result.costPln).toBe(350);
    });

    it('throws VehicleNotFoundError when vehicle does not exist', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);

      await expect(createEquipment(ownerId, 'non-existent', createDto)).rejects.toThrow(
        VehicleNotFoundError,
      );
    });
  });

  describe('getEquipmentList', () => {
    it('returns equipment entries sorted newest first with pagination', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const doc1 = mockEquipmentDoc({ itemName: 'Item 1' });
      const doc2 = mockEquipmentDoc({ itemName: 'Item 2' });

      const limitMock = vi.fn().mockResolvedValue([doc1, doc2]);
      const skipMock = vi.fn().mockReturnValue({ limit: limitMock });
      const sortMock = vi.fn().mockReturnValue({ skip: skipMock });
      vi.spyOn(VehicleEquipmentModel, 'find').mockReturnValue({
        sort: sortMock,
      } as any);

      const results = await getEquipmentList(ownerId, vehicleId, {
        page: 1,
        limit: 10,
      });

      expect(sortMock).toHaveBeenCalledWith({ date: -1, _id: -1 });
      expect(results).toHaveLength(2);
      expect(results[0].itemName).toBe('Item 1');
    });

    it('applies date range filters when provided', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());

      const limitMock = vi.fn().mockResolvedValue([]);
      const skipMock = vi.fn().mockReturnValue({ limit: limitMock });
      const sortMock = vi.fn().mockReturnValue({ skip: skipMock });
      vi.spyOn(VehicleEquipmentModel, 'find').mockReturnValue({
        sort: sortMock,
      } as any);

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-06-30');

      await getEquipmentList(ownerId, vehicleId, {
        page: 1,
        limit: 10,
        startDate,
        endDate,
      });

      expect(VehicleEquipmentModel.find).toHaveBeenCalledWith({
        ownerId,
        vehicleId: new Types.ObjectId(vehicleId),
        date: { $gte: startDate, $lte: endDate },
      });
    });
  });

  describe('getEquipment', () => {
    it('returns a single equipment entry', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockEquipmentDoc();
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue(doc);

      const result = await getEquipment(ownerId, vehicleId, equipmentId);

      expect(result.id).toBe(equipmentId);
      expect(result.itemName).toBe('Crash bars');
    });

    it('throws VehicleEquipmentNotFoundError when equipment is not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue(null);

      await expect(getEquipment(ownerId, vehicleId, equipmentId)).rejects.toThrow(
        VehicleEquipmentNotFoundError,
      );
    });
  });

  describe('updateEquipment', () => {
    it('updates equipment properties and saves document', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockEquipmentDoc();
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue(doc);

      const updateDto: VehicleEquipmentUpdateDTO = {
        itemName: 'Heated Grips',
        costPln: 250,
      };

      const result = await updateEquipment(ownerId, vehicleId, equipmentId, updateDto);

      expect(doc.save).toHaveBeenCalled();
      expect(result.itemName).toBe('Heated Grips');
      expect(result.costPln).toBe(250);
    });

    it('throws VehicleEquipmentNotFoundError when equipment to update is not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue(null);

      await expect(updateEquipment(ownerId, vehicleId, equipmentId, {})).rejects.toThrow(
        VehicleEquipmentNotFoundError,
      );
    });
  });

  describe('deleteEquipment', () => {
    it('deletes equipment successfully', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      const doc = mockEquipmentDoc();
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue(doc);

      await deleteEquipment(ownerId, vehicleId, equipmentId);

      expect(doc.deleteOne).toHaveBeenCalled();
    });

    it('throws VehicleEquipmentNotFoundError when equipment to delete is not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(mockVehicleDoc());
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue(null);

      await expect(deleteEquipment(ownerId, vehicleId, equipmentId)).rejects.toThrow(
        VehicleEquipmentNotFoundError,
      );
    });
  });
});
