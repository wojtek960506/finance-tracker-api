import { describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource-favorite/db', () => ({
  findFavoriteNamedResourceIds: vi.fn(),
}));

vi.mock('@shared/named-resource/db', () => ({
  findNamedResources: vi.fn(),
}));

vi.mock('@shared/named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));

import { findFavoriteNamedResourceIds } from '@named-resource-favorite/db';
import { findNamedResources } from '@shared/named-resource/db';
import { getNamedResourceKindConfig } from '@shared/named-resource/kind-config';

import { listNamedResources } from './list';

describe('listNamedResources', () => {
  it('loads resources for kind and serializes them', async () => {
    const resources = [
      { id: '1', name: 'Food' },
      { id: '2', name: 'Cash' },
    ];
    const serialize = vi
      .fn()
      .mockImplementation((resource) => ({ id: resource.id, label: resource.name }));

    vi.mocked(findNamedResources).mockResolvedValue(resources as any);
    vi.mocked(findFavoriteNamedResourceIds).mockResolvedValue(['2']);
    vi.mocked(getNamedResourceKindConfig).mockReturnValue({
      serialize,
    } as any);

    const result = await listNamedResources('category', 'u1');

    expect(findNamedResources).toHaveBeenCalledWith('category', 'u1');
    expect(findFavoriteNamedResourceIds).toHaveBeenCalledWith('u1', 'category');
    expect(serialize).toHaveBeenCalledTimes(2);
    expect(serialize).toHaveBeenNthCalledWith(1, resources[0]);
    expect(serialize).toHaveBeenNthCalledWith(2, resources[1]);
    expect(result).toEqual([
      { id: '1', label: 'Food', isFavorite: false },
      { id: '2', label: 'Cash', isFavorite: true },
    ]);
  });
});
