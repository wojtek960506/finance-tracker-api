import { describe, expect, it, vi } from 'vitest';

import { persistNamedResource, saveNamedResourceChanges } from './write';

describe('persistNamedResource', () => {
  it('persists resource and serializes result', async () => {
    const created = { id: '1', name: 'Food' };
    const serialized = { id: '1', name: 'Food', type: 'user' };
    const model = { create: vi.fn().mockResolvedValue(created) } as any;
    const serialize = vi.fn().mockReturnValue(serialized);

    const result = await persistNamedResource(
      model,
      {
        ownerId: 'u1',
        type: 'user',
        name: 'Food',
        nameNormalized: 'food',
      },
      serialize,
    );

    expect(model.create).toHaveBeenCalledOnce();
    expect(serialize).toHaveBeenCalledWith(created);
    expect(result).toEqual(serialized);
  });
});

describe('saveNamedResourceChanges', () => {
  it('applies props, saves and serializes resource', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const resource: any = {
      _id: '1',
      name: 'Old',
      nameNormalized: 'old',
      save,
    };
    const serialize = vi.fn().mockReturnValue({ id: '1', name: 'New' });

    const result = await saveNamedResourceChanges(
      resource,
      { name: 'New', nameNormalized: 'new' },
      serialize,
    );

    expect(resource.name).toBe('New');
    expect(resource.nameNormalized).toBe('new');
    expect(save).toHaveBeenCalledOnce();
    expect(serialize).toHaveBeenCalledWith(resource);
    expect(result).toEqual({ id: '1', name: 'New' });
  });
});

