import { describe, expect, it, vi } from 'vitest';

import { checkOwner } from '@shared/services';

import { deleteNamedResource } from './delete';

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

describe('deleteNamedResource', () => {
  it('throws when resource is system', async () => {
    const findById = vi.fn().mockResolvedValue({ type: 'system' });
    const remove = vi.fn();
    const checkOccurrences = vi.fn();
    const systemResourceDeleteErrorFactory = vi.fn((id: string) => new Error(id));

    const del = deleteNamedResource({
      findById,
      remove,
      checkOwnerType: 'category',
      checkOccurrences,
      systemResourceDeleteErrorFactory,
    });

    await expect(del('r1', 'u1')).rejects.toThrow('r1');
    expect(systemResourceDeleteErrorFactory).toHaveBeenCalledWith('r1');
    expect(checkOwner).not.toHaveBeenCalled();
    expect(checkOccurrences).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('checks owner, verifies dependencies, and removes user resource', async () => {
    const resource = { type: 'user', ownerId: 'u1' };
    const findById = vi.fn().mockResolvedValue(resource);
    const remove = vi.fn().mockResolvedValue({ deletedCount: 1 });
    const checkOccurrences = vi.fn().mockResolvedValue(undefined);
    const systemResourceDeleteErrorFactory = vi.fn();

    const del = deleteNamedResource({
      findById,
      remove,
      checkOwnerType: 'category',
      checkOccurrences,
      systemResourceDeleteErrorFactory,
    });

    const result = await del('r1', 'u1');

    expect(findById).toHaveBeenCalledWith('r1');
    expect(checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
    expect(checkOccurrences).toHaveBeenCalledWith('r1');
    expect(remove).toHaveBeenCalledWith('r1');
    expect(result).toEqual({ deletedCount: 1 });
  });
});
