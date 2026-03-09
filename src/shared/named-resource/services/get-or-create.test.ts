import { describe, expect, it, vi } from 'vitest';

import { getOrCreateNamedResource } from './get-or-create';

describe('getOrCreateNamedResource', () => {
  it('returns serialized resource when it already exists', async () => {
    const resource = { id: '1', name: 'Food' };
    const findByName = vi.fn().mockResolvedValue(resource);
    const serialize = vi.fn().mockReturnValue({ id: '1', name: 'Food' });
    const create = vi.fn();

    const getOrCreate = getOrCreateNamedResource({ findByName, serialize, create });
    const result = await getOrCreate('u1', 'Food');

    expect(serialize).toHaveBeenCalledWith(resource);
    expect(create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: '1', name: 'Food' });
  });

  it('creates resource when it does not exist', async () => {
    const findByName = vi.fn().mockResolvedValue(null);
    const serialize = vi.fn();
    const create = vi.fn().mockResolvedValue({ id: '1', name: 'Food' });

    const getOrCreate = getOrCreateNamedResource({ findByName, serialize, create });
    const result = await getOrCreate('u1', 'Food');

    expect(create).toHaveBeenCalledWith('u1', { name: 'Food' });
    expect(serialize).not.toHaveBeenCalled();
    expect(result).toEqual({ id: '1', name: 'Food' });
  });
});

