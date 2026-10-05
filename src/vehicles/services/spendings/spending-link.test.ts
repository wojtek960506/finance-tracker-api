import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
} from '@vehicles/model';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import { TransactionNotFoundError, VehicleSpendingNotFoundError } from '@utils/errors';

import { linkSpendingsToTransaction } from './link-spendings-to-transaction';
import { unlinkSpendingFromTransaction } from './unlink-spending-from-transaction';

describe('Spending Link Services', () => {
  const ownerId = new Types.ObjectId().toString();
  const transactionId = new Types.ObjectId().toString();
  const fuelId = new Types.ObjectId().toString();
  const equipmentId = new Types.ObjectId().toString();
  const maintenanceId = new Types.ObjectId().toString();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('linkSpendingsToTransaction', () => {
    it('links fuel, equipment, and maintenance spendings to transaction', async () => {
      vi.spyOn(TransactionModel, 'findOne').mockResolvedValue({
        _id: new Types.ObjectId(transactionId),
        ownerId: new Types.ObjectId(ownerId),
      } as any);

      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue({
        _id: new Types.ObjectId(fuelId),
      } as any);
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue({
        _id: new Types.ObjectId(equipmentId),
      } as any);
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue({
        _id: new Types.ObjectId(maintenanceId),
      } as any);

      vi.spyOn(VehicleFuelEntryModel, 'updateOne').mockResolvedValue({
        acknowledged: true,
      } as any);
      vi.spyOn(VehicleEquipmentModel, 'updateOne').mockResolvedValue({
        acknowledged: true,
      } as any);
      vi.spyOn(VehicleMaintenanceModel, 'updateOne').mockResolvedValue({
        acknowledged: true,
      } as any);

      const result = await linkSpendingsToTransaction(ownerId, {
        transactionId,
        spendings: [
          { spendingType: 'fuel', spendingId: fuelId },
          { spendingType: 'equipment', spendingId: equipmentId },
          { spendingType: 'maintenance', spendingId: maintenanceId },
        ],
      });

      expect(VehicleFuelEntryModel.updateOne).toHaveBeenCalledWith(
        { _id: fuelId, ownerId },
        { $set: { transactionId } },
      );
      expect(VehicleEquipmentModel.updateOne).toHaveBeenCalledWith(
        { _id: equipmentId, ownerId },
        { $set: { transactionId } },
      );
      expect(VehicleMaintenanceModel.updateOne).toHaveBeenCalledWith(
        { _id: maintenanceId, ownerId },
        { $set: { transactionId } },
      );
      expect(result).toEqual({ acknowledged: true, modifiedCount: 3 });
    });

    it('throws TransactionNotFoundError when transaction is not found', async () => {
      vi.spyOn(TransactionModel, 'findOne').mockResolvedValue(null);

      await expect(
        linkSpendingsToTransaction(ownerId, {
          transactionId,
          spendings: [{ spendingType: 'fuel', spendingId: fuelId }],
        }),
      ).rejects.toThrow(TransactionNotFoundError);
    });

    it('throws VehicleSpendingNotFoundError when a spending item is not found', async () => {
      vi.spyOn(TransactionModel, 'findOne').mockResolvedValue({
        _id: new Types.ObjectId(transactionId),
        ownerId: new Types.ObjectId(ownerId),
      } as any);

      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue(null);

      await expect(
        linkSpendingsToTransaction(ownerId, {
          transactionId,
          spendings: [{ spendingType: 'fuel', spendingId: fuelId }],
        }),
      ).rejects.toThrow(VehicleSpendingNotFoundError);
    });
  });

  describe('unlinkSpendingFromTransaction', () => {
    it('unlinks fuel spending document from transaction', async () => {
      const doc = {
        _id: new Types.ObjectId(fuelId),
        transactionId,
        save: vi.fn().mockResolvedValue(this),
      };
      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue(doc as any);

      const result = await unlinkSpendingFromTransaction(ownerId, 'fuel', fuelId);

      expect(doc.transactionId).toBeNull();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 });
    });

    it('unlinks equipment spending document from transaction', async () => {
      const doc = {
        _id: new Types.ObjectId(equipmentId),
        transactionId,
        save: vi.fn().mockResolvedValue(this),
      };
      vi.spyOn(VehicleEquipmentModel, 'findOne').mockResolvedValue(doc as any);

      const result = await unlinkSpendingFromTransaction(
        ownerId,
        'equipment',
        equipmentId,
      );

      expect(doc.transactionId).toBeNull();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 });
    });

    it('unlinks maintenance spending document from transaction', async () => {
      const doc = {
        _id: new Types.ObjectId(maintenanceId),
        transactionId,
        save: vi.fn().mockResolvedValue(this),
      };
      vi.spyOn(VehicleMaintenanceModel, 'findOne').mockResolvedValue(doc as any);

      const result = await unlinkSpendingFromTransaction(
        ownerId,
        'maintenance',
        maintenanceId,
      );

      expect(doc.transactionId).toBeNull();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 });
    });

    it('throws VehicleSpendingNotFoundError when spending to unlink is missing', async () => {
      vi.spyOn(VehicleFuelEntryModel, 'findOne').mockResolvedValue(null);

      await expect(
        unlinkSpendingFromTransaction(ownerId, 'fuel', fuelId),
      ).rejects.toThrow(VehicleSpendingNotFoundError);
    });
  });
});
