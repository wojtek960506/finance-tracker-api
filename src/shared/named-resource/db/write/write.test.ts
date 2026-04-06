import { describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));

import * as kindConfig from '@named-resource/kind-config';

import { persistNamedResource, saveNamedResourceChanges } from './write';

describe('persistNamedResource', () => {
  it('persists resource and serializes result', async () => {
    const created = { id: '1', name: 'Food' };
    const serialized = { id: '1', name: 'Food', type: 'user' };
    const model = { create: vi.fn().mockResolvedValue(created) } as any;
    const serialize = vi.fn().mockReturnValue(serialized);
    vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
      model,
      serialize,
    } as any);

    const result = await persistNamedResource('category', {
      ownerId: 'u1',
      type: 'user',
      name: 'Food',
      nameNormalized: 'food',
    });

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
    vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
      serialize,
    } as any);

    const result = await saveNamedResourceChanges('category', resource, {
      name: 'New',
      nameNormalized: 'new',
    });

    expect(resource.name).toBe('New');
    expect(resource.nameNormalized).toBe('new');
    expect(save).toHaveBeenCalledOnce();
    expect(serialize).toHaveBeenCalledWith(resource);
    expect(result).toEqual({ id: '1', name: 'New' });
  });
});
