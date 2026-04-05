import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

vi.mock('@shared/named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
  findNamedResourceByName: vi.fn(),
  saveNamedResourceChanges: vi.fn(),
}));

vi.mock('@shared/named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(() => ({
    checkOwnerType: 'category',
    systemUpdateNotAllowedFactory: (id: string) => new Error(`system:${id}`),
    userMissingOwnerFactory: (id: string) => new Error(`missing:${id}`),
    alreadyExistsErrorFactory: (name: string) => new Error(`nameExists:${name}`),
    systemNameConflictErrorFactory: (name: string) => new Error(`systemExists:${name}`),
  })),
}));

import * as namedResourceDb from '@shared/named-resource/db';
import * as sharedServices from '@shared/services';
import { AppError } from '@utils/errors';

import { updateNamedResource } from './update';

describe('updateNamedResource', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

    const result = await updateNamedResource('category', 'r1', 'u1', {
      name: '  New   Name ',
    });

    expect(sharedServices.checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
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
    expect(result).toEqual({ id: 'r1', name: 'New Name' });
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
    ).rejects.toThrow('nameExists:Food');
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
    ).rejects.toThrow('nameExists:Food');
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
