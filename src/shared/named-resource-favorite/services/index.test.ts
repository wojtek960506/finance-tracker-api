import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
  findNamedResources: vi.fn(),
}));
vi.mock('@shared/named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));
vi.mock('@named-resource-favorite/db', () => ({
  findFavoriteNamedResourceIds: vi.fn(),
  persistFavoriteNamedResource: vi.fn(),
  removeFavoriteNamedResource: vi.fn(),
}));
vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

import {
  findFavoriteNamedResourceIds,
  persistFavoriteNamedResource,
  removeFavoriteNamedResource,
} from '@named-resource-favorite/db';
import {
  favoriteNamedResource,
  getFavoriteNamedResources,
  unfavoriteNamedResource,
} from '@named-resource-favorite/services';

import { findNamedResourceById, findNamedResources } from '@shared/named-resource/db';
import { getNamedResourceKindConfig } from '@shared/named-resource/kind-config';
import { checkOwner } from '@shared/services';

describe('named resource favorites services', () => {
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
    expect(result).toEqual([{ id: 'r1' }, { id: 'r2' }]);
  });

  it('favorites system resource without owner check', async () => {
    vi.mocked(getNamedResourceKindConfig).mockReturnValue({
      serialize: vi.fn().mockReturnValue({ id: 'r1', name: 'Transfer' }),
      checkOwnerType: 'category',
    } as any);
    vi.mocked(findNamedResourceById).mockResolvedValue({
      type: 'system',
      ownerId: undefined,
      name: 'Transfer',
    } as any);
    vi.mocked(persistFavoriteNamedResource).mockResolvedValue(undefined as any);

    const result = await favoriteNamedResource('category', 'r1', 'u1');

    expect(checkOwner).not.toHaveBeenCalled();
    expect(persistFavoriteNamedResource).toHaveBeenCalledWith('u1', 'category', 'r1');
    expect(result).toEqual({ id: 'r1', name: 'Transfer' });
  });

  it('favorites user resource with owner check', async () => {
    vi.mocked(getNamedResourceKindConfig).mockReturnValue({
      serialize: vi.fn().mockReturnValue({ id: 'r1', name: 'Food' }),
      checkOwnerType: 'category',
    } as any);
    vi.mocked(findNamedResourceById).mockResolvedValue({
      type: 'user',
      ownerId: 'u1',
      name: 'Food',
    } as any);
    vi.mocked(persistFavoriteNamedResource).mockResolvedValue(undefined as any);

    await favoriteNamedResource('category', 'r1', 'u1');

    expect(checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
    expect(persistFavoriteNamedResource).toHaveBeenCalledWith('u1', 'category', 'r1');
  });

  it('unfavorites user resource with owner check', async () => {
    vi.mocked(getNamedResourceKindConfig).mockReturnValue({
      checkOwnerType: 'paymentMethod',
    } as any);
    vi.mocked(findNamedResourceById).mockResolvedValue({
      type: 'user',
      ownerId: 'u1',
      name: 'Cash',
    } as any);
    vi.mocked(removeFavoriteNamedResource).mockResolvedValue({
      acknowledged: true,
      deletedCount: 1,
    } as any);

    const result = await unfavoriteNamedResource('paymentMethod', 'r1', 'u1');

    expect(checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'paymentMethod');
    expect(removeFavoriteNamedResource).toHaveBeenCalledWith('u1', 'paymentMethod', 'r1');
    expect(result).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});
