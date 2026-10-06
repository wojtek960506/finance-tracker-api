import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { createIntegrationAccessToken } from '../auth';
import { createIntegrationUser } from '../fixtures/users';
import {
  buildEquipmentDoc,
  createIntegrationVehicle,
  insertEquipmentItems,
} from '../fixtures/vehicles';
import { setupIntegrationSuite } from '../suite';

describe('vehicle equipment routes integration', () => {
  const { getApp } = setupIntegrationSuite();

  describe('POST /api/vehicles/:vehicleId/equipment', () => {
    it('creates an equipment item for vehicle by _id', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-create-id@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Equipment Test Car',
        slug: 'equipment-test-car',
      });

      const payload = {
        date: '2026-05-01T10:00:00.000Z',
        itemName: 'Roof Rack',
        costPln: 850,
        description: 'Thule WingBar Evo for car roof',
      };

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      const json = response.json();
      expect(json).toEqual({
        id: expect.any(String),
        ownerId: ownerId.toString(),
        vehicleId: vehicle._id.toString(),
        date: '2026-05-01T10:00:00.000Z',
        itemName: 'Roof Rack',
        costPln: 850,
        description: 'Thule WingBar Evo for car roof',
        transactionId: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('creates an equipment item for vehicle by slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-create-slug@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Equipment Slug Car',
        slug: 'equipment-slug-car',
      });

      const payload = {
        date: '2026-05-02T10:00:00.000Z',
        itemName: 'Dashcam 4K',
        costPln: 450,
      };

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/equipment-slug-car/equipment',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(
        expect.objectContaining({
          vehicleId: vehicle._id.toString(),
          itemName: 'Dashcam 4K',
          costPln: 450,
        }),
      );
    });

    it('creates an equipment item with optional transactionId', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-create-tx@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Equipment Tx Car',
        slug: 'equipment-tx-car',
      });
      const txId = new Types.ObjectId().toString();

      const payload = {
        date: '2026-05-03T10:00:00.000Z',
        itemName: 'Winter Mats Set',
        costPln: 180,
        transactionId: txId,
      };

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(
        expect.objectContaining({
          transactionId: txId,
          itemName: 'Winter Mats Set',
          costPln: 180,
        }),
      );
    });

    it('rejects creation if vehicle belongs to another user', async () => {
      const userA = await createIntegrationUser({ email: 'equip-a@example.com' });
      const userB = await createIntegrationUser({ email: 'equip-b@example.com' });
      const vehicle = await createIntegrationVehicle({
        ownerId: userA,
        name: 'User A Car',
        slug: 'user-a-car',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
        payload: {
          date: '2026-05-01T10:00:00.000Z',
          itemName: 'Floor Mats',
          costPln: 100,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects creation with empty item name', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-empty-name@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Empty Item Car',
        slug: 'empty-item-car',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          date: '2026-05-01T10:00:00.000Z',
          itemName: '   ',
          costPln: 100,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects unauthenticated request', async () => {
      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/any-id/equipment',
        payload: {
          date: '2026-05-01T10:00:00.000Z',
          itemName: 'Floor Mats',
          costPln: 100,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/vehicles/:vehicleId/equipment', () => {
    it('returns equipment items sorted newest first with pagination', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-list@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'List Equip Car',
        slug: 'list-equip-car',
      });

      await insertEquipmentItems([
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-10T10:00:00.000Z'),
          itemName: 'Older Equipment',
          costPln: 100,
        }),
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-03-20T10:00:00.000Z'),
          itemName: 'Newer Equipment',
          costPln: 200,
        }),
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-02-15T10:00:00.000Z'),
          itemName: 'Middle Equipment',
          costPln: 150,
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveLength(3);
      expect(json[0].itemName).toBe('Newer Equipment');
      expect(json[1].itemName).toBe('Middle Equipment');
      expect(json[2].itemName).toBe('Older Equipment');
    });

    it('filters equipment items by date range', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-filter-date@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Date Filter Equip Car',
        slug: 'date-filter-equip-car',
      });

      await insertEquipmentItems([
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-01T00:00:00.000Z'),
          itemName: 'Jan item',
        }),
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-02-15T00:00:00.000Z'),
          itemName: 'Feb item',
        }),
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-03-30T00:00:00.000Z'),
          itemName: 'Mar item',
        }),
      ]);

      const query =
        'startDate=2026-02-01T00:00:00.000Z&' + 'endDate=2026-02-28T23:59:59.999Z';
      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment?${query}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveLength(1);
      expect(json[0].itemName).toBe('Feb item');
    });

    it('respects page and limit query parameters', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-pagination@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Pagination Equip Car',
        slug: 'pagination-equip-car',
      });

      await insertEquipmentItems([
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-01T00:00:00.000Z'),
          itemName: 'Item 1',
        }),
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-02T00:00:00.000Z'),
          itemName: 'Item 2',
        }),
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-03T00:00:00.000Z'),
          itemName: 'Item 3',
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment?page=2&limit=1`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveLength(1);
      expect(json[0].itemName).toBe('Item 2');
    });

    it('does not return items belonging to other users', async () => {
      const userA = await createIntegrationUser({ email: 'equip-iso-a@example.com' });
      const userB = await createIntegrationUser({ email: 'equip-iso-b@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'Vehicle A',
        slug: 'vehicle-a',
      });
      const vehicleB = await createIntegrationVehicle({
        ownerId: userB,
        name: 'Vehicle B',
        slug: 'vehicle-b',
      });

      await insertEquipmentItems([
        buildEquipmentDoc({
          ownerId: userA,
          vehicleId: vehicleA._id,
          itemName: 'User A item',
        }),
        buildEquipmentDoc({
          ownerId: userB,
          vehicleId: vehicleB._id,
          itemName: 'User B item',
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleA._id.toString()}/equipment`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userA.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveLength(1);
      expect(json[0].itemName).toBe('User A item');
    });

    it('returns 404 when vehicle not found or belongs to another user', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-notfound@example.com',
      });
      const nonExistentId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${nonExistentId}/equipment`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_NOT_FOUND_ERROR',
        }),
      );
    });
  });

  describe('GET /api/vehicles/:vehicleId/equipment/:itemId', () => {
    it('returns single equipment item by ID', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-get-single@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Single Equip Car',
        slug: 'single-equip-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        itemName: 'LED Lightbar',
        costPln: 600,
        description: 'Offroad auxiliary light',
      });
      await insertEquipmentItems([itemDoc]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: itemDoc._id.toString(),
          vehicleId: vehicle._id.toString(),
          itemName: 'LED Lightbar',
          costPln: 600,
          description: 'Offroad auxiliary light',
        }),
      );
    });

    it('returns single equipment item by vehicle slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-slug-get@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Single Slug Equip Car',
        slug: 'single-slug-equip-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        itemName: 'First Aid Kit',
      });
      await insertEquipmentItems([itemDoc]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/single-slug-equip-car/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: itemDoc._id.toString(),
          itemName: 'First Aid Kit',
        }),
      );
    });

    it('returns 404 when equipment item does not exist', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-missing@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Missing Equip Car',
        slug: 'missing-equip-car',
      });
      const nonExistentItemId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${nonExistentItemId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_EQUIPMENT_NOT_FOUND_ERROR',
        }),
      );
    });

    it('returns 404 when equipment item belongs to another user', async () => {
      const userA = await createIntegrationUser({ email: 'equip-other-a@example.com' });
      const userB = await createIntegrationUser({ email: 'equip-other-b@example.com' });
      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'User A Car',
        slug: 'user-a-car',
      });
      const vehicleB = await createIntegrationVehicle({
        ownerId: userB,
        name: 'User B Car',
        slug: 'user-b-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId: userA,
        vehicleId: vehicleA._id,
        itemName: 'User A private accessory',
      });
      await insertEquipmentItems([itemDoc]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleB._id.toString()}/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/vehicles/:vehicleId/equipment/:itemId', () => {
    it('updates equipment item fields', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-patch@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch Equip Car',
        slug: 'patch-equip-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        itemName: 'Basic Radio',
        costPln: 200,
        description: 'Original radio description',
      });
      await insertEquipmentItems([itemDoc]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          itemName: 'Android Auto Head Unit',
          costPln: 800,
          description: 'Upgraded modern multimedia unit',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: itemDoc._id.toString(),
          itemName: 'Android Auto Head Unit',
          costPln: 800,
          description: 'Upgraded modern multimedia unit',
        }),
      );
    });

    it('updates equipment item via vehicle slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-patch-slug@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Slug Patch Equip Car',
        slug: 'slug-patch-equip-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        costPln: 100,
      });
      await insertEquipmentItems([itemDoc]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/slug-patch-equip-car/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          costPln: 140,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          costPln: 140,
        }),
      );
    });

    it('returns 404 when updating non-existent equipment item', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-patch-404@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch 404 Equip Car',
        slug: 'patch-404-equip-car',
      });
      const nonExistentItemId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${nonExistentItemId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          costPln: 500,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_EQUIPMENT_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects invalid patch payload (e.g. negative cost)', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-patch-neg@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch Neg Equip Car',
        slug: 'patch-neg-equip-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        costPln: 100,
      });
      await insertEquipmentItems([itemDoc]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          costPln: -50,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/vehicles/:vehicleId/equipment/:itemId', () => {
    it('deletes equipment item and returns 204', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-del@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete Equip Car',
        slug: 'delete-equip-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
        itemName: 'To be deleted item',
      });
      await insertEquipmentItems([itemDoc]);

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(204);

      // Verify deletion by attempting to GET
      const getResponse = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it('deletes equipment item via vehicle slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-del-slug@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete Slug Equip Car',
        slug: 'delete-slug-equip-car',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId,
        vehicleId: vehicle._id,
      });
      await insertEquipmentItems([itemDoc]);

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/delete-slug-equip-car/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(204);
    });

    it('returns 404 when deleting non-existent equipment item', async () => {
      const ownerId = await createIntegrationUser({
        email: 'equip-del-404@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete 404 Equip Car',
        slug: 'delete-404-equip-car',
      });
      const nonExistentItemId = new Types.ObjectId().toString();

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}/equipment/${nonExistentItemId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(404);
      expect(deleteResponse.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_EQUIPMENT_NOT_FOUND_ERROR',
        }),
      );
    });

    it('returns 404 when deleting item belonging to another user', async () => {
      const userA = await createIntegrationUser({ email: 'equip-del-a@example.com' });
      const userB = await createIntegrationUser({ email: 'equip-del-b@example.com' });
      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'Vehicle A',
        slug: 'vehicle-a',
      });
      const vehicleB = await createIntegrationVehicle({
        ownerId: userB,
        name: 'Vehicle B',
        slug: 'vehicle-b',
      });

      const itemDoc = buildEquipmentDoc({
        ownerId: userA,
        vehicleId: vehicleA._id,
      });
      await insertEquipmentItems([itemDoc]);

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicleB._id.toString()}/equipment/${itemDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(404);
    });
  });
});
