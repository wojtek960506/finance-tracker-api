import { describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource-favorite/db', () => ({
  isFavoriteNamedResource: vi.fn(),
}));

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

vi.mock('@named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
}));

vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(() => ({
    checkOwnerType: 'category',
    serialize: vi.fn((resource) => ({ id: '1', name: resource.name })),
  })),
}));

import * as namedResourceDb from '@named-resource/db';
import * as namedResourceFavoriteDb from '@named-resource-favorite/db';
import * as sharedServices from '@shared/services';

import { getNamedResource } from './get';

describe('getNamedResource', () => {
  it('returns serialized system resource without owner check', async () => {
    vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
      type: 'system',
      ownerId: undefined,
      name: 'Transfer',
    } as any);
    vi.mocked(namedResourceFavoriteDb.isFavoriteNamedResource).mockResolvedValue(true);

    const result = await getNamedResource('category', 'r1', 'u1');

    expect(sharedServices.checkOwner).not.toHaveBeenCalled();
    expect(namedResourceFavoriteDb.isFavoriteNamedResource).toHaveBeenCalledWith(
      'u1',
      'category',
      'r1',
    );
    expect(result).toEqual({ id: '1', name: 'Transfer', isFavorite: true });
  });

  it('checks ownership for user resource', async () => {
    vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
      type: 'user',
      ownerId: 'u1',
      name: 'Food',
    } as any);
    vi.mocked(namedResourceFavoriteDb.isFavoriteNamedResource).mockResolvedValue(false);

    const result = await getNamedResource('category', 'r1', 'u1');

    expect(sharedServices.checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
    expect(result).toEqual({ id: '1', name: 'Food', isFavorite: false });
  });
});
