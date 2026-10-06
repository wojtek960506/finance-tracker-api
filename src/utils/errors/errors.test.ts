import { describe, expect, it } from 'vitest';

import {
  AccountAlreadyExistsError,
  AccountDependencyError,
  AccountNotFoundError,
  AccountOwnershipError,
  AccountSystemNameConflictError,
  SystemAccountDeletionNotAllowed,
  SystemAccountUpdateNotAllowed,
  UserAccountMissingOwner,
} from './account-errors';
import {
  CategoryAlreadyExistsError,
  CategoryDependencyError,
  CategoryNotFoundError,
  CategoryOwnershipError,
  CategorySystemNameConflictError,
  SystemCategoryDeletionNotAllowed,
  SystemCategoryHasOwner,
  SystemCategoryNotAllowed,
  SystemCategoryUpdateNotAllowed,
  SystemCategoryWrongType,
  UserCategoryMissingOwner,
} from './category-errors';
import {
  CannotEditLinkedTransactionOperationError,
  InvestmentInstrumentAlreadyExistsError,
  InvestmentInstrumentDependencyError,
  InvestmentInstrumentNotFoundError,
  InvestmentOperationNotFoundError,
  OperationKindNotAllowedForInstrumentError,
  SnapshotNotAllowedForInstrumentError,
  SnapshotOperationOnlyError,
} from './investment-errors';
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

