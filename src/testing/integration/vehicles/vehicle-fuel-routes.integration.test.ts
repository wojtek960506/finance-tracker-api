import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { createIntegrationAccessToken } from '../auth';
import { createIntegrationUser } from '../fixtures/users';
import {
  buildFuelEntryDoc,
  createIntegrationVehicle,
  insertFuelEntries,
} from '../fixtures/vehicles';
import { setupIntegrationSuite } from '../suite';

describe('vehicle fuel routes integration', () => {
  const { getApp } = setupIntegrationSuite();

  describe('POST /api/vehicles/:vehicleId/fuel', () => {
    it('creates a fuel entry for vehicle by _id', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-create-id@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Fuel Test Car',
        slug: 'fuel-test-car',
      });

      const payload = {
        date: '2026-05-01T10:00:00.000Z',
        fuelLiters: 42.5,
        isFullTank: true,
        unitPricePln: 6.5,
        costPln: 276.25,
        odometerKm: 50000,
        stationBrand: 'Orlen',
        stationAddress: 'Warszawa, ul. Testowa 10',
        description: 'First test refuel',
      };

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel`,
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
        fuelLiters: 42.5,
        isFullTank: true,
        unitPricePln: 6.5,
        costPln: 276.25,
        odometerKm: 50000,
        stationBrand: 'Orlen',
        stationAddress: 'Warszawa, ul. Testowa 10',
        description: 'First test refuel',
        transactionId: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('creates a fuel entry for vehicle by slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-create-slug@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Fuel Slug Car',
        slug: 'fuel-slug-car',
      });

      const payload = {
        date: '2026-05-02T10:00:00.000Z',
        fuelLiters: 30,
        isFullTank: false,
        unitPricePln: 6.4,
        costPln: 192,
        odometerKm: 50400,
      };

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/fuel-slug-car/fuel',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(
        expect.objectContaining({
          vehicleId: vehicle._id.toString(),
          fuelLiters: 30,
          isFullTank: false,
          odometerKm: 50400,
        }),
      );
    });

    it('rejects refuel when odometer is lower than earlier entry', async () => {
      const ownerId = await createIntegrationUser({
        email: 'odometer-too-low@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Odometer Car',
        slug: 'odometer-car',
      });

      await insertFuelEntries([
        buildFuelEntryDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-05-01T10:00:00.000Z'),
          odometerKm: 50000,
        }),
      ]);

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          date: '2026-05-05T10:00:00.000Z',
          fuelLiters: 20,
          isFullTank: true,
          unitPricePln: 6.5,
          costPln: 130,
          odometerKm: 49900, // Invalid: lower than 50000 on earlier date
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_ODOMETER_SEQUENCE_ERROR',
        }),
      );
    });

    it('rejects refuel when odometer is higher than later entry', async () => {
      const ownerId = await createIntegrationUser({
        email: 'odometer-too-high@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Odometer Car 2',
        slug: 'odometer-car-2',
      });

      await insertFuelEntries([
        buildFuelEntryDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-05-10T10:00:00.000Z'),
          odometerKm: 51000,
        }),
      ]);

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          date: '2026-05-05T10:00:00.000Z',
          fuelLiters: 20,
          isFullTank: true,
          unitPricePln: 6.5,
          costPln: 130,
          odometerKm: 51200, // Invalid: higher than 51000 on later date
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().code).toBe('VEHICLE_ODOMETER_SEQUENCE_ERROR');
    });

    it('returns 404 Not Found if vehicle does not exist', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-404-vehicle@example.com',
      });
      const nonExistentId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${nonExistentId}/fuel`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          date: '2026-05-01T10:00:00.000Z',
          fuelLiters: 15,
          isFullTank: true,
          unitPricePln: 6.5,
          costPln: 97.5,
          odometerKm: 20000,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_NOT_FOUND_ERROR');
    });

    it('returns 401 Unauthorized without auth token', async () => {
      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/some-vehicle/fuel',
        payload: {
          date: '2026-05-01T10:00:00.000Z',
          fuelLiters: 15,
          isFullTank: true,
          unitPricePln: 6.5,
          costPln: 97.5,
          odometerKm: 20000,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/vehicles/:vehicleId/fuel', () => {
    it('returns enriched fuel entries sorted newest first with calculations', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-list-enrich@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Calculation Car',
        slug: 'calc-car',
      });

      const entry1 = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-01T10:00:00.000Z'),
        odometerKm: 10000,
        fuelLiters: 40,
        costPln: 240,
        unitPricePln: 6.0,
        isFullTank: true,
      });

      const entry2 = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-08T10:00:00.000Z'),
        odometerKm: 10500,
        fuelLiters: 30,
        costPln: 180,
        unitPricePln: 6.0,
        isFullTank: true,
      });

      await insertFuelEntries([entry1, entry2]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const items = response.json();
      expect(items).toHaveLength(2);

      // Newest entry first (entry2)
      expect(items[0]).toEqual(
        expect.objectContaining({
          id: entry2._id.toString(),
          odometerKm: 10500,
          distanceSincePreviousKm: 500,
          distanceSincePreviousFullKm: 500,
          fuelLitersToFull: 30,
          costToFullPln: 180,
          consumptionLPer100Km: 6, // (30 / 500) * 100 = 6
          costPerKmPln: 0.36, // 180 / 500 = 0.36
          kmPerLiter: 16.67, // 500 / 30 = 16.67
        }),
      );

      // First entry (baseline, no previous distance)
      expect(items[1]).toEqual(
        expect.objectContaining({
          id: entry1._id.toString(),
          odometerKm: 10000,
          distanceSincePreviousKm: null,
          distanceSincePreviousFullKm: null,
          consumptionLPer100Km: null,
        }),
      );
    });

    it('filters fuel entries by isFullTank and date range', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-filter@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Filter Car',
        slug: 'filter-car',
      });

      const fullTankEntry = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-01T10:00:00.000Z'),
        odometerKm: 10000,
        isFullTank: true,
      });
      const partialTankEntry = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-05T10:00:00.000Z'),
        odometerKm: 10300,
        isFullTank: false,
      });
      const outsideRangeEntry = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-20T10:00:00.000Z'),
        odometerKm: 11000,
        isFullTank: true,
      });

      await insertFuelEntries([fullTankEntry, partialTankEntry, outsideRangeEntry]);

      const response = await getApp().inject({
        method: 'GET',
        url:
          `/api/vehicles/${vehicle._id.toString()}/fuel?` +
          'isFullTank=true&startDate=2026-05-01T00:00:00.000Z&endDate=2026-05-10T23:59:59.000Z',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const items = response.json();
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(fullTankEntry._id.toString());
    });

    it('applies pagination when page and limit query params are provided', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-pagination@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Paged Fuel Car',
        slug: 'paged-fuel-car',
      });

      const entry1 = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-01T10:00:00.000Z'),
        odometerKm: 10000,
      });
      const entry2 = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-08T10:00:00.000Z'),
        odometerKm: 10500,
      });

      await insertFuelEntries([entry1, entry2]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel?page=2&limit=1`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const items = response.json();
      expect(items).toHaveLength(1);
      // Page 2 with limit 1 should return older entry1
      expect(items[0].id).toBe(entry1._id.toString());
    });

    it('excludes fuel entries from other vehicles and users', async () => {
      const userA = await createIntegrationUser({ email: 'userA-fuel@example.com' });
      const userB = await createIntegrationUser({ email: 'userB-fuel@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'Car A',
        slug: 'car-a',
      });
      const vehicleB = await createIntegrationVehicle({
        ownerId: userB,
        name: 'Car B',
        slug: 'car-b',
      });

      await insertFuelEntries([
        buildFuelEntryDoc({
          ownerId: userA,
          vehicleId: vehicleA._id,
          odometerKm: 10000,
        }),
        buildFuelEntryDoc({
          ownerId: userB,
          vehicleId: vehicleB._id,
          odometerKm: 20000,
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleA._id.toString()}/fuel`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userA.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const items = response.json();
      expect(items).toHaveLength(1);
      expect(items[0].vehicleId).toBe(vehicleA._id.toString());
    });
  });

  describe('GET /api/vehicles/:vehicleId/fuel/:entryId', () => {
    it('retrieves single fuel entry by id', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-get-single@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Single Entry Car',
        slug: 'single-entry-car',
      });

      const entry = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        odometerKm: 15000,
        fuelLiters: 35,
        costPln: 210,
        stationBrand: 'Shell',
      });

      await insertFuelEntries([entry]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${entry._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: entry._id.toString(),
          vehicleId: vehicle._id.toString(),
          fuelLiters: 35,
          costPln: 210,
          stationBrand: 'Shell',
        }),
      );
    });

    it('returns 404 Not Found for non-existent entry id', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-get-404@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Car 404',
        slug: 'car-404',
      });
      const randomEntryId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${randomEntryId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR');
    });

    it("returns 404 Not Found for another user's fuel entry", async () => {
      const userA = await createIntegrationUser({ email: 'userA-entry@example.com' });
      const userB = await createIntegrationUser({ email: 'userB-entry@example.com' });

      const vehicleA = await createIntegrationVehicle({
        ownerId: userA,
        name: 'Car A',
        slug: 'car-a',
      });

      const entryA = buildFuelEntryDoc({
        ownerId: userA,
        vehicleId: vehicleA._id,
      });
      await insertFuelEntries([entryA]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleA._id.toString()}/fuel/${entryA._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_NOT_FOUND_ERROR');
    });
  });

  describe('PATCH /api/vehicles/:vehicleId/fuel/:entryId', () => {
    it('updates fuel entry fields', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-patch@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch Car',
        slug: 'patch-car',
      });

      const entry = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        fuelLiters: 30,
        costPln: 180,
        stationBrand: 'Old Brand',
      });
      await insertFuelEntries([entry]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${entry._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          fuelLiters: 32,
          costPln: 192,
          stationBrand: 'BP',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: entry._id.toString(),
          fuelLiters: 32,
          costPln: 192,
          stationBrand: 'BP',
        }),
      );
    });

    it('rejects update if modified odometer violates chronological sequence', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-patch-seq@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Seq Car',
        slug: 'seq-car',
      });

      const entry1 = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-01T10:00:00.000Z'),
        odometerKm: 10000,
      });
      const entry2 = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        date: new Date('2026-05-10T10:00:00.000Z'),
        odometerKm: 10500,
      });
      await insertFuelEntries([entry1, entry2]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${entry2._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          odometerKm: 9900, // Invalid: lower than entry1 on earlier date
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().code).toBe('VEHICLE_ODOMETER_SEQUENCE_ERROR');
    });

    it('returns 404 Not Found when updating non-existent fuel entry', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-patch-404@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch 404 Car',
        slug: 'patch-404-car',
      });
      const randomEntryId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${randomEntryId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          fuelLiters: 25,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR');
    });
  });

  describe('DELETE /api/vehicles/:vehicleId/fuel/:entryId', () => {
    it('successfully deletes a fuel entry', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-delete@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete Fuel Car',
        slug: 'delete-fuel-car',
      });

      const entry = buildFuelEntryDoc({
        ownerId,
        vehicleId: vehicle._id,
        odometerKm: 12000,
      });
      await insertFuelEntries([entry]);

      const response = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${entry._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(204);

      // Verify deletion
      const getResponse = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${entry._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('returns 404 Not Found when deleting non-existent fuel entry', async () => {
      const ownerId = await createIntegrationUser({
        email: 'fuel-delete-404@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete 404 Car',
        slug: 'delete-404-car',
      });
      const randomEntryId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}/fuel/${randomEntryId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe('VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR');
    });
  });
});
