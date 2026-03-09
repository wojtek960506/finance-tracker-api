import { describe, expect, it, vi } from 'vitest';

import {
  findNamedResourceById,
  findNamedResourceByName,
  findNamedResources,
} from './find';

describe('findNamedResourceById', () => {
  it('returns resource when model finds one', async () => {
    const resource = { id: '1' };
    const model = { findById: vi.fn().mockResolvedValue(resource) } as any;

    const result = await findNamedResourceById(model, 'abc', (id) => new Error(id));

    expect(model.findById).toHaveBeenCalledWith('abc');
    expect(result).toEqual(resource);
  });

  it('throws not-found error when model returns null', async () => {
    const model = { findById: vi.fn().mockResolvedValue(null) } as any;

    await expect(
      findNamedResourceById(model, 'missing', (id) => new Error(`nf:${id}`)),
    ).rejects.toThrow('nf:missing');
  });
});

describe('findNamedResourceByName', () => {
  it('builds normalized name query with system or owner scope', async () => {
    const resource = { id: '1' };
    const model = { findOne: vi.fn().mockResolvedValue(resource) } as any;

    const result = await findNamedResourceByName(model, '  Foo   Bar ', 'u1');

    expect(model.findOne).toHaveBeenCalledWith({
      nameNormalized: 'foo bar',
      $or: [{ type: 'system' }, { type: 'user', ownerId: 'u1' }],
    });
    expect(result).toEqual(resource);
  });
});

describe('findNamedResources', () => {
  it('uses $or query when owner id is provided', async () => {
    const list = [{ id: '1' }];
    const model = { find: vi.fn().mockResolvedValue(list) } as any;

    const result = await findNamedResources(model, 'u1', ['a', 'b']);

    expect(model.find).toHaveBeenCalledWith({
      $or: [{ ownerId: 'u1' }, { type: 'system' }],
      _id: { $in: ['a', 'b'] },
    });
    expect(result).toEqual(list);
  });

  it('uses system-only query when owner id is undefined', async () => {
    const list = [{ id: 'sys' }];
    const model = { find: vi.fn().mockResolvedValue(list) } as any;

    const result = await findNamedResources(model);

    expect(model.find).toHaveBeenCalledWith({
      $and: [{ ownerId: undefined }, { type: 'system' }],
    });
    expect(result).toEqual(list);
  });
});
