import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { createIntegrationAccessToken } from '../auth';
import { createIntegrationUser } from '../fixtures/users';
import {
  buildEquipmentDoc,
  buildFuelEntryDoc,
  buildMaintenanceDoc,
  buildVehicleDoc,
  createIntegrationVehicle,
  insertEquipmentItems,
  insertFuelEntries,
  insertMaintenanceRecords,
  insertVehicles,
} from '../fixtures/vehicles';
import { setupIntegrationSuite } from '../suite';

describe('vehicle routes integration', () => {
  const { getApp } = setupIntegrationSuite();

  describe('POST /api/vehicles', () => {
    it('creates a vehicle with auto-generated slug', async () => {
      const ownerId = await createIntegrationUser({
        firstName: 'Vehicle',
        lastName: 'Owner',
        email: 'vehicle-owner-create@example.com',
      });

      const payload = {
        name: 'Yamaha MT-07',
        brand: 'Yamaha',
        vehicleModel: 'MT-07',
        type: 'motorcycle',
        productionYear: 2021,
        notes: 'Commuter motorcycle',
      };

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles',
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
        slug: 'yamaha-mt-07',
        name: 'Yamaha MT-07',
        brand: 'Yamaha',
        vehicleModel: 'MT-07',
        type: 'motorcycle',
        productionYear: 2021,
        notes: 'Commuter motorcycle',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('creates a vehicle with explicit valid slug', async () => {
      const ownerId = await createIntegrationUser({
        firstName: 'Slug',
        lastName: 'Owner',
        email: 'vehicle-slug-owner@example.com',
      });

      const payload = {
        name: 'Daily Driver Car',
        slug: 'my-custom-daily-car',
        type: 'car',
      };

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(
        expect.objectContaining({
          name: 'Daily Driver Car',
          slug: 'my-custom-daily-car',
          type: 'car',
        }),
      );
    });

    it('rejects vehicle creation with 409 when name already exists for the user', async () => {
      const ownerId = await createIntegrationUser({
        email: 'duplicate-name@example.com',
      });

      await createIntegrationVehicle({
        ownerId,
        name: 'Honda Civic',
        slug: 'honda-civic',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          name: 'Honda Civic',
          type: 'car',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toEqual(
        expect.objectContaining({
          error: 'Conflict',
          code: 'VEHICLE_NAME_ALREADY_EXISTS_ERROR',
        }),
      );
    });

    it('rejects vehicle creation with 409 when slug already exists for the user', async () => {
      const ownerId = await createIntegrationUser({
        email: 'duplicate-slug@example.com',
      });

      await createIntegrationVehicle({
        ownerId,
        name: 'Honda Civic First',
        slug: 'custom-civic-slug',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          name: 'Honda Civic Second',
          slug: 'custom-civic-slug',
          type: 'car',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toEqual(
        expect.objectContaining({
          error: 'Conflict',
          code: 'VEHICLE_SLUG_ALREADY_EXISTS_ERROR',
        }),
      );
    });

    it('allows different users to have vehicles with identical names and slugs', async () => {
      const userA = await createIntegrationUser({ email: 'userA@example.com' });
      const userB = await createIntegrationUser({ email: 'userB@example.com' });

      await createIntegrationVehicle({
        ownerId: userA,
        name: 'Toyota Corolla',
        slug: 'toyota-corolla',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
        payload: {
          name: 'Toyota Corolla',
          type: 'car',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().ownerId).toBe(userB.toString());
      expect(response.json().slug).toBe('toyota-corolla');
    });

    it('returns 400 Bad Request on invalid payload', async () => {
      const ownerId = await createIntegrationUser({ email: 'bad-payload@example.com' });

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          // Missing required 'type' and 'name'
          brand: 'Toyota',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns 401 Unauthorized without auth token', async () => {
      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles',
        payload: {
          name: 'Test Car',
          type: 'car',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/vehicles', () => {
    it('returns all vehicles owned by the authenticated user sorted by createdAt asc', async () => {
      const ownerId = await createIntegrationUser({ email: 'list-owner@example.com' });
      const otherUserId = await createIntegrationUser({
        email: 'list-other@example.com',
      });

      const vehicle1 = buildVehicleDoc({
        ownerId,
        name: 'Bike One',
        slug: 'bike-one',
        type: 'motorcycle',
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
      });
      const vehicle2 = buildVehicleDoc({
        ownerId,
        name: 'Car Two',
        slug: 'car-two',
        type: 'car',
        createdAt: new Date('2026-01-02T10:00:00.000Z'),
      });
      const otherUserVehicle = buildVehicleDoc({
        ownerId: otherUserId,
        name: 'Other Car',
        slug: 'other-car',
        type: 'car',
      });

      await insertVehicles([vehicle1, vehicle2, otherUserVehicle]);

      const response = await getApp().inject({
        method: 'GET',
        url: '/api/vehicles',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveLength(2);
      expect(json[0].id).toBe(vehicle1._id.toString());
      expect(json[0].name).toBe('Bike One');
      expect(json[1].id).toBe(vehicle2._id.toString());
      expect(json[1].name).toBe('Car Two');
    });

    it('returns empty array when user has no vehicles', async () => {
      const ownerId = await createIntegrationUser({
        email: 'empty-vehicles@example.com',
      });

      const response = await getApp().inject({
        method: 'GET',
        url: '/api/vehicles',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('returns 401 Unauthorized without auth token', async () => {
      const response = await getApp().inject({
        method: 'GET',
        url: '/api/vehicles',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/vehicles/:vehicleId', () => {
    it('retrieves vehicle by MongoDB _id', async () => {
      const ownerId = await createIntegrationUser({ email: 'get-by-id@example.com' });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Mazda MX-5',
        slug: 'mazda-mx-5',
        type: 'car',
        brand: 'Mazda',
        vehicleModel: 'MX-5',
      });

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: vehicle._id.toString(),
          ownerId: ownerId.toString(),
          name: 'Mazda MX-5',
          slug: 'mazda-mx-5',
          brand: 'Mazda',
          vehicleModel: 'MX-5',
        }),
      );
    });

    it('retrieves vehicle by slug', async () => {
      const ownerId = await createIntegrationUser({ email: 'get-by-slug@example.com' });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Mazda MX-5',
        slug: 'mazda-mx-5',
        type: 'car',
      });

      const response = await getApp().inject({
        method: 'GET',
        url: '/api/vehicles/mazda-mx-5',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().id).toBe(vehicle._id.toString());
      expect(response.json().slug).toBe('mazda-mx-5');
    });

    it('returns 404 Not Found for non-existent vehicle identifier', async () => {
      const ownerId = await createIntegrationUser({ email: 'not-found@example.com' });
      const randomId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${randomId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          error: 'Not Found',
          code: 'VEHICLE_NOT_FOUND_ERROR',
        }),
      );
    });

    it("returns 404 Not Found when trying to access another user's vehicle", async () => {
      const userA = await createIntegrationUser({ email: 'userA-get@example.com' });
      const userB = await createIntegrationUser({ email: 'userB-get@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'User A Bike',
        slug: 'user-a-bike',
      });

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleA._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_NOT_FOUND_ERROR');
    });
  });

  describe('PATCH /api/vehicles/:vehicleId', () => {
    it('updates vehicle fields by _id', async () => {
      const ownerId = await createIntegrationUser({ email: 'update-by-id@example.com' });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Project Bike',
        slug: 'project-bike',
        brand: 'Honda',
        notes: 'Initial notes',
      });

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          notes: 'Updated project bike notes',
          productionYear: 2018,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: vehicle._id.toString(),
          name: 'Project Bike',
          slug: 'project-bike',
          notes: 'Updated project bike notes',
          productionYear: 2018,
        }),
      );
    });

    it('updates vehicle by slug with explicit new slug and name', async () => {
      const ownerId = await createIntegrationUser({
        email: 'update-by-slug@example.com',
      });
      await createIntegrationVehicle({
        ownerId,
        name: 'Old Bike Name',
        slug: 'old-bike-name',
      });

      const response = await getApp().inject({
        method: 'PATCH',
        url: '/api/vehicles/old-bike-name',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          name: 'New Bike Name',
          slug: 'new-bike-name',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().name).toBe('New Bike Name');
      expect(response.json().slug).toBe('new-bike-name');
    });

    it('returns 409 Conflict when updated name collides with another vehicle', async () => {
      const ownerId = await createIntegrationUser({
        email: 'update-conflict@example.com',
      });
      await createIntegrationVehicle({
        ownerId,
        name: 'Vehicle One',
        slug: 'vehicle-one',
      });
      const vehicle2 = await createIntegrationVehicle({
        ownerId,
        name: 'Vehicle Two',
        slug: 'vehicle-two',
      });

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle2._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          name: 'Vehicle One',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json().code).toBe('VEHICLE_NAME_ALREADY_EXISTS_ERROR');
    });

    it("returns 404 Not Found when updating another user's vehicle", async () => {
      const userA = await createIntegrationUser({ email: 'userA-patch@example.com' });
      const userB = await createIntegrationUser({ email: 'userB-patch@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'User A Car',
        slug: 'user-a-car',
      });

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicleA._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
        payload: {
          notes: 'Malicious update attempt',
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_NOT_FOUND_ERROR');
    });
  });

  describe('DELETE /api/vehicles/:vehicleId', () => {
    it('successfully deletes vehicle by _id when it has no dependencies', async () => {
      const ownerId = await createIntegrationUser({ email: 'delete-by-id@example.com' });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Car To Delete',
        slug: 'car-to-delete',
      });

      const response = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(204);

      // Verify it is gone
      const getResponse = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('successfully deletes vehicle by slug when it has no dependencies', async () => {
      const ownerId = await createIntegrationUser({
        email: 'delete-by-slug@example.com',
      });
      await createIntegrationVehicle({
        ownerId,
        name: 'Slug Delete Car',
        slug: 'slug-delete-car',
      });

      const response = await getApp().inject({
        method: 'DELETE',
        url: '/api/vehicles/slug-delete-car',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(204);
    });

    it('rejects deletion with 403 Forbidden when vehicle has associated fuel entries', async () => {
      const ownerId = await createIntegrationUser({
        email: 'delete-fuel-dep@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Car With Fuel',
        slug: 'car-with-fuel',
      });

      await insertFuelEntries([
        buildFuelEntryDoc({
          ownerId,
          vehicleId: vehicle._id,
        }),
      ]);

      const response = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual(
        expect.objectContaining({
          error: 'Forbidden',
          code: 'VEHICLE_DEPENDENCY_ERROR',
        }),
      );
    });

    it('rejects deletion with 403 when vehicle has maintenance records', async () => {
      const ownerId = await createIntegrationUser({
        email: 'delete-maint-dep@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Car With Maintenance',
        slug: 'car-with-maintenance',
      });

      await insertMaintenanceRecords([
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
        }),
      ]);

      const response = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json().code).toBe('VEHICLE_DEPENDENCY_ERROR');
    });

    it('rejects deletion with 403 when vehicle has equipment items', async () => {
      const ownerId = await createIntegrationUser({
        email: 'delete-equip-dep@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Car With Equipment',
        slug: 'car-with-equipment',
      });

      await insertEquipmentItems([
        buildEquipmentDoc({
          ownerId,
          vehicleId: vehicle._id,
        }),
      ]);

      const response = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json().code).toBe('VEHICLE_DEPENDENCY_ERROR');
    });

    it("returns 404 Not Found when trying to delete another user's vehicle", async () => {
      const userA = await createIntegrationUser({ email: 'userA-del@example.com' });
      const userB = await createIntegrationUser({ email: 'userB-del@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'User A Car',
        slug: 'user-a-car',
      });

      const response = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicleA._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_NOT_FOUND_ERROR');
    });
  });
});
