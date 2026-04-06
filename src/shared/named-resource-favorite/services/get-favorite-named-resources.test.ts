import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource/db', () => ({
  findNamedResources: vi.fn(),
}));
vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));
vi.mock('@named-resource-favorite/db', () => ({
  findFavoriteNamedResourceIds: vi.fn(),
}));

import { findNamedResources } from '@named-resource/db';
import { getNamedResourceKindConfig } from '@named-resource/kind-config';
import { findFavoriteNamedResourceIds } from '@named-resource-favorite/db';

import { getFavoriteNamedResources } from './get-favorite-named-resources';

describe('getFavoriteNamedResources', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns favorite named resources for given owner', async () => {
    vi.mocked(getNamedResourceKindConfig).mockReturnValue({
      serialize: (resource: unknown) => resource,
      checkOwnerType: 'category',
    } as any);
    vi.mocked(findFavoriteNamedResourceIds).mockResolvedValue(['r1', 'r2']);
    vi.mocked(findNamedResources).mockResolvedValue([{ id: 'r1' }, { id: 'r2' }] as any);

    const result = await getFavoriteNamedResources('category', 'u1');

    expect(findFavoriteNamedResourceIds).toHaveBeenCalledWith('u1', 'category');
    expect(findNamedResources).toHaveBeenCalledWith('category', 'u1', ['r1', 'r2']);
    expect(result).toEqual([
      { id: 'r1', isFavorite: true },
      { id: 'r2', isFavorite: true },
    ]);
  });

  it('returns empty list when there are no favorite ids', async () => {
    vi.mocked(getNamedResourceKindConfig).mockReturnValue({
      serialize: (resource: unknown) => resource,
      checkOwnerType: 'category',
    } as any);
    vi.mocked(findFavoriteNamedResourceIds).mockResolvedValue([]);

    const result = await getFavoriteNamedResources('category', 'u1');

    expect(findNamedResources).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
