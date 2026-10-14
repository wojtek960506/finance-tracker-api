import {
  IVehicle,
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
  VehicleModel,
} from '@vehicles/model';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getVehiclesSummary } from './get-vehicles-summary';

describe('getVehiclesSummary service', () => {
  const ownerId = new Types.ObjectId().toString();
  const vehicle1Id = new Types.ObjectId();
  const vehicle2Id = new Types.ObjectId();

  const mockVehicleDoc = (data: Partial<IVehicle> = {}): IVehicle =>
    ({
      _id: data._id || vehicle1Id,
      ownerId: new Types.ObjectId(ownerId),
      slug: data.slug || 'toyota-corolla',
      name: data.name || 'Toyota Corolla',
      brand: 'Toyota',
      vehicleModel: 'Corolla',
      type: 'car',
      productionYear: 2018,
      notes: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    }) as unknown as IVehicle;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty summary and list when user has no vehicles', async () => {
    const sortMock = vi.fn().mockResolvedValue([]);
    vi.spyOn(VehicleModel, 'find').mockReturnValue({ sort: sortMock } as any);
    vi.spyOn(VehicleFuelEntryModel, 'aggregate').mockResolvedValue([]);
    vi.spyOn(VehicleMaintenanceModel, 'aggregate').mockResolvedValue([]);
    vi.spyOn(VehicleEquipmentModel, 'aggregate').mockResolvedValue([]);

    const result = await getVehiclesSummary(ownerId);

    expect(result).toEqual({
      summary: {
        totalVehicles: 0,
        totalSpentPln: 0,
        totalFuelSpentPln: 0,
        totalMaintenanceSpentPln: 0,
        totalEquipmentSpentPln: 0,
        totalDistanceKm: 0,
      },
      vehicles: [],
    });
  });

  it('aggregates fuel, maintenance, and equipment correctly across multiple vehicles', async () => {
    const v1 = mockVehicleDoc({ _id: vehicle1Id, name: 'Daily Car' });
    const v2 = mockVehicleDoc({
      _id: vehicle2Id,
      name: 'Weekend Bike',
      type: 'motorcycle',
    });

    const sortMock = vi.fn().mockResolvedValue([v1, v2]);
    vi.spyOn(VehicleModel, 'find').mockReturnValue({ sort: sortMock } as any);

    vi.spyOn(VehicleFuelEntryModel, 'aggregate').mockResolvedValue([
      {
        _id: vehicle1Id,
        fuelTotalPln: 2200,
        lastOdometerKm: 142500,
        firstOdometerKm: 135000,
        fuelEntriesCount: 14,
      },
      {
        _id: vehicle2Id,
        fuelTotalPln: 500,
        lastOdometerKm: 18000,
        firstOdometerKm: 15000,
        fuelEntriesCount: 5,
      },
    ]);

    vi.spyOn(VehicleMaintenanceModel, 'aggregate').mockResolvedValue([
      {
        _id: vehicle1Id,
        maintenanceTotalPln: 1500,
        lastOdometerKm: 141000,
        firstOdometerKm: 138000,
        maintenanceCount: 3,
      },
      {
        _id: vehicle2Id,
        maintenanceTotalPln: 300,
        lastOdometerKm: 19500,
        firstOdometerKm: 16000,
        maintenanceCount: 2,
      },
    ]);

    vi.spyOn(VehicleEquipmentModel, 'aggregate').mockResolvedValue([
      {
        _id: vehicle1Id,
        equipmentTotalPln: 450,
        equipmentCount: 2,
      },
      {
        _id: vehicle2Id,
        equipmentTotalPln: 100,
        equipmentCount: 1,
      },
    ]);

    const result = await getVehiclesSummary(ownerId);

    expect(result.summary).toEqual({
      totalVehicles: 2,
      totalSpentPln: 5050,
      totalFuelSpentPln: 2700,
      totalMaintenanceSpentPln: 1800,
      totalEquipmentSpentPln: 550,
      totalDistanceKm: 12000,
    });

    expect(result.vehicles).toHaveLength(2);

    // Vehicle 1: max(142500, 141000) = 142500, min(135000, 138000) = 135000 -> delta = 7500
    expect(result.vehicles[0].spending).toEqual({
      fuelTotalPln: 2200,
      maintenanceTotalPln: 1500,
      equipmentTotalPln: 450,
      totalSpentPln: 4150,
      lastOdometerKm: 142500,
      totalDistanceKm: 7500,
      fuelEntriesCount: 14,
      maintenanceCount: 3,
      equipmentCount: 2,
    });

    // Vehicle 2: max(18000, 19500) = 19500, min(15000, 16000) = 15000 -> delta = 4500
    expect(result.vehicles[1].spending).toEqual({
      fuelTotalPln: 500,
      maintenanceTotalPln: 300,
      equipmentTotalPln: 100,
      totalSpentPln: 900,
      lastOdometerKm: 19500,
      totalDistanceKm: 4500,
      fuelEntriesCount: 5,
      maintenanceCount: 2,
      equipmentCount: 1,
    });
  });

  it('handles vehicle with no logs and returns null odometer metrics', async () => {
    const v1 = mockVehicleDoc({ _id: vehicle1Id });

    const sortMock = vi.fn().mockResolvedValue([v1]);
    vi.spyOn(VehicleModel, 'find').mockReturnValue({ sort: sortMock } as any);
    vi.spyOn(VehicleFuelEntryModel, 'aggregate').mockResolvedValue([]);
    vi.spyOn(VehicleMaintenanceModel, 'aggregate').mockResolvedValue([]);
    vi.spyOn(VehicleEquipmentModel, 'aggregate').mockResolvedValue([]);

    const result = await getVehiclesSummary(ownerId);

    expect(result.summary).toEqual({
      totalVehicles: 1,
      totalSpentPln: 0,
      totalFuelSpentPln: 0,
      totalMaintenanceSpentPln: 0,
      totalEquipmentSpentPln: 0,
      totalDistanceKm: 0,
    });

    expect(result.vehicles[0].spending).toEqual({
      fuelTotalPln: 0,
      maintenanceTotalPln: 0,
      equipmentTotalPln: 0,
      totalSpentPln: 0,
      lastOdometerKm: null,
      totalDistanceKm: null,
      fuelEntriesCount: 0,
      maintenanceCount: 0,
      equipmentCount: 0,
    });
  });
});
