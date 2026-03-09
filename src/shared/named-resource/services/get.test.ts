import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

import * as sharedServices from '@shared/services';

import { getNamedResource } from './get';

describe('getNamedResource', () => {
  it('returns serialized system resource without owner check', async () => {
    const resource = { type: 'system', ownerId: undefined, name: 'Transfer' } as any;
    const findById = vi.fn().mockResolvedValue(resource);
    const serialize = vi.fn().mockReturnValue({ id: '1', name: 'Transfer' });
    const get = getNamedResource({ findById, serialize, ownerType: 'category' });

    const result = await get('r1', 'u1');

    expect(sharedServices.checkOwner).not.toHaveBeenCalled();
    expect(result).toEqual({ id: '1', name: 'Transfer' });
  });

  it('checks ownership for user resource', async () => {
    const resource = { type: 'user', ownerId: 'u1', name: 'Food' } as any;
    const findById = vi.fn().mockResolvedValue(resource);
    const serialize = vi.fn().mockReturnValue({ id: '1', name: 'Food' });
    const get = getNamedResource({ findById, serialize, ownerType: 'category' });

    await get('r1', 'u1');

    expect(sharedServices.checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
  });
});
