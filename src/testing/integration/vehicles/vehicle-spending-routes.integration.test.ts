import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
} from '@vehicles/model';
import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { createIntegrationAccessToken } from '../auth';
import { getSystemNamedResources } from '../fixtures/named-resources';
import {
  buildStandardTransactionDoc,
  insertTransactions,
} from '../fixtures/transactions';
import { createIntegrationUser } from '../fixtures/users';
import {
  buildEquipmentDoc,
  buildFuelEntryDoc,
  buildMaintenanceDoc,
  createIntegrationVehicle,
  insertEquipmentItems,
  insertFuelEntries,
  insertMaintenanceRecords,
} from '../fixtures/vehicles';
import { setupIntegrationSuite } from '../suite';

describe('vehicle spending routes integration', () => {
  const { getApp } = setupIntegrationSuite();

  describe('POST /api/vehicles/spendings/link', () => {
    it('links fuel, equipment, and maintenance spendings to a transaction', async () => {
      const ownerId = await createIntegrationUser({
        email: 'spending-link-all@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Spending Vehicle',
        slug: 'spending-vehicle',
      });

      const { category, paymentMethod, account } = await getSystemNamedResources();
      const transactionId = new Types.ObjectId();

      await insertTransactions([
        buildStandardTransactionDoc({
          _id: transactionId,
          ownerId,
          categoryId: category._id,
          paymentMethodId: paymentMethod._id,
          accountId: account._id,
          amount: 1500,
        }),
      ]);

      const fuelDoc = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        fuelLiters: 40,
        costPln: 260,
      });
      const equipDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        itemName: 'Tow Hook',
        costPln: 340,
      });
      const maintDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        description: 'Oil change',
        costPln: 900,
      });

      await insertFuelEntries([fuelDoc]);
      await insertEquipmentItems([equipDoc]);
      await insertMaintenanceRecords([maintDoc]);

      const payload = {
        transactionId: transactionId.toString(),
        spendings: [
          { spendingType: 'fuel', spendingId: fuelDoc._id.toString() },
          { spendingType: 'equipment', spendingId: equipDoc._id.toString() },
          { spendingType: 'maintenance', spendingId: maintDoc._id.toString() },
        ],
      };

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        acknowledged: true,
        modifiedCount: 3,
      });

      // Verify DB persistence of transactionId for all 3 entities
      const updatedFuel = await VehicleFuelEntryModel.findById(fuelDoc._id);
      const updatedEquip = await VehicleEquipmentModel.findById(equipDoc._id);
      const updatedMaint = await VehicleMaintenanceModel.findById(maintDoc._id);

      expect(updatedFuel?.transactionId?.toString()).toBe(transactionId.toString());
      expect(updatedEquip?.transactionId?.toString()).toBe(transactionId.toString());
      expect(updatedMaint?.transactionId?.toString()).toBe(transactionId.toString());
    });

    it('rejects linking when transaction does not exist', async () => {
      const ownerId = await createIntegrationUser({
        email: 'spending-tx-missing@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Tx Missing Car',
        slug: 'tx-missing-car',
      });

      const fuelDoc = buildFuelEntryDoc({ ownerId, vehicleId: vehicle._id });
      await insertFuelEntries([fuelDoc]);

      const nonExistentTxId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          transactionId: nonExistentTxId,
          spendings: [{ spendingType: 'fuel', spendingId: fuelDoc._id.toString() }],
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'TRANSACTION_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects linking when transaction belongs to another user', async () => {
      const userA = await createIntegrationUser({ email: 'user-a-tx@example.com' });
      const userB = await createIntegrationUser({ email: 'user-b-tx@example.com' });

      const vehicleB = await createIntegrationVehicle({
        ownerId: userB,
        name: 'User B Car',
        slug: 'user-b-car',
      });

      const { category, paymentMethod, account } = await getSystemNamedResources();
      const userATransactionId = new Types.ObjectId();

      await insertTransactions([
        buildStandardTransactionDoc({
          _id: userATransactionId,
          ownerId: userA,
          categoryId: category._id,
          paymentMethodId: paymentMethod._id,
          accountId: account._id,
        }),
      ]);

      const fuelDocB = buildFuelEntryDoc({ ownerId: userB, vehicleId: vehicleB._id });
      await insertFuelEntries([fuelDocB]);

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
        payload: {
          transactionId: userATransactionId.toString(),
          spendings: [{ spendingType: 'fuel', spendingId: fuelDocB._id.toString() }],
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'TRANSACTION_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects linking when spending item does not exist', async () => {
      const ownerId = await createIntegrationUser({
        email: 'spending-item-missing@example.com',
      });

      const { category, paymentMethod, account } = await getSystemNamedResources();
      const transactionId = new Types.ObjectId();

      await insertTransactions([
        buildStandardTransactionDoc({
          _id: transactionId,
          ownerId,
          categoryId: category._id,
          paymentMethodId: paymentMethod._id,
          accountId: account._id,
        }),
      ]);

      const nonExistentSpendingId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          transactionId: transactionId.toString(),
          spendings: [{ spendingType: 'fuel', spendingId: nonExistentSpendingId }],
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_SPENDING_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects linking when spending item belongs to another user', async () => {
      const userA = await createIntegrationUser({ email: 'user-a-spend@example.com' });
      const userB = await createIntegrationUser({ email: 'user-b-spend@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'User A Car',
        slug: 'user-a-car',
      });

      const { category, paymentMethod, account } = await getSystemNamedResources();
      const userBTransactionId = new Types.ObjectId();

      await insertTransactions([
        buildStandardTransactionDoc({
          _id: userBTransactionId,
          ownerId: userB,
          categoryId: category._id,
          paymentMethodId: paymentMethod._id,
          accountId: account._id,
        }),
      ]);

      const userAFuelDoc = buildFuelEntryDoc({
        ownerId: userA,
        vehicleId: vehicleA._id,
      });
      await insertFuelEntries([userAFuelDoc]);

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
        payload: {
          transactionId: userBTransactionId.toString(),
          spendings: [{ spendingType: 'fuel', spendingId: userAFuelDoc._id.toString() }],
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_SPENDING_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects empty spendings array', async () => {
      const ownerId = await createIntegrationUser({
        email: 'spending-empty-arr@example.com',
      });
      const txId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          transactionId: txId,
          spendings: [],
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects invalid ObjectId formats in link payload', async () => {
      const ownerId = await createIntegrationUser({
        email: 'spending-invalid-oid@example.com',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          transactionId: 'not-a-valid-id',
          spendings: [{ spendingType: 'fuel', spendingId: 'also-invalid' }],
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects unauthenticated link request', async () => {
      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/link',
        payload: {
          transactionId: new Types.ObjectId().toString(),
          spendings: [
            { spendingType: 'fuel', spendingId: new Types.ObjectId().toString() },
          ],
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/vehicles/spendings/unlink', () => {
    it('unlinks fuel spending from transaction and clears transactionId in DB', async () => {
      const ownerId = await createIntegrationUser({
        email: 'unlink-fuel@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Unlink Fuel Car',
        slug: 'unlink-fuel-car',
      });

      const existingTxId = new Types.ObjectId();
      const fuelDoc = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        transactionId: existingTxId,
      });
      await insertFuelEntries([fuelDoc]);

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/unlink',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          spendingType: 'fuel',
          spendingId: fuelDoc._id.toString(),
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        acknowledged: true,
        modifiedCount: 1,
      });

      const updatedDoc = await VehicleFuelEntryModel.findById(fuelDoc._id);
      expect(updatedDoc?.transactionId).toBeNull();
    });

    it('unlinks equipment spending from transaction and clears transactionId in DB', async () => {
      const ownerId = await createIntegrationUser({
        email: 'unlink-equip@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Unlink Equip Car',
        slug: 'unlink-equip-car',
      });

      const existingTxId = new Types.ObjectId();
      const equipDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        transactionId: existingTxId,
      });
      await insertEquipmentItems([equipDoc]);

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/unlink',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          spendingType: 'equipment',
          spendingId: equipDoc._id.toString(),
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        acknowledged: true,
        modifiedCount: 1,
      });

      const updatedDoc = await VehicleEquipmentModel.findById(equipDoc._id);
      expect(updatedDoc?.transactionId).toBeNull();
    });

    it('unlinks maintenance spending from transaction and clears transactionId in DB', async () => {
      const ownerId = await createIntegrationUser({
        email: 'unlink-maint@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Unlink Maint Car',
        slug: 'unlink-maint-car',
      });

      const existingTxId = new Types.ObjectId();
      const maintDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        transactionId: existingTxId,
      });
      await insertMaintenanceRecords([maintDoc]);

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/unlink',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          spendingType: 'maintenance',
          spendingId: maintDoc._id.toString(),
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        acknowledged: true,
        modifiedCount: 1,
      });

      const updatedDoc = await VehicleMaintenanceModel.findById(maintDoc._id);
      expect(updatedDoc?.transactionId).toBeNull();
    });

    it('returns 404 when unlinking non-existent spending', async () => {
      const ownerId = await createIntegrationUser({
        email: 'unlink-nonexistent@example.com',
      });
      const nonExistentSpendingId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/unlink',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          spendingType: 'fuel',
          spendingId: nonExistentSpendingId,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_SPENDING_NOT_FOUND_ERROR',
        }),
      );
    });

    it('returns 404 when unlinking spending belonging to another user', async () => {
      const userA = await createIntegrationUser({ email: 'user-a-unlink@example.com' });
      const userB = await createIntegrationUser({ email: 'user-b-unlink@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'Vehicle A',
        slug: 'vehicle-a',
      });

      const fuelDocA = buildFuelEntryDoc({
        ownerId: userA,
        vehicleId: vehicleA._id,
      });
      await insertFuelEntries([fuelDocA]);

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/unlink',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
        payload: {
          spendingType: 'fuel',
          spendingId: fuelDocA._id.toString(),
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_SPENDING_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects unlinking with invalid spendingType', async () => {
      const ownerId = await createIntegrationUser({
        email: 'unlink-invalid-type@example.com',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/unlink',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          spendingType: 'invalid_type',
          spendingId: new Types.ObjectId().toString(),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects unauthenticated unlink request', async () => {
      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/spendings/unlink',
        payload: {
          spendingType: 'fuel',
          spendingId: new Types.ObjectId().toString(),
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
