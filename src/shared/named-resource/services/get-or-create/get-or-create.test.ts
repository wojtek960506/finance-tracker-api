import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/named-resource/db', () => ({
  findNamedResourceByName: vi.fn(),
}));

vi.mock('@shared/named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(() => ({
    serialize: vi.fn((resource) => ({ id: resource.id, name: resource.name })),
  })),
}));

vi.mock('../create', () => ({
  createNamedResource: vi.fn(),
}));

import * as namedResourceDb from '@shared/named-resource/db';

import { createNamedResource } from '../create';

import { getOrCreateNamedResource } from './get-or-create';

describe('getOrCreateNamedResource', () => {
  it('returns serialized resource when it already exists', async () => {
    const resource = { id: '1', name: 'Food' };
    vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue(resource as any);

    const result = await getOrCreateNamedResource('category', 'u1', 'Food');

    expect(createNamedResource).not.toHaveBeenCalled();
    expect(result).toEqual({ id: '1', name: 'Food' });
  });

  it('creates resource when it does not exist', async () => {
    vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue(null as any);
    vi.mocked(createNamedResource).mockResolvedValue({ id: '1', name: 'Food' } as any);

    const result = await getOrCreateNamedResource('category', 'u1', 'Food');

    expect(createNamedResource).toHaveBeenCalledWith('category', 'u1', { name: 'Food' });
    expect(result).toEqual({ id: '1', name: 'Food' });
  });
});
