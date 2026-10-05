import { AppError } from './general-errors';

export class VehicleNotFoundError extends AppError {
  readonly code = 'VEHICLE_NOT_FOUND_ERROR';

  constructor(readonly identifier: string) {
    super(404, `Vehicle with id or slug '${identifier}' not found`);
  }
}

export class VehicleNameAlreadyExistsError extends AppError {
  readonly code = 'VEHICLE_NAME_ALREADY_EXISTS_ERROR';

  constructor(readonly name: string) {
    super(409, `Vehicle with name '${name}' already exists`);
  }
}

export class VehicleSlugAlreadyExistsError extends AppError {
  readonly code = 'VEHICLE_SLUG_ALREADY_EXISTS_ERROR';

  constructor(readonly slug: string) {
    super(409, `Vehicle with slug '${slug}' already exists`);
  }
}

export class VehicleFuelEntryNotFoundError extends AppError {
  readonly code = 'VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR';

  constructor(readonly entryId: string) {
    super(404, `Vehicle fuel entry with id '${entryId}' not found`);
  }
}

export class VehicleEquipmentNotFoundError extends AppError {
  readonly code = 'VEHICLE_EQUIPMENT_NOT_FOUND_ERROR';

  constructor(readonly equipmentId: string) {
    super(404, `Vehicle equipment with id '${equipmentId}' not found`);
  }
}

export class VehicleMaintenanceNotFoundError extends AppError {
  readonly code = 'VEHICLE_MAINTENANCE_NOT_FOUND_ERROR';

  constructor(readonly maintenanceId: string) {
    super(404, `Vehicle maintenance with id '${maintenanceId}' not found`);
  }
}

export class VehicleSpendingNotFoundError extends AppError {
  readonly code = 'VEHICLE_SPENDING_NOT_FOUND_ERROR';

  constructor(
    readonly spendingType: string,
    readonly spendingId: string,
  ) {
    super(404, `${spendingType} spending entry with id '${spendingId}' not found`);
  }
}

export class VehicleDependencyError extends AppError {
  readonly code = 'VEHICLE_DEPENDENCY_ERROR';

  constructor(readonly vehicleId: string) {
    super(403, 'Vehicle cannot be deleted because it has associated records');
  }
}
