import { describe, expect, it } from 'vitest';

import {
  VehicleDependencyError,
  VehicleEquipmentNotFoundError,
  VehicleFuelEntryNotFoundError,
  VehicleMaintenanceNotFoundError,
  VehicleNameAlreadyExistsError,
  VehicleNotFoundError,
  VehicleOdometerSequenceError,
  VehicleSlugAlreadyExistsError,
  VehicleSpendingNotFoundError,
} from './vehicle-errors';

describe('vehicle errors', () => {
  it('instantiates VehicleNotFoundError with status 404', () => {
    const error = new VehicleNotFoundError('suzuki-sv-650');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('VEHICLE_NOT_FOUND_ERROR');
    expect(error.message).toContain('suzuki-sv-650');
  });

  it('instantiates VehicleNameAlreadyExistsError with status 409', () => {
    const error = new VehicleNameAlreadyExistsError('Suzuki SV650');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('VEHICLE_NAME_ALREADY_EXISTS_ERROR');
    expect(error.message).toContain('Suzuki SV650');
  });

  it('instantiates VehicleSlugAlreadyExistsError with status 409', () => {
    const error = new VehicleSlugAlreadyExistsError('suzuki-sv-650');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('VEHICLE_SLUG_ALREADY_EXISTS_ERROR');
    expect(error.message).toContain('suzuki-sv-650');
  });

  it('instantiates VehicleFuelEntryNotFoundError with status 404', () => {
    const error = new VehicleFuelEntryNotFoundError('entry-123');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR');
    expect(error.message).toContain('entry-123');
  });

  it('instantiates VehicleEquipmentNotFoundError with status 404', () => {
    const error = new VehicleEquipmentNotFoundError('equip-123');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('VEHICLE_EQUIPMENT_NOT_FOUND_ERROR');
    expect(error.message).toContain('equip-123');
  });

  it('instantiates VehicleMaintenanceNotFoundError with status 404', () => {
    const error = new VehicleMaintenanceNotFoundError('maint-123');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('VEHICLE_MAINTENANCE_NOT_FOUND_ERROR');
    expect(error.message).toContain('maint-123');
  });

  it('instantiates VehicleSpendingNotFoundError with status 404', () => {
    const error = new VehicleSpendingNotFoundError('fuel', 'fuel-123');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('VEHICLE_SPENDING_NOT_FOUND_ERROR');
    expect(error.message).toContain('fuel');
    expect(error.message).toContain('fuel-123');
  });

  it('instantiates VehicleDependencyError with status 403', () => {
    const error = new VehicleDependencyError('veh-123');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('VEHICLE_DEPENDENCY_ERROR');
  });

  it('instantiates VehicleOdometerSequenceError for too low odometer', () => {
    const error = new VehicleOdometerSequenceError(
      'too_low',
      39000,
      40000,
      new Date('2026-05-01'),
    );
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VEHICLE_ODOMETER_SEQUENCE_ERROR');
    expect(error.message).toBe(
      'Odometer reading (39000 km) cannot be lower than the previous refuel on ' +
        '2026-05-01 (40000 km)',
    );
  });

  it('instantiates VehicleOdometerSequenceError for too high odometer', () => {
    const error = new VehicleOdometerSequenceError(
      'too_high',
      42000,
      41000,
      new Date('2026-05-15'),
    );
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VEHICLE_ODOMETER_SEQUENCE_ERROR');
    expect(error.message).toBe(
      'Odometer reading (42000 km) cannot be higher than the next refuel on ' +
        '2026-05-15 (41000 km)',
    );
  });
});
