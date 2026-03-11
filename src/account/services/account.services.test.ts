import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as db from '@account/db';
import { serializeAccount } from '@account/serializers';
import {
  createAccount,
  deleteAccount,
  getAccount,
  prepareAccountsMap,
  updateAccount,
} from '@account/services';
import * as namedResource from '@shared/named-resource';
// prettier-ignore
import {
  checkTransactionDependencies
} from '@transaction/services/check-transaction-dependencies';
import {
  AccountAlreadyExistsError,
  SystemAccountDeletionNotAllowed,
  SystemAccountUpdateNotAllowed,
  UserAccountMissingOwner,
} from '@utils/errors';

const { createImpl, deleteImpl, getImpl, updateImpl } = vi.hoisted(() => ({
  createImpl: vi.fn(),
  deleteImpl: vi.fn(),
  getImpl: vi.fn(),
  updateImpl: vi.fn(),
}));

vi.mock('@account/db', () => ({
  findAccountById: vi.fn(),
  findAccountByName: vi.fn(),
  findAccounts: vi.fn(),
  persistAccount: vi.fn(),
  saveAccountChanges: vi.fn(),
  removeAccount: vi.fn(),
}));

vi.mock('@account/serializers', () => ({
  serializeAccount: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    createNamedResource: vi.fn(() => createImpl),
    deleteNamedResource: vi.fn(() => deleteImpl),
    getNamedResource: vi.fn(() => getImpl),
    updateNamedResource: vi.fn(() => updateImpl),
    prepareNamedResourcesMap: vi.fn(),
  };
});

vi.mock('@transaction/services/check-transaction-dependencies', () => ({
  checkTransactionDependencies: vi.fn(),
}));

describe('account services wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createAccount is built with createNamedResource and forwards execution', async () => {
    createImpl.mockResolvedValue({ id: '1' });

    const result = await createAccount('u1', { name: 'mBank' } as any);

    expect(namedResource.createNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.createNamedResource as Mock).mock.calls[0];
    expect(deps.findByName).toBe(db.findAccountByName);
    expect(deps.persist).toBe(db.persistAccount);
    expect(deps.alreadyExistsErrorFactory('mBank')).toBeInstanceOf(
      AccountAlreadyExistsError,
    );
    expect(createImpl).toHaveBeenCalledWith('u1', { name: 'mBank' });
    expect(result).toEqual({ id: '1' });
  });

  it('getAccount delegates through getNamedResource with account owner type', async () => {
    getImpl.mockResolvedValue({ id: '1' });

    const result = await getAccount('acc-1', 'u1');

    expect(namedResource.getNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.getNamedResource as Mock).mock.calls[0];
    expect(deps.findById).toBe(db.findAccountById);
    expect(deps.serialize).toBe(serializeAccount);
    expect(deps.checkOwnerType).toBe('account');
    expect(getImpl).toHaveBeenCalledWith('acc-1', 'u1');
    expect(result).toEqual({ id: '1' });
  });

  it('updateAccount delegates through updateNamedResource with account errors', async () => {
    updateImpl.mockResolvedValue({ id: '1' });

    const result = await updateAccount('acc-1', 'u1', { name: 'New' } as any);

    expect(namedResource.updateNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.updateNamedResource as Mock).mock.calls[0];
    expect(deps.findById).toBe(db.findAccountById);
    expect(deps.saveChanges).toBe(db.saveAccountChanges);
    expect(deps.checkOwnerType).toBe('account');
    expect(deps.systemUpdateNotAllowedFactory('x')).toBeInstanceOf(
      SystemAccountUpdateNotAllowed,
    );
    expect(deps.userMissingOwnerFactory('x')).toBeInstanceOf(UserAccountMissingOwner);
    expect(updateImpl).toHaveBeenCalledWith('acc-1', 'u1', { name: 'New' });
    expect(result).toEqual({ id: '1' });
  });

  it('prepareAccountsMap delegates list fetch and map preparation', async () => {
    const accounts = [{ _id: { toString: () => 'a1' }, name: 'mBank', type: 'user' }];
    const prepared = { a1: { id: 'a1', name: 'mBank', type: 'user' } };
    (db.findAccounts as Mock).mockResolvedValue(accounts);
    (namedResource.prepareNamedResourcesMap as Mock).mockReturnValue(prepared);

    const result = await prepareAccountsMap('u1', [
      { accountId: { toString: () => 'a1' } } as any,
    ]);

    expect(db.findAccounts).toHaveBeenCalledWith('u1', ['a1']);
    expect(namedResource.prepareNamedResourcesMap).toHaveBeenCalledWith(accounts);
    expect(result).toEqual(prepared);
  });

  it('deleteAccount delegates through deleteNamedResource with account errors', async () => {
    deleteImpl.mockResolvedValue({ id: '1' });

    const result = await deleteAccount('acc-1', 'u1');

    expect(namedResource.deleteNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.deleteNamedResource as Mock).mock.calls[0];
    expect(deps.findById).toBe(db.findAccountById);
    expect(deps.remove).toBe(db.removeAccount);
    expect(deps.checkOwnerType).toBe('account');
    expect(deps.checkOccurrences('x')).toBe(
      checkTransactionDependencies('accountId', 'x'),
    );
    expect(deps.systemResourceDeleteErrorFactory('x')).toBeInstanceOf(
      SystemAccountDeletionNotAllowed,
    );
    expect(deleteImpl).toHaveBeenCalledWith('acc-1', 'u1');
    expect(result).toEqual({ id: '1' });
  });
});
