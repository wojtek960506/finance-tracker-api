import { IVehicleFuelEntry } from '@vehicles/model';
import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { enrichFuelEntries } from './enrich-fuel-entries';

describe('enrichFuelEntries', () => {
  const ownerId = new Types.ObjectId();
  const vehicleId = new Types.ObjectId();

  const createMockEntry = (
    data: Partial<IVehicleFuelEntry> & {
      costPln: number;
      date: Date;
      fuelLiters: number;
      isFullTank: boolean;
      odometerKm: number;
      unitPricePln: number;
    },
  ): IVehicleFuelEntry =>
    ({
      _id: new Types.ObjectId(),
      ownerId,
      vehicleId,
      createdAt: data.date,
      updatedAt: data.date,
      ...data,
    }) as unknown as IVehicleFuelEntry;

  it('returns empty array when given empty entries', () => {
    expect(enrichFuelEntries([])).toEqual([]);
  });

  it('handles first fuel entry correctly (no previous baseline)', () => {
    const entry1 = createMockEntry({
      date: new Date('2026-05-01'),
      odometerKm: 10000,
      fuelLiters: 40,
      isFullTank: true,
      unitPricePln: 6.5,
      costPln: 260,
    });

    const result = enrichFuelEntries([entry1]);

    expect(result).toHaveLength(1);
    expect(result[0].distanceSincePreviousKm).toBeNull();
    expect(result[0].distanceSincePreviousFullKm).toBeNull();
    expect(result[0].fuelLitersToFull).toBeNull();
    expect(result[0].costToFullPln).toBeNull();
    expect(result[0].consumptionLPer100Km).toBeNull();
    expect(result[0].costPerKmPln).toBeNull();
    expect(result[0].kmPerLiter).toBeNull();
  });

  it('calculates consumption between two consecutive full tank entries', () => {
    const entry1 = createMockEntry({
      date: new Date('2026-05-01'),
      odometerKm: 10000,
      fuelLiters: 40,
      isFullTank: true,
      unitPricePln: 6.5,
      costPln: 260,
    });

    const entry2 = createMockEntry({
      date: new Date('2026-05-15'),
      odometerKm: 10500,
      fuelLiters: 30,
      isFullTank: true,
      unitPricePln: 6.6,
      costPln: 198,
    });

    const result = enrichFuelEntries([entry1, entry2]);

    expect(result[1].distanceSincePreviousKm).toBe(500);
    expect(result[1].distanceSincePreviousFullKm).toBe(500);
    expect(result[1].fuelLitersToFull).toBe(30);
    expect(result[1].costToFullPln).toBe(198);
    // 30L for 500km -> 6.00 L / 100km
    expect(result[1].consumptionLPer100Km).toBe(6);
    // 198 PLN / 500km -> 0.40 PLN/km
    expect(result[1].costPerKmPln).toBe(0.4);
    // 500km / 30L -> 16.67 km/L
    expect(result[1].kmPerLiter).toBe(16.67);
  });

  it('accumulates partial refuelings until next full tank benchmark', () => {
    const entry1 = createMockEntry({
      date: new Date('2026-05-01'),
      odometerKm: 10000,
      fuelLiters: 40,
      isFullTank: true,
      unitPricePln: 6.5,
      costPln: 260,
    });

    // Partial refuel
    const entry2 = createMockEntry({
      date: new Date('2026-05-08'),
      odometerKm: 10250,
      fuelLiters: 10,
      isFullTank: false,
      unitPricePln: 6.5,
      costPln: 65,
    });

    // Full tank refuel
    const entry3 = createMockEntry({
      date: new Date('2026-05-20'),
      odometerKm: 10800,
      fuelLiters: 35,
      isFullTank: true,
      unitPricePln: 6.6,
      costPln: 231,
    });

    const result = enrichFuelEntries([entry1, entry2, entry3]);

    // Entry 2 (partial)
    expect(result[1].distanceSincePreviousKm).toBe(250);
    expect(result[1].distanceSincePreviousFullKm).toBeNull();
    expect(result[1].consumptionLPer100Km).toBeNull();

    // Entry 3 (full tank cycle completed: 10L + 35L = 45L over 800km)
    expect(result[2].distanceSincePreviousKm).toBe(550);
    expect(result[2].distanceSincePreviousFullKm).toBe(800);
    expect(result[2].fuelLitersToFull).toBe(45);
    expect(result[2].costToFullPln).toBe(296); // 65 + 231
    // (45 / 800) * 100 = 5.63 L/100km
    expect(result[2].consumptionLPer100Km).toBe(5.63);
    // 296 / 800 = 0.37 PLN/km
    expect(result[2].costPerKmPln).toBe(0.37);
    // 800 / 45 = 17.78 km/L
    expect(result[2].kmPerLiter).toBe(17.78);
  });

  it('handles irregular odometer decreases without crashing or negative numbers', () => {
    const entry1 = createMockEntry({
      date: new Date('2026-05-01'),
      odometerKm: 10000,
      fuelLiters: 40,
      isFullTank: true,
      unitPricePln: 6.5,
      costPln: 260,
    });

    const entry2 = createMockEntry({
      date: new Date('2026-05-10'),
      odometerKm: 9500, // lower odometer reading
      fuelLiters: 30,
      isFullTank: true,
      unitPricePln: 6.5,
      costPln: 195,
    });

    const result = enrichFuelEntries([entry1, entry2]);

    expect(result[1].distanceSincePreviousKm).toBeNull();
    expect(result[1].distanceSincePreviousFullKm).toBeNull();
    expect(result[1].consumptionLPer100Km).toBeNull();
  });
});
