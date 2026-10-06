import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));

import * as kindConfig from '@named-resource/kind-config';

import {
  findNamedResourceById,
  findNamedResourceByName,
  findNamedResources,
} from './find/find';
import { removeNamedResourceById } from './remove/remove';
import { persistNamedResource, saveNamedResourceChanges } from './write/write';

describe('named-resource db', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findNamedResourceById', () => {
    it('returns resource when model finds one', async () => {
      const resource = { id: '1' };
      const model = { findById: vi.fn().mockResolvedValue(resource) } as any;
      vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
        model,
        notFoundErrorFactory: (id: string) => new Error(id),
      } as any);

      const result = await findNamedResourceById('category', 'abc');

      expect(model.findById).toHaveBeenCalledWith('abc');
      expect(result).toEqual(resource);
    });

    it('throws not-found error when model returns null', async () => {
      const model = { findById: vi.fn().mockResolvedValue(null) } as any;
      vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
        model,
        notFoundErrorFactory: (id: string) => new Error(`nf:${id}`),
      } as any);

      await expect(findNamedResourceById('category', 'missing')).rejects.toThrow(
        'nf:missing',
      );
    });
  });

  describe('findNamedResourceByName', () => {
    it('builds normalized name query with system or owner scope', async () => {
      const resource = { id: '1' };
      const model = { findOne: vi.fn().mockResolvedValue(resource) } as any;
      vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
        model,
      } as any);

      const result = await findNamedResourceByName('category', '  Foo   Bar ', 'u1');

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
      vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
        model,
      } as any);

      const result = await findNamedResources('category', 'u1', ['a', 'b']);

      expect(model.find).toHaveBeenCalledWith({
        $or: [{ ownerId: 'u1' }, { type: 'system' }],
        _id: { $in: ['a', 'b'] },
      });
      expect(result).toEqual(list);
    });

    it('uses system-only query when owner id is undefined', async () => {
      const list = [{ id: 'sys' }];
      const model = { find: vi.fn().mockResolvedValue(list) } as any;
      vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
        model,
      } as any);

      const result = await findNamedResources('category');

      expect(model.find).toHaveBeenCalledWith({
        $and: [{ ownerId: undefined }, { type: 'system' }],
      });
      expect(result).toEqual(list);
    });
  });

  describe('removeNamedResourceById', () => {
    it('returns result when delete removes a document', async () => {
      const resultObj = { deletedCount: 1 };
      const model = { deleteOne: vi.fn().mockResolvedValue(resultObj) } as any;
      vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
        model,
        notFoundErrorFactory: (id: string) => new Error(id),
      } as any);

      const result = await removeNamedResourceById('category', 'abc');

      expect(model.deleteOne).toHaveBeenCalledWith({ _id: 'abc' });
      expect(result).toBe(resultObj);
    });

    it('throws not-found error when delete removes nothing', async () => {
      const model = { deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }) } as any;
      vi.mocked(kindConfig.getNamedResourceKindConfig).mockReturnValue({
        model,
        notFoundErrorFactory: (id: string) => new Error(`nf:${id}`),
      } as any);

      await expect(removeNamedResourceById('category', 'missing')).rejects.toThrow(
        'nf:missing',
      );
    });
  });

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
});
