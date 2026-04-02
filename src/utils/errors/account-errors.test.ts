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
