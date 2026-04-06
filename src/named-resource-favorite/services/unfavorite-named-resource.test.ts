import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
}));
vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));
vi.mock('@named-resource-favorite/db', () => ({
  removeFavoriteNamedResource: vi.fn(),
}));
vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

import { findNamedResourceById } from '@named-resource/db';
import { getNamedResourceKindConfig } from '@named-resource/kind-config';
import { removeFavoriteNamedResource } from '@named-resource-favorite/db';
import { checkOwner } from '@shared/services';

import { unfavoriteNamedResource } from './unfavorite-named-resource';

describe('unfavoriteNamedResource', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
