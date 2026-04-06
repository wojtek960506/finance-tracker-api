import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
}));
vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));
vi.mock('@named-resource-favorite/db', () => ({
  persistFavoriteNamedResource: vi.fn(),
}));
vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

import { findNamedResourceById } from '@named-resource/db';
import { getNamedResourceKindConfig } from '@named-resource/kind-config';
import { persistFavoriteNamedResource } from '@named-resource-favorite/db';
import { checkOwner } from '@shared/services';

import { favoriteNamedResource } from './favorite-named-resource';

describe('favoriteNamedResource', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
    expect(result).toEqual({ id: 'r1', name: 'Transfer', isFavorite: true });
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
});
