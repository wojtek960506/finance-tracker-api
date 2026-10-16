import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { createIntegrationAccessToken } from '../auth';
import { createIntegrationUser } from '../fixtures/users';
import {
  buildMaintenanceDoc,
  createIntegrationVehicle,
  insertMaintenanceRecords,
} from '../fixtures/vehicles';
import { setupIntegrationSuite } from '../suite';

describe('vehicle maintenance routes integration', () => {
  const { getApp } = setupIntegrationSuite();

  describe('POST /api/vehicles/:vehicleId/maintenance', () => {
    it('creates a maintenance record for vehicle by _id', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-create-id@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Maintenance Test Car',
        slug: 'maintenance-test-car',
      });

      const payload = {
        section: 'ownMaintenance',
        date: '2026-05-01T10:00:00.000Z',
        costPln: 650,
        odometerKm: 55000,
        description: 'Oil, filters and brake fluid',
        serviceProvider: 'Garage Warsaw',
        serviceAddress: 'Warszawa, ul. Serwisowa 5',
      };

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance`,
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
        section: 'ownMaintenance',
        date: '2026-05-01T10:00:00.000Z',
        costPln: 650,
        odometerKm: 55000,
        description: 'Oil, filters and brake fluid',
        serviceProvider: 'Garage Warsaw',
        serviceAddress: 'Warszawa, ul. Serwisowa 5',
        transactionId: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('creates a maintenance record for vehicle by slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-create-slug@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Maintenance Slug Car',
        slug: 'maintenance-slug-car',
      });

      const payload = {
        section: 'previousOwnerServices',
        date: '2026-01-10T12:00:00.000Z',
        costPln: 1200,
        description: 'Timing belt replacement by previous owner',
      };

      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/maintenance-slug-car/maintenance',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(
        expect.objectContaining({
          vehicleId: vehicle._id.toString(),
          section: 'previousOwnerServices',
          costPln: 1200,
          description: 'Timing belt replacement by previous owner',
        }),
      );
    });

    it('creates a maintenance record with optional transactionId', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-create-tx@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Maintenance Tx Car',
        slug: 'maintenance-tx-car',
      });
      const txId = new Types.ObjectId().toString();

      const payload = {
        section: 'ownMaintenance',
        date: '2026-04-10T09:00:00.000Z',
        costPln: 250,
        description: 'Brake pad replacement',
        transactionId: txId,
      };

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(
        expect.objectContaining({
          transactionId: txId,
          section: 'ownMaintenance',
          costPln: 250,
        }),
      );
    });

    it('rejects creation if vehicle belongs to another user', async () => {
      const userA = await createIntegrationUser({ email: 'maint-a@example.com' });
      const userB = await createIntegrationUser({ email: 'maint-b@example.com' });
      const vehicle = await createIntegrationVehicle({
        ownerId: userA,
        name: 'User A Car',
        slug: 'user-a-car',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
        payload: {
          section: 'ownMaintenance',
          date: '2026-05-01T10:00:00.000Z',
          costPln: 300,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects creation with invalid section enum', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-invalid-sec@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Invalid Section Car',
        slug: 'invalid-section-car',
      });

      const response = await getApp().inject({
        method: 'POST',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          section: 'non_existent_section',
          date: '2026-05-01T10:00:00.000Z',
          costPln: 300,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects unauthenticated request', async () => {
      const response = await getApp().inject({
        method: 'POST',
        url: '/api/vehicles/any-id/maintenance',
        payload: {
          section: 'ownMaintenance',
          date: '2026-05-01T10:00:00.000Z',
          costPln: 300,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/vehicles/:vehicleId/maintenance', () => {
    it('returns maintenance records sorted newest first with pagination', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-list@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'List Maint Car',
        slug: 'list-maint-car',
      });

      await insertMaintenanceRecords([
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-10T10:00:00.000Z'),
          costPln: 100,
          description: 'Older record',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-03-20T10:00:00.000Z'),
          costPln: 200,
          description: 'Newer record',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-02-15T10:00:00.000Z'),
          costPln: 150,
          description: 'Middle record',
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.items).toHaveLength(3);
      expect(json.items[0].description).toBe('Newer record');
      expect(json.items[1].description).toBe('Middle record');
      expect(json.items[2].description).toBe('Older record');
      expect(json.pagination.total).toBe(3);
    });

    it('filters maintenance records by section', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-filter-sec@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Sec Filter Car',
        slug: 'sec-filter-car',
      });

      await insertMaintenanceRecords([
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          section: 'ownMaintenance',
          costPln: 100,
          description: 'Own maint',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          section: 'previousOwnerServices',
          costPln: 200,
          description: 'Prev owner service',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          section: 'ownMaintenance',
          costPln: 300,
          description: 'Oil change 2',
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance?section=previousOwnerServices`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.items).toHaveLength(1);
      expect(json.items[0].description).toBe('Prev owner service');
      expect(json.items[0].section).toBe('previousOwnerServices');
      expect(json.summary.totalCostPln).toBe(0);
      expect(json.summary.totalRecords).toBe(0);
      expect(json.pagination.total).toBe(1);
    });

    it('filters maintenance records by date range', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-filter-date@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Date Filter Car',
        slug: 'date-filter-car',
      });

      await insertMaintenanceRecords([
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-01T00:00:00.000Z'),
          description: 'Jan maint',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-02-15T00:00:00.000Z'),
          description: 'Feb maint',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-03-30T00:00:00.000Z'),
          description: 'Mar maint',
        }),
      ]);

      const query =
        'startDate=2026-02-01T00:00:00.000Z&' + 'endDate=2026-02-28T23:59:59.999Z';
      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance?${query}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.items).toHaveLength(1);
      expect(json.items[0].description).toBe('Feb maint');
    });

    it('respects cursor and limit query parameters', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-pagination@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Pagination Car',
        slug: 'pagination-car',
      });

      await insertMaintenanceRecords([
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-01T00:00:00.000Z'),
          description: 'Entry 1',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-02T00:00:00.000Z'),
          description: 'Entry 2',
        }),
        buildMaintenanceDoc({
          ownerId,
          vehicleId: vehicle._id,
          date: new Date('2026-01-03T00:00:00.000Z'),
          description: 'Entry 3',
        }),
      ]);

      const firstPageResponse = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance?limit=1`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(firstPageResponse.statusCode).toBe(200);
      const firstPage = firstPageResponse.json();
      expect(firstPage.items).toHaveLength(1);
      expect(firstPage.items[0].description).toBe('Entry 3');
      expect(firstPage.pagination.hasMore).toBe(true);
      expect(firstPage.pagination.nextCursor).toBeTruthy();
      expect(firstPage.pagination.total).toBe(3);

      const vehicleId = vehicle._id.toString();
      const nextCursor = firstPage.pagination.nextCursor;
      const secondPageResponse = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleId}/maintenance?cursor=${nextCursor}&limit=1`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(secondPageResponse.statusCode).toBe(200);
      const secondPage = secondPageResponse.json();
      expect(secondPage.items).toHaveLength(1);
      expect(secondPage.items[0].description).toBe('Entry 2');
      expect(secondPage.pagination.hasMore).toBe(true);
      expect(secondPage.pagination.nextCursor).toBeTruthy();
    });

    it('does not return records belonging to other users', async () => {
      const userA = await createIntegrationUser({ email: 'maint-iso-a@example.com' });
      const userB = await createIntegrationUser({ email: 'maint-iso-b@example.com' });

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

      await insertMaintenanceRecords([
        buildMaintenanceDoc({
          ownerId: userA,
          vehicleId: vehicleA._id,
          description: 'User A maint',
        }),
        buildMaintenanceDoc({
          ownerId: userB,
          vehicleId: vehicleB._id,
          description: 'User B maint',
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleA._id.toString()}/maintenance`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userA.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.items).toHaveLength(1);
      expect(json.items[0].description).toBe('User A maint');
    });

    it('returns 404 when vehicle not found or belongs to another user', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-notfound@example.com',
      });
      const nonExistentId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${nonExistentId}/maintenance`,
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

  describe('GET /api/vehicles/:vehicleId/maintenance/:recordId', () => {
    it('returns single maintenance record by ID', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-get-single@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Single Maint Car',
        slug: 'single-maint-car',
      });

      const recordDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        section: 'ownMaintenance',
        costPln: 450,
        odometerKm: 42000,
        description: 'Brake pads replacement',
        serviceProvider: 'Quick Brake Workshop',
      });
      await insertMaintenanceRecords([recordDoc]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: recordDoc._id.toString(),
          vehicleId: vehicle._id.toString(),
          costPln: 450,
          odometerKm: 42000,
          description: 'Brake pads replacement',
          serviceProvider: 'Quick Brake Workshop',
        }),
      );
    });

    it('returns single maintenance record by vehicle slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-slug-get@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Single Slug Maint Car',
        slug: 'single-slug-maint-car',
      });

      const recordDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        description: 'Tire rotation',
      });
      await insertMaintenanceRecords([recordDoc]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/single-slug-maint-car/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: recordDoc._id.toString(),
          description: 'Tire rotation',
        }),
      );
    });

    it('returns 404 when maintenance record does not exist', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-missing@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Missing Maint Car',
        slug: 'missing-maint-car',
      });
      const nonExistentRecordId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${nonExistentRecordId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_MAINTENANCE_NOT_FOUND_ERROR',
        }),
      );
    });

    it('returns 404 when maintenance record belongs to another user', async () => {
      const userA = await createIntegrationUser({ email: 'maint-other-a@example.com' });
      const userB = await createIntegrationUser({ email: 'maint-other-b@example.com' });
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

      const recordDoc = buildMaintenanceDoc({
        ownerId: userA,
        vehicleId: vehicleA._id,
        description: 'User A private maint',
      });
      await insertMaintenanceRecords([recordDoc]);

      const response = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicleB._id.toString()}/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/vehicles/:vehicleId/maintenance/:recordId', () => {
    it('updates maintenance record fields', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-patch@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch Maint Car',
        slug: 'patch-maint-car',
      });

      const recordDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        section: 'ownMaintenance',
        costPln: 300,
        description: 'Original description',
        serviceProvider: 'Original Service',
      });
      await insertMaintenanceRecords([recordDoc]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          costPln: 450,
          description: 'Updated description',
          serviceProvider: 'Updated Service',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          id: recordDoc._id.toString(),
          costPln: 450,
          description: 'Updated description',
          serviceProvider: 'Updated Service',
        }),
      );
    });

    it('updates maintenance record via vehicle slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-patch-slug@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Slug Patch Car',
        slug: 'slug-patch-car',
      });

      const recordDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        costPln: 100,
      });
      await insertMaintenanceRecords([recordDoc]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/slug-patch-car/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
        payload: {
          costPln: 180,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          costPln: 180,
        }),
      );
    });

    it('returns 404 when updating non-existent maintenance record', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-patch-404@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch 404 Car',
        slug: 'patch-404-car',
      });
      const nonExistentRecordId = new Types.ObjectId().toString();

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${nonExistentRecordId}`,
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
          code: 'VEHICLE_MAINTENANCE_NOT_FOUND_ERROR',
        }),
      );
    });

    it('rejects invalid patch payload (e.g. negative cost)', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-patch-neg@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Patch Neg Car',
        slug: 'patch-neg-car',
      });

      const recordDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        costPln: 100,
      });
      await insertMaintenanceRecords([recordDoc]);

      const response = await getApp().inject({
        method: 'PATCH',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${recordDoc._id.toString()}`,
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

  describe('DELETE /api/vehicles/:vehicleId/maintenance/:recordId', () => {
    it('deletes maintenance record and returns 204', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-del@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete Maint Car',
        slug: 'delete-maint-car',
      });

      const recordDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
        description: 'To be deleted',
      });
      await insertMaintenanceRecords([recordDoc]);

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(204);

      // Verify deletion by attempting to GET
      const getResponse = await getApp().inject({
        method: 'GET',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it('deletes maintenance record via vehicle slug', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-del-slug@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete Slug Maint Car',
        slug: 'delete-slug-maint-car',
      });

      const recordDoc = buildMaintenanceDoc({
        ownerId,
        vehicleId: vehicle._id,
      });
      await insertMaintenanceRecords([recordDoc]);

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/delete-slug-maint-car/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(204);
    });

    it('returns 404 when deleting non-existent maintenance record', async () => {
      const ownerId = await createIntegrationUser({
        email: 'maint-del-404@example.com',
      });
      const vehicle = await createIntegrationVehicle({
        ownerId,
        name: 'Delete 404 Car',
        slug: 'delete-404-car',
      });
      const nonExistentRecordId = new Types.ObjectId().toString();

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle._id.toString()}/maintenance/${nonExistentRecordId}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(404);
      expect(deleteResponse.json()).toEqual(
        expect.objectContaining({
          code: 'VEHICLE_MAINTENANCE_NOT_FOUND_ERROR',
        }),
      );
    });

    it('returns 404 when deleting record belonging to another user', async () => {
      const userA = await createIntegrationUser({ email: 'maint-del-a@example.com' });
      const userB = await createIntegrationUser({ email: 'maint-del-b@example.com' });
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

      const recordDoc = buildMaintenanceDoc({
        ownerId: userA,
        vehicleId: vehicleA._id,
      });
      await insertMaintenanceRecords([recordDoc]);

      const deleteResponse = await getApp().inject({
        method: 'DELETE',
        url: `/api/vehicles/${vehicleB._id.toString()}/maintenance/${recordDoc._id.toString()}`,
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(userB.toString())}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(404);
    });
  });
});
