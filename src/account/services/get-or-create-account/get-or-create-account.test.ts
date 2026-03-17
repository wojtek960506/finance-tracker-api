import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as db from '@account/db';
import { serializeAccount } from '@account/serializers';
import * as services from '@account/services';
import * as namedResource from '@shared/named-resource';

import { getOrCreateAccount } from './get-or-create-account';

const getOrCreateImpl = vi.fn();

vi.mock('@account/db', () => ({
  findAccountByName: vi.fn(),
}));

vi.mock('@account/serializers', () => ({
  serializeAccount: vi.fn(),
}));

vi.mock('@account/services', () => ({
  createAccount: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    getOrCreateNamedResource: vi.fn(() => getOrCreateImpl),
  };
});

describe('getOrCreateAccount wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to getOrCreateNamedResource with account deps', async () => {
    getOrCreateImpl.mockResolvedValue({ id: '1' });

    const result = await getOrCreateAccount('u1', 'mBank');

    expect(namedResource.getOrCreateNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.getOrCreateNamedResource as Mock).mock.calls[0];
    expect(deps.findByName).toBe(db.findAccountByName);
    expect(deps.serialize).toBe(serializeAccount);
    expect(deps.create).toBe(services.createAccount);
    expect(getOrCreateImpl).toHaveBeenCalledWith('u1', 'mBank');
    expect(result).toEqual({ id: '1' });
  });
});
