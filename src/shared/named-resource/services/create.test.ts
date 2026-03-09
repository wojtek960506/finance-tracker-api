import { describe, expect, it, vi } from 'vitest';

import { createNamedResource } from './create';

describe('createNamedResource', () => {
  it('creates normalized user resource when name does not exist', async () => {
    const findByName = vi.fn().mockResolvedValue(null);
    const persist = vi.fn().mockResolvedValue({ id: '1' });
    const create = createNamedResource({
      findByName,
      persist,
      alreadyExistsErrorFactory: (name) => new Error(`exists:${name}`),
    });

    const result = await create('u1', { name: '  Foo   Bar ' });

    expect(findByName).toHaveBeenCalledWith('  Foo   Bar ', 'u1');
    expect(persist).toHaveBeenCalledWith({
      ownerId: 'u1',
      type: 'user',
      name: 'Foo Bar',
      nameNormalized: 'foo bar',
    });
    expect(result).toEqual({ id: '1' });
  });

  it('throws when resource with given name already exists', async () => {
    const findByName = vi.fn().mockResolvedValue({ id: '1' });
    const persist = vi.fn();
    const create = createNamedResource({
      findByName,
      persist,
      alreadyExistsErrorFactory: (name) => new Error(`exists:${name}`),
    });

    await expect(create('u1', { name: 'Food' })).rejects.toThrow('exists:Food');
    expect(persist).not.toHaveBeenCalled();
  });
});

