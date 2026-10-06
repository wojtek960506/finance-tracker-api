import {
  IVehicle,
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
  VehicleModel,
} from '@vehicles/model';
import { VehicleCreateDTO, VehicleUpdateDTO } from '@vehicles/schema';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  VehicleDependencyError,
  VehicleNameAlreadyExistsError,
  VehicleNotFoundError,
  VehicleSlugAlreadyExistsError,
} from '@utils/errors';

import { createVehicle } from './create-vehicle';
import { deleteVehicle } from './delete-vehicle';
import { findVehicleByIdOrSlug } from './find-vehicle-by-id-or-slug';
import { getVehicle, getVehicles } from './get-vehicles';
import { updateVehicle } from './update-vehicle';

describe('Vehicle CRUD Services', () => {
  const ownerId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId().toString();

  const mockVehicleDoc = (data: Partial<IVehicle> = {}): IVehicle =>
    ({
      _id: new Types.ObjectId(data._id?.toString() || vehicleId),
      ownerId: new Types.ObjectId(data.ownerId?.toString() || ownerId),
      slug: data.slug || 'suzuki-sv-650',
      name: data.name || 'Suzuki SV650',
      brand: data.brand || 'Suzuki',
      vehicleModel: data.vehicleModel || 'SV650',
      type: data.type || 'motorcycle',
      productionYear: data.productionYear ?? 2007,
      notes: data.notes ?? 'Great bike',
      createdAt: data.createdAt || new Date('2026-01-01'),
      updatedAt: data.updatedAt || new Date('2026-01-02'),
      save: vi.fn().mockResolvedValue(this),
      deleteOne: vi.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
    }) as unknown as IVehicle;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createVehicle', () => {
    const createDto: VehicleCreateDTO = {
      name: 'Suzuki SV650',
      brand: 'Suzuki',
      vehicleModel: 'SV650',
      type: 'motorcycle',
      productionYear: 2007,
    };

    it('creates vehicle with auto-generated slug from name when slug is omitted', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);
      const createdDoc = mockVehicleDoc({ ...createDto, slug: 'suzuki-sv650' });
      vi.spyOn(VehicleModel, 'create').mockResolvedValue(createdDoc as any);

      const result = await createVehicle(ownerId, createDto);

      expect(VehicleModel.findOne).toHaveBeenNthCalledWith(1, {
        ownerId,
        name: 'Suzuki SV650',
      });
      expect(VehicleModel.findOne).toHaveBeenNthCalledWith(2, {
        ownerId,
        slug: 'suzuki-sv650',
      });
      expect(VehicleModel.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId,
        slug: 'suzuki-sv650',
      });
      expect(result.slug).toBe('suzuki-sv650');
      expect(result.name).toBe('Suzuki SV650');
    });

    it('creates vehicle with explicit slug when provided', async () => {
      const explicitDto: VehicleCreateDTO = {
        ...createDto,
        slug: 'custom-sv-slug',
      };
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);
      const createdDoc = mockVehicleDoc({ ...explicitDto, slug: 'custom-sv-slug' });
      vi.spyOn(VehicleModel, 'create').mockResolvedValue(createdDoc as any);

      const result = await createVehicle(ownerId, explicitDto);

      expect(VehicleModel.findOne).toHaveBeenNthCalledWith(1, {
        ownerId,
        name: 'Suzuki SV650',
      });
      expect(VehicleModel.findOne).toHaveBeenNthCalledWith(2, {
        ownerId,
        slug: 'custom-sv-slug',
      });
      expect(result.slug).toBe('custom-sv-slug');
    });

    it('throws VehicleNameAlreadyExistsError when name already exists for owner', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValueOnce(mockVehicleDoc());

      await expect(createVehicle(ownerId, createDto)).rejects.toThrow(
        VehicleNameAlreadyExistsError,
      );
    });

    it('throws VehicleSlugAlreadyExistsError when slug already exists for owner', async () => {
      vi.spyOn(VehicleModel, 'findOne')
        .mockResolvedValueOnce(null) // name check passes
        .mockResolvedValueOnce(mockVehicleDoc()); // slug check fails

      await expect(createVehicle(ownerId, createDto)).rejects.toThrow(
        VehicleSlugAlreadyExistsError,
      );
    });
  });

  describe('getVehicles & getVehicle', () => {
    it('returns list of serialized vehicles sorted by createdAt', async () => {
      const docs = [
        mockVehicleDoc({ name: 'Car 1', slug: 'car-1' }),
        mockVehicleDoc({ name: 'Car 2', slug: 'car-2' }),
      ];
      vi.spyOn(VehicleModel, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue(docs),
      } as any);

      const results = await getVehicles(ownerId);

      expect(VehicleModel.find).toHaveBeenCalledWith({ ownerId });
      expect(results).toHaveLength(2);
      expect(results[0].slug).toBe('car-1');
      expect(results[1].slug).toBe('car-2');
    });

    it('resolves vehicle by 24-hex ObjectId', async () => {
      const doc = mockVehicleDoc();
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(doc);

      const result = await getVehicle(ownerId, vehicleId);

      expect(VehicleModel.findOne).toHaveBeenCalledWith({
        ownerId,
        _id: vehicleId,
      });
      expect(result.id).toBe(vehicleId);
      expect(result.slug).toBe('suzuki-sv-650');
    });

    it('resolves vehicle by slug string', async () => {
      const doc = mockVehicleDoc({ slug: 'my-sv-650' });
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(doc);

      const result = await getVehicle(ownerId, 'my-sv-650');

      expect(VehicleModel.findOne).toHaveBeenCalledWith({
        ownerId,
        slug: 'my-sv-650',
      });
      expect(result.slug).toBe('my-sv-650');
    });

    it('throws VehicleNotFoundError when vehicle does not exist', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);

      await expect(getVehicle(ownerId, 'non-existent')).rejects.toThrow(
        VehicleNotFoundError,
      );
    });
  });

  describe('updateVehicle', () => {
    it('updates vehicle fields and saves changes', async () => {
      const doc = mockVehicleDoc();
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(doc);

      const updateDto: VehicleUpdateDTO = {
        notes: 'Updated notes',
        brand: 'Suzuki Motor Corp',
      };

      const result = await updateVehicle(ownerId, vehicleId, updateDto);

      expect(doc.save).toHaveBeenCalled();
      expect(result.notes).toBe('Updated notes');
      expect(result.brand).toBe('Suzuki Motor Corp');
    });

    it('verifies name uniqueness when updating to a new name', async () => {
      const doc = mockVehicleDoc({ name: 'Old Name' });
      vi.spyOn(VehicleModel, 'findOne')
        .mockResolvedValueOnce(doc) // findVehicleByIdOrSlug
        .mockResolvedValueOnce(mockVehicleDoc()); // find duplicate name

      await expect(
        updateVehicle(ownerId, vehicleId, { name: 'Existing Name' }),
      ).rejects.toThrow(VehicleNameAlreadyExistsError);
    });

    it('allows updating to the same name without uniqueness conflict', async () => {
      const doc = mockVehicleDoc({ name: 'Same Name' });
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValueOnce(doc);

      await updateVehicle(ownerId, vehicleId, { name: 'Same Name' });

      expect(doc.save).toHaveBeenCalled();
    });

    it('verifies slug uniqueness when explicit slug is provided', async () => {
      const doc = mockVehicleDoc({ slug: 'old-slug' });
      vi.spyOn(VehicleModel, 'findOne')
        .mockResolvedValueOnce(doc) // findVehicleByIdOrSlug
        .mockResolvedValueOnce(mockVehicleDoc()); // find duplicate slug

      await expect(
        updateVehicle(ownerId, vehicleId, { slug: 'new-existing-slug' }),
      ).rejects.toThrow(VehicleSlugAlreadyExistsError);
    });

    it('preserves existing slug when name is updated without explicit slug', async () => {
      const doc = mockVehicleDoc({ name: 'Old Name', slug: 'preserved-slug' });
      vi.spyOn(VehicleModel, 'findOne')
        .mockResolvedValueOnce(doc) // findVehicleByIdOrSlug
        .mockResolvedValueOnce(null); // name uniqueness check passes

      const result = await updateVehicle(ownerId, vehicleId, { name: 'Brand New Name' });

      expect(result.slug).toBe('preserved-slug');
      expect(result.name).toBe('Brand New Name');
    });
  });

  describe('deleteVehicle', () => {
    it('deletes vehicle when no child records exist', async () => {
      const doc = mockVehicleDoc();
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(doc);
      vi.spyOn(VehicleFuelEntryModel, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(VehicleEquipmentModel, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(VehicleMaintenanceModel, 'countDocuments').mockResolvedValue(0);

      await deleteVehicle(ownerId, vehicleId);

      expect(doc.deleteOne).toHaveBeenCalled();
    });

    it('throws VehicleDependencyError when fuel entries exist', async () => {
      const doc = mockVehicleDoc();
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(doc);
      vi.spyOn(VehicleFuelEntryModel, 'countDocuments').mockResolvedValue(3);
      vi.spyOn(VehicleEquipmentModel, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(VehicleMaintenanceModel, 'countDocuments').mockResolvedValue(0);

      await expect(deleteVehicle(ownerId, vehicleId)).rejects.toThrow(
        VehicleDependencyError,
      );
      expect(doc.deleteOne).not.toHaveBeenCalled();
    });

    it('throws VehicleDependencyError when equipment entries exist', async () => {
      const doc = mockVehicleDoc();
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(doc);
      vi.spyOn(VehicleFuelEntryModel, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(VehicleEquipmentModel, 'countDocuments').mockResolvedValue(1);
      vi.spyOn(VehicleMaintenanceModel, 'countDocuments').mockResolvedValue(0);

      await expect(deleteVehicle(ownerId, vehicleId)).rejects.toThrow(
        VehicleDependencyError,
      );
    });

    it('throws VehicleDependencyError when maintenance entries exist', async () => {
      const doc = mockVehicleDoc();
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(doc);
      vi.spyOn(VehicleFuelEntryModel, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(VehicleEquipmentModel, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(VehicleMaintenanceModel, 'countDocuments').mockResolvedValue(2);

      await expect(deleteVehicle(ownerId, vehicleId)).rejects.toThrow(
        VehicleDependencyError,
      );
    });

    it('throws VehicleNotFoundError when vehicle to delete is not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);

      await expect(deleteVehicle(ownerId, 'non-existent')).rejects.toThrow(
        VehicleNotFoundError,
      );
    });
  });

  describe('findVehicleByIdOrSlug', () => {
    it('throws VehicleNotFoundError if vehicle not found', async () => {
      vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);

      await expect(findVehicleByIdOrSlug(ownerId, 'unknown')).rejects.toThrow(
        VehicleNotFoundError,
      );
    });
  });
});