describe('domain errors', () => {
  describe('account errors', () => {
    it('AccountNotFoundError sets defaults', () => {
      const err = new AccountNotFoundError('acc-1');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('ACCOUNT_NOT_FOUND');
      expect(err.message).toBe('Account not found');
      expect(err.accountId).toBe('acc-1');
    });

    it('AccountOwnershipError captures identifiers', () => {
      const err = new AccountOwnershipError('u1', 'acc-1', 'u2');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('ACCOUNT_OWNERSHIP_VIOLATION');
      expect(err.message).toBe('Account does not belong to the current user');
      expect(err.wrongUserId).toBe('u1');
      expect(err.accountId).toBe('acc-1');
      expect(err.accountOwnerId).toBe('u2');
    });

    it('AccountDependencyError uses correct message', () => {
      const err = new AccountDependencyError('acc-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('ACCOUNT_DEPENDENCY_ERROR');
      expect(err.message).toBe('Account is being used by some transactions');
      expect(err.accountId).toBe('acc-1');
    });

    it('AccountAlreadyExistsError uses name', () => {
      const err = new AccountAlreadyExistsError('mbank');
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('ACCOUNT_ALREADY_EXISTS');
      expect(err.message).toBe("Account with normalized name 'mbank' already exists");
      expect(err.accountName).toBe('mbank');
    });

    it('AccountSystemNameConflictError uses name', () => {
      const err = new AccountSystemNameConflictError('cash');
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('ACCOUNT_SYSTEM_NAME_CONFLICT');
      expect(err.message).toBe(
        "Account name 'cash' is reserved by a system account. Choose a different name",
      );
      expect(err.accountName).toBe('cash');
    });

    it('SystemAccountUpdateNotAllowed uses id', () => {
      const err = new SystemAccountUpdateNotAllowed('acc-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('SYSTEM_ACCOUNT_UPDATE_NOT_ALLOWED');
      expect(err.message).toBe('Updating system account not allowed');
      expect(err.accountId).toBe('acc-1');
    });

    it('SystemAccountDeletionNotAllowed uses id', () => {
      const err = new SystemAccountDeletionNotAllowed('acc-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('SYSTEM_ACCOUNT_DELETION_NOT_ALLOWED');
      expect(err.message).toBe('Deleting system account not allowed');
      expect(err.accountId).toBe('acc-1');
    });

    it('UserAccountMissingOwner uses id', () => {
      const err = new UserAccountMissingOwner('acc-1');
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('USER_ACCOUNT_MISSING_OWNER');
      expect(err.message).toBe('Invalid account state - user account is missing owner');
      expect(err.accountId).toBe('acc-1');
    });
  });

  describe('category errors', () => {
    it('CategoryNotFoundError sets defaults', () => {
      const err = new CategoryNotFoundError('cat-1', 'Food');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('CATEGORY_NOT_FOUND');
      expect(err.message).toBe('Category not found');
      expect(err.categoryId).toBe('cat-1');
      expect(err.categoryName).toBe('Food');
    });

    it('CategoryOwnershipError captures identifiers', () => {
      const err = new CategoryOwnershipError('u1', 'cat-1', 'u2');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('CATEGORY_OWNERSHIP_VIOLATION');
      expect(err.message).toBe('Category does not belong to the current user');
      expect(err.wrongUserId).toBe('u1');
      expect(err.categoryId).toBe('cat-1');
      expect(err.categoryOwnerId).toBe('u2');
    });

    it('CategoryDependencyError uses correct message', () => {
      const err = new CategoryDependencyError('cat-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('CATEGORY_DEPENDENCY_ERROR');
      expect(err.message).toBe('Category is being used by some transactions');
      expect(err.categoryId).toBe('cat-1');
    });

    it('CategoryAlreadyExistsError uses name', () => {
      const err = new CategoryAlreadyExistsError('food');
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('CATEGORY_ALREADY_EXISTS');
      expect(err.message).toBe("Category with normalized name 'food' already exists");
      expect(err.categoryName).toBe('food');
    });

    it('CategorySystemNameConflictError uses name', () => {
      const err = new CategorySystemNameConflictError('transfer');
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('CATEGORY_SYSTEM_NAME_CONFLICT');
      expect(err.message).toBe(
        "Category name 'transfer' is reserved by a system category. Choose a different name",
      );
      expect(err.categoryName).toBe('transfer');
    });

    it('SystemCategoryUpdateNotAllowed uses id', () => {
      const err = new SystemCategoryUpdateNotAllowed('cat-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('SYSTEM_CATEGORY_UPDATE_NOT_ALLOWED');
      expect(err.message).toBe('Updating system category not allowed');
      expect(err.categoryId).toBe('cat-1');
    });

    it('SystemCategoryDeletionNotAllowed uses id', () => {
      const err = new SystemCategoryDeletionNotAllowed('cat-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('SYSTEM_CATEGORY_DELETION_NOT_ALLOWED');
      expect(err.message).toBe('Deleting system category not allowed');
      expect(err.categoryId).toBe('cat-1');
    });

    it('UserCategoryMissingOwner uses id', () => {
      const err = new UserCategoryMissingOwner('cat-1');
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('USER_CATEGORY_MISSING_OWNER');
      expect(err.message).toBe('Invalid category state - user category is missing owner');
      expect(err.categoryId).toBe('cat-1');
    });

    it('SystemCategoryWrongType uses identifiers', () => {
      const err = new SystemCategoryWrongType('cat-1', 'exchange');
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('SYSTEM_CATEGORY_WRONG_TYPE');
      expect(err.message).toBe(
        "Invalid category state - category with name 'exchange' should be system category",
      );
      expect(err.categoryId).toBe('cat-1');
      expect(err.categoryName).toBe('exchange');
    });

    it('SystemCategoryHasOwner uses id', () => {
      const err = new SystemCategoryHasOwner('cat-1');
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('SYSTEM_CATEGORY_HAS_OWNER');
      expect(err.message).toBe("System category shouldn't have owner");
      expect(err.categoryId).toBe('cat-1');
    });

    it('SystemCategoryNotAllowed uses id', () => {
      const err = new SystemCategoryNotAllowed('cat-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('SYSTEM_CATEGORY_NOT_ALLOWED');
      expect(err.message).toBe(
        "System category is not allowed in 'standard' transaction",
      );
      expect(err.categoryId).toBe('cat-1');
    });
  });

  describe('investment errors', () => {
    it('InvestmentInstrumentNotFoundError sets defaults', () => {
      const err = new InvestmentInstrumentNotFoundError('inst-1');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('INVESTMENT_INSTRUMENT_NOT_FOUND_ERROR');
      expect(err.message).toBe("Investment instrument with id 'inst-1' not found");
      expect(err.instrumentId).toBe('inst-1');
    });

    it('InvestmentInstrumentAlreadyExistsError sets defaults', () => {
      const err = new InvestmentInstrumentAlreadyExistsError('VWCE ETF');
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('INVESTMENT_INSTRUMENT_ALREADY_EXISTS_ERROR');
      expect(err.message).toBe(
        "Investment instrument with name 'VWCE ETF' already exists",
      );
      expect(err.instrumentName).toBe('VWCE ETF');
    });

    it('InvestmentInstrumentDependencyError sets defaults', () => {
      const err = new InvestmentInstrumentDependencyError('inst-1');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('INVESTMENT_INSTRUMENT_DEPENDENCY_ERROR');
      expect(err.message).toBe('Investment instrument is being used by some operations');
      expect(err.instrumentId).toBe('inst-1');
    });

    it('InvestmentOperationNotFoundError sets defaults', () => {
      const err = new InvestmentOperationNotFoundError('op-1');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('INVESTMENT_OPERATION_NOT_FOUND_ERROR');
      expect(err.message).toBe("Investment operation with id 'op-1' not found");
      expect(err.operationId).toBe('op-1');
    });

    it('SnapshotOperationOnlyError sets defaults for create and delete', () => {
      const errCreate = new SnapshotOperationOnlyError('create');
      expect(errCreate.statusCode).toBe(400);
      expect(errCreate.code).toBe('SNAPSHOT_OPERATION_ONLY_ERROR');
      expect(errCreate.message).toBe(
        'Only snapshot operations can be created via this endpoint',
      );
      expect(errCreate.action).toBe('create');

      const errUpdate = new SnapshotOperationOnlyError('update');
      expect(errUpdate.statusCode).toBe(400);
      expect(errUpdate.code).toBe('SNAPSHOT_OPERATION_ONLY_ERROR');
      expect(errUpdate.message).toBe(
        'Only snapshot operations can be updated via this endpoint',
      );
      expect(errUpdate.action).toBe('update');
    });

    it('CannotEditLinkedTransactionOperationError sets defaults', () => {
      const err = new CannotEditLinkedTransactionOperationError();
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('CANNOT_EDIT_LINKED_TRANSACTION_OPERATION');
      expect(err.message).toBe(
        'Cannot edit linked transaction operation directly. Please edit the root transaction.',
      );
    });

    it('SnapshotNotAllowedForInstrumentError sets defaults', () => {
      const err = new SnapshotNotAllowedForInstrumentError('termDeposit');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('SNAPSHOT_NOT_ALLOWED_FOR_INSTRUMENT');
      expect(err.message).toBe("Snapshots are not allowed for 'termDeposit' instruments");
      expect(err.instrumentKind).toBe('termDeposit');
    });

    it('OperationKindNotAllowedForInstrumentError sets defaults', () => {
      const err = new OperationKindNotAllowedForInstrumentError('interest', 'share');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('OPERATION_KIND_NOT_ALLOWED_FOR_INSTRUMENT');
      expect(err.message).toBe(
        "Operation of kind 'interest' is not allowed for 'share' instruments",
      );
      expect(err.operationKind).toBe('interest');
      expect(err.instrumentKind).toBe('share');
    });
  });

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
});
