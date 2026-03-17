import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { AccountModel } from '@account/model';
import { serializeAccount } from '@account/serializers';
import * as namedResource from '@shared/named-resource';
import { AccountNotFoundError } from '@utils/errors';

import {
  findAccountById,
  findAccountByName,
  findAccounts,
  persistAccount,
  removeAccount,
  saveAccountChanges,
} from './account.db';

vi.mock('@account/model', () => ({
  AccountModel: {},
}));

vi.mock('@account/serializers', () => ({
  serializeAccount: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    findNamedResourceById: vi.fn(),
    findNamedResourceByName: vi.fn(),
    findNamedResources: vi.fn(),
    persistNamedResource: vi.fn(),
    removeNamedResourceById: vi.fn(),
    saveNamedResourceChanges: vi.fn(),
  };
});

describe('account db wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // prettier-ignore
  it(
    'findAccountById delegates to findNamedResourceById with account not-found factory',
    async () => {
      const resultObj = { id: '1' };
      (namedResource.findNamedResourceById as Mock).mockResolvedValue(resultObj);

      const result = await findAccountById('acc-1');

      expect(namedResource.findNamedResourceById).toHaveBeenCalledOnce();
      const [modelArg, idArg, factoryArg] = (namedResource.findNamedResourceById as Mock)
        .mock.calls[0];
      expect(modelArg).toBe(AccountModel);
      expect(idArg).toBe('acc-1');
      expect(factoryArg('x')).toBeInstanceOf(AccountNotFoundError);
      expect(result).toBe(resultObj);
    }
  );

  it('findAccountByName delegates to findNamedResourceByName', async () => {
    const resultObj = { id: '1' };
    (namedResource.findNamedResourceByName as Mock).mockResolvedValue(resultObj);

    const result = await findAccountByName('mBank', 'u1');

    expect(namedResource.findNamedResourceByName).toHaveBeenCalledWith(
      AccountModel,
      'mBank',
      'u1',
    );
    expect(result).toBe(resultObj);
  });

  it('findAccounts delegates to findNamedResources', async () => {
    const resultObj = [{ id: '1' }];
    (namedResource.findNamedResources as Mock).mockResolvedValue(resultObj);

    const result = await findAccounts('u1', ['a1']);

    expect(namedResource.findNamedResources).toHaveBeenCalledWith(AccountModel, 'u1', [
      'a1',
    ]);
    expect(result).toBe(resultObj);
  });

  it('persistAccount delegates to persistNamedResource with serializer', async () => {
    const props = {
      ownerId: 'u1',
      type: 'user' as const,
      name: 'mBank',
      nameNormalized: 'mbank',
    };
    const resultObj = { id: '1' };
    (namedResource.persistNamedResource as Mock).mockResolvedValue(resultObj);

    const result = await persistAccount(props);

    expect(namedResource.persistNamedResource).toHaveBeenCalledWith(
      AccountModel,
      props,
      serializeAccount,
    );
    expect(result).toBe(resultObj);
  });

  it('saveAccountChanges delegates to saveNamedResourceChanges with serializer', async () => {
    const account = { _id: '1' } as any;
    const props = { name: 'New', nameNormalized: 'new' };
    const resultObj = { id: '1', name: 'New' };
    (namedResource.saveNamedResourceChanges as Mock).mockResolvedValue(resultObj);

    const result = await saveAccountChanges(account, props);

    expect(namedResource.saveNamedResourceChanges).toHaveBeenCalledWith(
      account,
      props,
      serializeAccount,
    );
    expect(result).toBe(resultObj);
  });

  it('removeAccount delegates to removeNamedResourceById with not-found factory', async () => {
    const resultObj = { deletedCount: 1 };
    (namedResource.removeNamedResourceById as Mock).mockResolvedValue(resultObj);

    const result = await removeAccount('acc-1');

    expect(namedResource.removeNamedResourceById).toHaveBeenCalledOnce();
    const [modelArg, idArg, factoryArg] = (namedResource.removeNamedResourceById as Mock)
      .mock.calls[0];
    expect(modelArg).toBe(AccountModel);
    expect(idArg).toBe('acc-1');
    expect(factoryArg('x')).toBeInstanceOf(AccountNotFoundError);
    expect(result).toBe(resultObj);
  });
});
