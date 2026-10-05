import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
  VehicleModel,
} from './index';

describe('vehicle domain models', () => {
  describe('VehicleModel', () => {
    it('accepts valid vehicle document', () => {
      const doc = new VehicleModel({
        ownerId: new Types.ObjectId(),
        slug: 'suzuki-sv-650',
        name: 'Suzuki SV650',
        brand: 'Suzuki',
        vehicleModel: 'SV650',
        type: 'motorcycle',
        productionYear: 2007,
        notes: 'First bike',
      });

      expect(doc.validateSync()).toBeUndefined();
    });

    it('rejects invalid vehicle type', () => {
      const doc = new VehicleModel({
        ownerId: new Types.ObjectId(),
        slug: 'suzuki-sv-650',
        name: 'Suzuki SV650',
        type: 'spaceship',
      });

      const err = doc.validateSync();
      expect(err?.errors.type).toBeDefined();
    });

    it('rejects missing required fields', () => {
      const doc = new VehicleModel({});
      const err = doc.validateSync();

      expect(err?.errors.ownerId).toBeDefined();
      expect(err?.errors.slug).toBeDefined();
      expect(err?.errors.name).toBeDefined();
      expect(err?.errors.type).toBeDefined();
    });
  });

  describe('VehicleFuelEntryModel', () => {
    it('accepts valid fuel entry document', () => {
      const doc = new VehicleFuelEntryModel({
        ownerId: new Types.ObjectId(),
        vehicleId: new Types.ObjectId(),
        date: new Date('2026-05-01'),
        fuelLiters: 14.5,
        isFullTank: true,
        unitPricePln: 6.45,
        costPln: 93.53,
        odometerKm: 42150,
        stationBrand: 'Orlen',
        stationAddress: 'Warszawa, Krakowska 1',
        description: 'Shell V-Power 95',
      });

      expect(doc.validateSync()).toBeUndefined();
    });

    it('accepts fuel entry with transaction link and sourceRow', () => {
      const doc = new VehicleFuelEntryModel({
        ownerId: new Types.ObjectId(),
        vehicleId: new Types.ObjectId(),
        sourceRow: 12,
        date: new Date('2026-05-01'),
        fuelLiters: 10,
        isFullTank: false,
        unitPricePln: 6.5,
        costPln: 65.0,
        odometerKm: 42300,
        transactionId: new Types.ObjectId(),
      });

      expect(doc.validateSync()).toBeUndefined();
    });

    it('rejects negative fuel liters or cost', () => {
      const doc = new VehicleFuelEntryModel({
        ownerId: new Types.ObjectId(),
        vehicleId: new Types.ObjectId(),
        date: new Date('2026-05-01'),
        fuelLiters: -5,
        unitPricePln: -6,
        costPln: -30,
        odometerKm: -100,
      });

      const err = doc.validateSync();
      expect(err?.errors.fuelLiters).toBeDefined();
      expect(err?.errors.unitPricePln).toBeDefined();
      expect(err?.errors.costPln).toBeDefined();
      expect(err?.errors.odometerKm).toBeDefined();
    });
  });

  describe('VehicleEquipmentModel', () => {
    it('accepts valid equipment document', () => {
      const doc = new VehicleEquipmentModel({
        ownerId: new Types.ObjectId(),
        vehicleId: new Types.ObjectId(),
        date: new Date('2026-04-15'),
        itemName: 'Crash bars',
        costPln: 350,
        description: 'Givi crash bars installation',
      });

      expect(doc.validateSync()).toBeUndefined();
    });

    it('rejects missing item name and cost', () => {
      const doc = new VehicleEquipmentModel({
        ownerId: new Types.ObjectId(),
        vehicleId: new Types.ObjectId(),
        date: new Date('2026-04-15'),
      });

      const err = doc.validateSync();
      expect(err?.errors.itemName).toBeDefined();
      expect(err?.errors.costPln).toBeDefined();
    });
  });

  describe('VehicleMaintenanceModel', () => {
    it('accepts valid maintenance document', () => {
      const doc = new VehicleMaintenanceModel({
        ownerId: new Types.ObjectId(),
        vehicleId: new Types.ObjectId(),
        section: 'own_maintenance',
        date: new Date('2026-04-20'),
        costPln: 180,
        odometerKm: 41000,
        description: 'Motul 7100 10W40 + Hiflo filter',
        serviceProvider: 'Self',
      });

      expect(doc.validateSync()).toBeUndefined();
    });

    it('rejects invalid maintenance section', () => {
      const doc = new VehicleMaintenanceModel({
        ownerId: new Types.ObjectId(),
        vehicleId: new Types.ObjectId(),
        section: 'unknown_section',
        date: new Date('2026-04-20'),
        costPln: 100,
      });

      const err = doc.validateSync();
      expect(err?.errors.section).toBeDefined();
    });
  });
});
