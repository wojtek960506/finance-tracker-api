import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

import { checkOwner } from '@shared/services';

import {
  favoriteNamedResource,
  getFavoriteNamedResources,
  unfavoriteNamedResource,
} from './services';

describe('named resource favorites services', () => {
  it('returns favorite named resources for given owner', async () => {
    const findFavoriteIds = vi.fn().mockResolvedValue(['r1', 'r2']);
    const findResources = vi.fn().mockResolvedValue([{ id: 'r1' }, { id: 'r2' }]);
    const serialize = vi.fn((resource) => resource);

    const getFavorites = getFavoriteNamedResources({
      resourceType: 'category',
      findFavoriteIds,
      findResources,
      serialize,
    });

    const result = await getFavorites('u1');

    expect(findFavoriteIds).toHaveBeenCalledWith('u1', 'category');
    expect(findResources).toHaveBeenCalledWith('u1', ['r1', 'r2']);
    expect(result).toEqual([{ id: 'r1' }, { id: 'r2' }]);
  });

  it('favorites system resource without owner check', async () => {
    const resource = { type: 'system', ownerId: undefined, name: 'Transfer' } as any;
    const findById = vi.fn().mockResolvedValue(resource);
    const persistFavorite = vi.fn().mockResolvedValue(undefined);
    const serialize = vi.fn().mockReturnValue({ id: 'r1', name: 'Transfer' });

    const favorite = favoriteNamedResource({
      resourceType: 'category',
      findById,
      persistFavorite,
      serialize,
      checkOwnerType: 'category',
    });

    const result = await favorite('r1', 'u1');

    expect(checkOwner).not.toHaveBeenCalled();
    expect(persistFavorite).toHaveBeenCalledWith('u1', 'category', 'r1');
    expect(result).toEqual({ id: 'r1', name: 'Transfer' });
  });

  it('favorites user resource with owner check', async () => {
    const resource = { type: 'user', ownerId: 'u1', name: 'Food' } as any;
    const findById = vi.fn().mockResolvedValue(resource);
    const persistFavorite = vi.fn().mockResolvedValue(undefined);
    const serialize = vi.fn().mockReturnValue({ id: 'r1', name: 'Food' });

    const favorite = favoriteNamedResource({
      resourceType: 'category',
      findById,
      persistFavorite,
      serialize,
      checkOwnerType: 'category',
    });

    await favorite('r1', 'u1');

    expect(checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
    expect(persistFavorite).toHaveBeenCalledWith('u1', 'category', 'r1');
  });

  it('unfavorites user resource with owner check', async () => {
    const resource = { type: 'user', ownerId: 'u1', name: 'Cash' } as any;
    const findById = vi.fn().mockResolvedValue(resource);
    const removeFavorite = vi
      .fn()
      .mockResolvedValue({ acknowledged: true, deletedCount: 1 });

    const unfavorite = unfavoriteNamedResource({
      resourceType: 'paymentMethod',
      findById,
      removeFavorite,
      checkOwnerType: 'paymentMethod',
    });

    const result = await unfavorite('r1', 'u1');

    expect(checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'paymentMethod');
    expect(removeFavorite).toHaveBeenCalledWith('u1', 'paymentMethod', 'r1');
    expect(result).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});
