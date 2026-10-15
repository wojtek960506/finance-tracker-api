import {
  IVehicle,
  IVehicleEquipment,
  IVehicleFuelEntry,
  IVehicleMaintenance,
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
  VehicleModel,
} from '@vehicles/model';
import { VehicleOverviewResponseSchema } from '@vehicles/schema';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VehicleNotFoundError } from '@utils/errors';

import { getVehicleOverview } from './get-vehicle-overview';

describe('getVehicleOverview service', () => {
  const ownerId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId();

  const mockVehicleDoc = (data: Partial<IVehicle> = {}): IVehicle =>
    ({
      _id: data._id || vehicleId,
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

  it('throws VehicleNotFoundError if vehicle does not exist', async () => {
    vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(null);

    await expect(getVehicleOverview(ownerId, vehicleId.toString())).rejects.toThrow(
      VehicleNotFoundError,
    );
  });

  it('returns empty stats and empty activities when vehicle has no records', async () => {
    const vehicle = mockVehicleDoc();
    vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(vehicle);

    const emptySort = vi.fn().mockResolvedValue([]);
    vi.spyOn(VehicleFuelEntryModel, 'find').mockReturnValue({ sort: emptySort } as any);
    vi.spyOn(VehicleMaintenanceModel, 'find').mockReturnValue({
      sort: emptySort,
    } as any);
    vi.spyOn(VehicleEquipmentModel, 'find').mockReturnValue({
      sort: emptySort,
    } as any);

    const result = await getVehicleOverview(ownerId, vehicle.slug);

    expect(result).toEqual({
      vehicleId: vehicleId.toString(),
      totalSpentPln: 0,
      fuel: {
        totalSpentPln: 0,
        totalLiters: 0,
        avgConsumptionLPer100Km: null,
        costPerKmPln: null,
        entriesCount: 0,
      },
      maintenance: {
        totalSpentPln: 0,
        entriesCount: 0,
      },
      equipment: {
        totalSpentPln: 0,
        entriesCount: 0,
      },
      stats: {
        currentOdometerKm: null,
        minOdometerKm: null,
        totalDistanceKm: null,
        refuelingCount: 0,
        maintenanceCount: 0,
        equipmentCount: 0,
      },
      recentActivity: [],
    });

    // Validate with Zod schema
    expect(VehicleOverviewResponseSchema.safeParse(result).success).toBe(true);
  });

  it('aggregates stats correctly and respects previousOwnerServices rules', async () => {
    const vehicle = mockVehicleDoc();
    vi.spyOn(VehicleModel, 'findOne').mockResolvedValue(vehicle);

    // Mock fuel entries:
    // Entry 1: baseline full tank at 100,000 km, 40L, 200 PLN
    // Entry 2: full tank at 100,500 km, 35L, 210 PLN -> 500km, 7.0 L/100km, 0.42 PLN/km
    const fuel1 = {
      _id: new Types.ObjectId('670da1234567890abcdef101'),
      ownerId: new Types.ObjectId(ownerId),
      vehicleId,
      date: new Date('2026-01-01'),
      odometerKm: 100000,
      fuelLiters: 40,
      unitPricePln: 5.0,
      costPln: 200,
      isFullTank: true,
      stationBrand: 'Shell',
      description: 'First fillup',
      transactionId: new Types.ObjectId('670da1234567890abcdef201'),
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    } as unknown as IVehicleFuelEntry;

    const fuel2 = {
      _id: new Types.ObjectId('670da1234567890abcdef102'),
      ownerId: new Types.ObjectId(ownerId),
      vehicleId,
      date: new Date('2026-01-10'),
      odometerKm: 100500,
      fuelLiters: 35,
      unitPricePln: 6.0,
      costPln: 210,
      isFullTank: true,
      stationBrand: 'Orlen',
      description: 'Second fillup',
      transactionId: null,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
    } as unknown as IVehicleFuelEntry;

    // Mock maintenance:
    // 1 ownMaintenance at 100,200 km, cost 500 PLN
    // 1 previousOwnerServices at 80,000 km, cost 1,200 PLN
    // (must be excluded from spending and odometers)
    const maint1 = {
      _id: new Types.ObjectId('670da1234567890abcdef103'),
      ownerId: new Types.ObjectId(ownerId),
      vehicleId,
      section: 'ownMaintenance',
      date: new Date('2026-01-05'),
      costPln: 500,
      odometerKm: 100200,
      serviceProvider: 'Bosh Service',
      description: 'Brake pads replacement',
      transactionId: null,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    } as unknown as IVehicleMaintenance;

    // Mock equipment:
    // 1 equipment: Dashcam, cost 350 PLN
    const equip1 = {
      _id: new Types.ObjectId('670da1234567890abcdef105'),
      ownerId: new Types.ObjectId(ownerId),
      vehicleId,
      date: new Date('2026-01-15'),
      itemName: '70mai Dashcam',
      costPln: 350,
      description: 'Front & rear camera',
      transactionId: new Types.ObjectId('670da1234567890abcdef202'),
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15'),
    } as unknown as IVehicleEquipment;

    vi.spyOn(VehicleFuelEntryModel, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue([fuel1, fuel2]),
    } as any);

    vi.spyOn(VehicleMaintenanceModel, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue([maint1]),
    } as any);

    vi.spyOn(VehicleEquipmentModel, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue([equip1]),
    } as any);

    const result = await getVehicleOverview(ownerId, vehicleId.toString(), {
      activityLimit: 3,
    });

    expect(VehicleMaintenanceModel.find).toHaveBeenCalledWith({
      ownerId,
      vehicleId,
      section: 'ownMaintenance',
    });

    // Spending verification:
    // Fuel = 200 + 210 = 410
    // Own Maintenance = 500 (1200 previousOwnerServices excluded)
    // Equipment = 350
    // Total = 410 + 500 + 350 = 1260
    expect(result.totalSpentPln).toBe(1260);

    // Fuel stats:
    expect(result.fuel).toEqual({
      totalSpentPln: 410,
      totalLiters: 75,
      avgConsumptionLPer100Km: 7.0,
      costPerKmPln: 0.42,
      entriesCount: 2,
    });

    // Maintenance stats:
    expect(result.maintenance).toEqual({
      totalSpentPln: 500,
      entriesCount: 1,
    });

    // Equipment stats:
    expect(result.equipment).toEqual({
      totalSpentPln: 350,
      entriesCount: 1,
    });

    // Stats:
    // Odometers active: 100,000 (fuel1), 100,500 (fuel2), 100,200 (maint1). (80,000 excluded!)
    // max = 100,500, min = 100,000, delta = 500
    expect(result.stats).toEqual({
      currentOdometerKm: 100500,
      minOdometerKm: 100000,
      totalDistanceKm: 500,
      refuelingCount: 2,
      maintenanceCount: 1,
      equipmentCount: 1,
    });

    // Recent activity (activityLimit = 3):
    // All 5 items sorted desc by date:
    // 1. 2026-01-15 (equip1)
    // 2. 2026-01-10 (fuel2)
    // 3. 2026-01-05 (maint1)
    // (fuel1 2026-01-01 and maint2 2025-06-01 sliced out by limit=3)
    expect(result.recentActivity).toHaveLength(3);
    expect(result.recentActivity[0].id).toBe(equip1._id.toString());
    expect(result.recentActivity[0].type).toBe('equipment');
    expect(result.recentActivity[0].title).toBe('70mai Dashcam');

    expect(result.recentActivity[1].id).toBe(fuel2._id.toString());
    expect(result.recentActivity[1].type).toBe('fuel');
    expect(result.recentActivity[1].title).toBe('Orlen');
    expect(result.recentActivity[1].consumptionLPer100Km).toBe(7.0);

    expect(result.recentActivity[2].id).toBe(maint1._id.toString());
    expect(result.recentActivity[2].type).toBe('maintenance');
    expect(result.recentActivity[2].title).toBe('Bosh Service');
    expect(result.recentActivity[2].maintenanceSection).toBe('ownMaintenance');

    // Validate with Zod schema
    expect(VehicleOverviewResponseSchema.safeParse(result).success).toBe(true);
  });
});
