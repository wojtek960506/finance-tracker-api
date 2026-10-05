import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import {
  IVehicle,
  IVehicleEquipment,
  IVehicleFuelEntry,
  IVehicleMaintenance,
} from '../model';

import {
  serializeEnrichedFuelEntry,
  serializeEquipment,
  serializeFuelEntry,
  serializeMaintenance,
  serializeVehicle,
} from './index';

describe('vehicle serializers', () => {
  it('serializes vehicle document correctly', () => {
    const doc = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      ownerId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      slug: 'suzuki-sv-650',
      name: 'Suzuki SV650',
      brand: 'Suzuki',
      vehicleModel: 'SV650',
      type: 'motorcycle',
      productionYear: 2007,
      notes: 'Notes here',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    } as unknown as IVehicle;

    const result = serializeVehicle(doc);

    expect(result.id).toBe('507f1f77bcf86cd799439011');
    expect(result.ownerId).toBe('507f1f77bcf86cd799439012');
    expect(result.slug).toBe('suzuki-sv-650');
    expect(result.name).toBe('Suzuki SV650');
    expect(result.brand).toBe('Suzuki');
    expect(result.vehicleModel).toBe('SV650');
    expect(result.type).toBe('motorcycle');
  });

  it('serializes fuel entry and enriched fuel entry correctly', () => {
    const txId = new Types.ObjectId('507f1f77bcf86cd799439013');
    const doc = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      ownerId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      vehicleId: new Types.ObjectId('507f1f77bcf86cd799439014'),
      date: new Date('2026-05-01'),
      fuelLiters: 14.5,
      isFullTank: true,
      unitPricePln: 6.45,
      costPln: 93.53,
      odometerKm: 42150,
      transactionId: txId,
      createdAt: new Date('2026-05-01'),
      updatedAt: new Date('2026-05-01'),
    } as unknown as IVehicleFuelEntry;

    const rawResult = serializeFuelEntry(doc);
    expect(rawResult.id).toBe('507f1f77bcf86cd799439011');
    expect(rawResult.transactionId).toBe(txId.toString());

    const enrichedMetrics = {
      distanceSincePreviousKm: 280,
      distanceSincePreviousFullKm: 280,
      fuelLitersToFull: 14.5,
      costToFullPln: 93.53,
      consumptionLPer100Km: 5.18,
      costPerKmPln: 0.33,
      kmPerLiter: 19.31,
    };

    const enrichedResult = serializeEnrichedFuelEntry(doc, enrichedMetrics);
    expect(enrichedResult.distanceSincePreviousKm).toBe(280);
    expect(enrichedResult.consumptionLPer100Km).toBe(5.18);
  });

  it('serializes equipment document correctly', () => {
    const doc = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      ownerId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      vehicleId: new Types.ObjectId('507f1f77bcf86cd799439014'),
      date: new Date('2026-04-10'),
      itemName: 'Helmet',
      costPln: 1200,
      transactionId: null,
      createdAt: new Date('2026-04-10'),
      updatedAt: new Date('2026-04-10'),
    } as unknown as IVehicleEquipment;

    const result = serializeEquipment(doc);
    expect(result.id).toBe('507f1f77bcf86cd799439011');
    expect(result.itemName).toBe('Helmet');
    expect(result.transactionId).toBeNull();
  });

  it('serializes maintenance document correctly', () => {
    const doc = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      ownerId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      vehicleId: new Types.ObjectId('507f1f77bcf86cd799439014'),
      section: 'own_maintenance',
      date: new Date('2026-04-15'),
      costPln: 250,
      odometerKm: 41000,
      serviceProvider: 'Self',
      transactionId: null,
      createdAt: new Date('2026-04-15'),
      updatedAt: new Date('2026-04-15'),
    } as unknown as IVehicleMaintenance;

    const result = serializeMaintenance(doc);
    expect(result.id).toBe('507f1f77bcf86cd799439011');
    expect(result.section).toBe('own_maintenance');
    expect(result.odometerKm).toBe(41000);
  });
});
