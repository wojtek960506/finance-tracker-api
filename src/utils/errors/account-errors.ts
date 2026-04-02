import { AppError } from './general-errors';

export class AccountNotFoundError extends AppError {
  readonly code = 'ACCOUNT_NOT_FOUND';

  constructor(
    readonly accountId?: string,
    readonly accountName?: string,
  ) {
    super(404, 'Account not found');
  }
}

export class AccountOwnershipError extends AppError {
  readonly code = 'ACCOUNT_OWNERSHIP_VIOLATION';

  constructor(
    readonly wrongUserId: string,
    readonly accountId: string,
    readonly accountOwnerId: string,
  ) {
    super(403, 'Account does not belong to the current user');
  }
}

export class AccountDependencyError extends AppError {
  readonly code = 'ACCOUNT_DEPENDENCY_ERROR';

  constructor(readonly accountId: string) {
    super(403, 'Account is being used by some transactions');
  }
}

export class AccountAlreadyExistsError extends AppError {
  readonly code = 'ACCOUNT_ALREADY_EXISTS';

  constructor(readonly accountName: string) {
    super(409, `Account with normalized name '${accountName}' already exists`);
  }
}

export class AccountSystemNameConflictError extends AppError {
  readonly code = 'ACCOUNT_SYSTEM_NAME_CONFLICT';

  constructor(readonly accountName: string) {
    super(
      409,
      `Account name '${accountName}' is reserved by a system account. Choose a different name`,
    );
  }
}

export class SystemAccountUpdateNotAllowed extends AppError {
  readonly code = 'SYSTEM_ACCOUNT_UPDATE_NOT_ALLOWED';

  constructor(readonly accountId: string) {
    super(403, 'Updating system account not allowed');
  }
}

export class SystemAccountDeletionNotAllowed extends AppError {
  readonly code = 'SYSTEM_ACCOUNT_DELETION_NOT_ALLOWED';

  constructor(readonly accountId: string) {
    super(403, 'Deleting system account not allowed');
  }
}

export class UserAccountMissingOwner extends AppError {
  readonly code = 'USER_ACCOUNT_MISSING_OWNER';

  constructor(readonly accountId: string) {
    super(500, 'Invalid account state - user account is missing owner');
  }
}
