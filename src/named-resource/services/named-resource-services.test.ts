import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as namedResourceDb from '@named-resource/db';
import * as namedResourceKindConfig from '@named-resource/kind-config';
import * as namedResourceFavoriteDb from '@named-resource-favorite/db';
import * as sharedServices from '@shared/services';
import { AppError } from '@utils/errors';

import * as createModule from './create/create';
import { createNamedResource } from './create/create';
import { deleteNamedResource } from './delete/delete';
import { getNamedResource } from './get/get';
import { getOrCreateNamedResource } from './get-or-create/get-or-create';
import { listNamedResources } from './list/list';
import { prepareNamedResourcesMap } from './prepare-map/prepare-map';
import { updateNamedResource } from './update/update';

vi.mock('@named-resource-favorite/db', () => ({
  findFavoriteNamedResourceIds: vi.fn(),
  isFavoriteNamedResource: vi.fn(),
}));

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

vi.mock('@named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
  findNamedResourceByName: vi.fn(),
  findNamedResources: vi.fn(),
  persistNamedResource: vi.fn(),
  removeNamedResourceById: vi.fn(),
  saveNamedResourceChanges: vi.fn(),
}));

vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));

describe('named-resource services', () => {
  const getDefaultKindConfig = () => ({
    checkOwnerType: 'category',
    checkOccurrences: vi.fn().mockResolvedValue(undefined),
    alreadyExistsErrorFactory: (name: string) => new Error(`exists:${name}`),
    systemNameConflictErrorFactory: (name: string) => new Error(`systemExists:${name}`),
    systemResourceDeleteErrorFactory: (id: string) => new Error(id),
    systemUpdateNotAllowedFactory: (id: string) => new Error(`system:${id}`),
    userMissingOwnerFactory: (id: string) => new Error(`missing:${id}`),
    serialize: vi.fn((resource: any) => ({
      id: resource?.id ?? resource?._id ?? '1',
      name: resource?.name,
    })),
  });

  beforeEach(() => {
    vi.mocked(namedResourceKindConfig.getNamedResourceKindConfig).mockReturnValue(
      getDefaultKindConfig() as any,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createNamedResource', () => {
    it('creates normalized user resource when name does not exist', async () => {
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue(null as any);
      vi.mocked(namedResourceDb.persistNamedResource).mockResolvedValue({
        id: '1',
      } as any);

      const result = await createNamedResource('category', 'u1', {
        name: '  Foo   Bar ',
      });

      expect(namedResourceDb.findNamedResourceByName).toHaveBeenCalledWith(
        'category',
        '  Foo   Bar ',
        'u1',
      );
      expect(namedResourceDb.persistNamedResource).toHaveBeenCalledWith('category', {
        ownerId: 'u1',
        type: 'user',
        name: 'Foo Bar',
        nameNormalized: 'foo bar',
      });
      expect(result).toEqual({ id: '1', isFavorite: false });
    });

    it('throws when resource with given name already exists', async () => {
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue({
        type: 'user',
      } as any);

      await expect(
        createNamedResource('category', 'u1', { name: 'Food' }),
      ).rejects.toThrow('exists:Food');
      expect(namedResourceDb.persistNamedResource).not.toHaveBeenCalled();
    });

    it('throws dedicated error when name conflicts with system resource', async () => {
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue({
        type: 'system',
      } as any);

      await expect(
        createNamedResource('category', 'u1', { name: 'Food' }),
      ).rejects.toThrow('systemExists:Food');
      expect(namedResourceDb.persistNamedResource).not.toHaveBeenCalled();
    });
  });

  describe('prepareNamedResourcesMap', () => {
    it('creates map keyed by stringified _id', async () => {
      vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue([
        { _id: { toString: () => 'r1' }, type: 'system', name: 'Transfer' },
        { _id: { toString: () => 'r2' }, type: 'user', name: 'Food' },
      ] as any);

      const result = await prepareNamedResourcesMap('category', 'u1', ['r1', 'r2']);

      expect(namedResourceDb.findNamedResources).toHaveBeenCalledWith('category', 'u1', [
        'r1',
        'r2',
      ]);
      expect(result).toEqual({
        r1: { id: 'r1', type: 'system', name: 'Transfer' },
        r2: { id: 'r2', type: 'user', name: 'Food' },
      });
    });
  });

  describe('listNamedResources', () => {
    it('loads resources for kind and serializes them', async () => {
      const resources = [
        { id: '1', name: 'Food' },
        { id: '2', name: 'Cash' },
      ];
      const serialize = vi
        .fn()
        .mockImplementation((resource) => ({ id: resource.id, label: resource.name }));

      vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue(resources as any);
      vi.mocked(namedResourceFavoriteDb.findFavoriteNamedResourceIds).mockResolvedValue([
        '2',
      ]);
      vi.mocked(namedResourceKindConfig.getNamedResourceKindConfig).mockReturnValue({
        ...getDefaultKindConfig(),
        serialize,
      } as any);

      const result = await listNamedResources('category', 'u1');

      expect(namedResourceDb.findNamedResources).toHaveBeenCalledWith('category', 'u1');
      expect(namedResourceFavoriteDb.findFavoriteNamedResourceIds).toHaveBeenCalledWith(
        'u1',
        'category',
      );
      expect(serialize).toHaveBeenCalledTimes(2);
      expect(serialize).toHaveBeenNthCalledWith(1, resources[0]);
      expect(serialize).toHaveBeenNthCalledWith(2, resources[1]);
      expect(result).toEqual([
        { id: '1', label: 'Food', isFavorite: false },
        { id: '2', label: 'Cash', isFavorite: true },
      ]);
    });
  });

  describe('getNamedResource', () => {
    it('returns serialized system resource without owner check', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        type: 'system',
        ownerId: undefined,
        name: 'Transfer',
      } as any);
      vi.mocked(namedResourceFavoriteDb.isFavoriteNamedResource).mockResolvedValue(true);

      const result = await getNamedResource('category', 'r1', 'u1');

      expect(sharedServices.checkOwner).not.toHaveBeenCalled();
      expect(namedResourceFavoriteDb.isFavoriteNamedResource).toHaveBeenCalledWith(
        'u1',
        'category',
        'r1',
      );
      expect(result).toEqual({ id: '1', name: 'Transfer', isFavorite: true });
    });

    it('checks ownership for user resource', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        type: 'user',
        ownerId: 'u1',
        name: 'Food',
      } as any);
      vi.mocked(namedResourceFavoriteDb.isFavoriteNamedResource).mockResolvedValue(false);

      const result = await getNamedResource('category', 'r1', 'u1');

      expect(sharedServices.checkOwner).toHaveBeenCalledWith(
        'u1',
        'r1',
        'u1',
        'category',
      );
      expect(result).toEqual({ id: '1', name: 'Food', isFavorite: false });
    });
  });

  describe('getOrCreateNamedResource', () => {
    it('returns serialized resource when it already exists', async () => {
      const resource = { id: '1', name: 'Food' };
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue(
        resource as any,
      );
      const createSpy = vi.spyOn(createModule, 'createNamedResource');

      const result = await getOrCreateNamedResource('category', 'u1', 'Food');

      expect(createSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ id: '1', name: 'Food' });
    });

    it('creates resource when it does not exist', async () => {
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue(null as any);
      vi.spyOn(createModule, 'createNamedResource').mockResolvedValue({
        id: '1',
        name: 'Food',
      } as any);

      const result = await getOrCreateNamedResource('category', 'u1', 'Food');

      expect(createModule.createNamedResource).toHaveBeenCalledWith('category', 'u1', {
        name: 'Food',
      });
      expect(result).toEqual({ id: '1', name: 'Food' });
    });
  });

  describe('deleteNamedResource', () => {
    it('throws when resource is system', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        type: 'system',
      } as any);

      await expect(deleteNamedResource('category', 'r1', 'u1')).rejects.toThrow('r1');
      expect(sharedServices.checkOwner).not.toHaveBeenCalled();
      expect(namedResourceDb.removeNamedResourceById).not.toHaveBeenCalled();
    });

    it('checks owner, verifies dependencies, and removes user resource', async () => {
      const checkOccurrences = vi.fn().mockResolvedValue(undefined);
      vi.mocked(namedResourceKindConfig.getNamedResourceKindConfig).mockReturnValue({
        ...getDefaultKindConfig(),
        checkOccurrences,
      } as any);
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        type: 'user',
        ownerId: 'u1',
      } as any);
      vi.mocked(namedResourceDb.removeNamedResourceById).mockResolvedValue({
        deletedCount: 1,
      } as any);

      const result = await deleteNamedResource('category', 'r1', 'u1');

      expect(namedResourceDb.findNamedResourceById).toHaveBeenCalledWith(
        'category',
        'r1',
      );
      expect(sharedServices.checkOwner).toHaveBeenCalledWith(
        'u1',
        'r1',
        'u1',
        'category',
      );
      expect(checkOccurrences).toHaveBeenCalledWith('r1');
      expect(namedResourceDb.removeNamedResourceById).toHaveBeenCalledWith(
        'category',
        'r1',
      );
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('updateNamedResource', () => {
    it('updates normalized name for user resource', async () => {
      const resource = {
        _id: { toString: () => 'r1' },
        type: 'user',
        ownerId: 'u1',
        name: 'Old',
      } as any;
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue(resource);
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue(resource);
      vi.mocked(namedResourceDb.saveNamedResourceChanges).mockResolvedValue({
        id: 'r1',
        name: 'New Name',
      } as any);
      vi.mocked(namedResourceFavoriteDb.isFavoriteNamedResource).mockResolvedValue(true);

      const result = await updateNamedResource('category', 'r1', 'u1', {
        name: '  New   Name ',
      });

      expect(sharedServices.checkOwner).toHaveBeenCalledWith(
        'u1',
        'r1',
        'u1',
        'category',
      );
      expect(namedResourceDb.findNamedResourceByName).toHaveBeenCalledWith(
        'category',
        'New Name',
        'u1',
      );
      expect(namedResourceDb.saveNamedResourceChanges).toHaveBeenCalledWith(
        'category',
        resource,
        {
          name: 'New Name',
          nameNormalized: 'new name',
        },
      );
      expect(namedResourceFavoriteDb.isFavoriteNamedResource).toHaveBeenCalledWith(
        'u1',
        'category',
        'r1',
      );
      expect(result).toEqual({ id: 'r1', name: 'New Name', isFavorite: true });
    });

    it('throws when updating system resource', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        type: 'system',
      } as any);

      await expect(
        updateNamedResource('category', 'r1', 'u1', { name: 'x' }),
      ).rejects.toThrow('system:r1');
      expect(namedResourceDb.saveNamedResourceChanges).not.toHaveBeenCalled();
    });

    it('throws when user resource has no owner', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        type: 'user',
        ownerId: undefined,
      } as any);

      await expect(
        updateNamedResource('category', 'r1', 'u1', { name: 'x' }),
      ).rejects.toThrow('missing:r1');
      expect(namedResourceDb.saveNamedResourceChanges).not.toHaveBeenCalled();
    });

    it('throws dedicated error when name conflicts with system resource', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        _id: { toString: () => 'r1' },
        type: 'user',
        ownerId: 'u1',
      } as any);
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue({
        _id: { toString: () => 'sys-1' },
        type: 'system',
      } as any);

      await expect(
        updateNamedResource('category', 'r1', 'u1', { name: 'Food' }),
      ).rejects.toThrow('systemExists:Food');
      expect(namedResourceDb.saveNamedResourceChanges).not.toHaveBeenCalled();
    });

    it('throws already exists error when name conflicts with another user resource', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        _id: { toString: () => 'r1' },
        type: 'user',
        ownerId: 'u1',
      } as any);
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue({
        _id: { toString: () => 'r2' },
        type: 'user',
      } as any);

      await expect(
        updateNamedResource('category', 'r1', 'u1', { name: 'Food' }),
      ).rejects.toThrow('exists:Food');
      expect(namedResourceDb.saveNamedResourceChanges).not.toHaveBeenCalled();
    });

    it('maps duplicate key save error to already exists error', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        _id: { toString: () => 'r1' },
        type: 'user',
        ownerId: 'u1',
      } as any);
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue({
        _id: { toString: () => 'r1' },
        type: 'user',
        ownerId: 'u1',
      } as any);
      vi.mocked(namedResourceDb.saveNamedResourceChanges).mockRejectedValue({
        code: 11000,
      });

      await expect(
        updateNamedResource('category', 'r1', 'u1', { name: 'Food' }),
      ).rejects.toThrow('exists:Food');
    });

    it('wraps unknown save error in AppError with status 400', async () => {
      vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
        _id: { toString: () => 'r1' },
        type: 'user',
        ownerId: 'u1',
      } as any);
      vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue({
        _id: { toString: () => 'r1' },
        type: 'user',
        ownerId: 'u1',
      } as any);
      vi.mocked(namedResourceDb.saveNamedResourceChanges).mockRejectedValue(
        new Error('DB exploded'),
      );

      try {
        await updateNamedResource('category', 'r1', 'u1', { name: 'Food' });
        throw new Error('Expected update to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toMatchObject({
          statusCode: 400,
          message: 'DB exploded',
        });
      }
    });
  });
});
