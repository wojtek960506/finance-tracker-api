import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

import * as sharedServices from '@shared/services';

import { updateNamedResource } from './update';

describe('updateNamedResource', () => {
  it('updates normalized name for user resource', async () => {
    const resource = { type: 'user', ownerId: 'u1', name: 'Old' } as any;
    const findById = vi.fn().mockResolvedValue(resource);
    const saveChanges = vi.fn().mockResolvedValue({ id: 'r1', name: 'New Name' });
    const update = updateNamedResource({
      findById,
      saveChanges,
      checkOwnerType: 'category',
      systemUpdateNotAllowedFactory: (id) => new Error(`system:${id}`),
      userMissingOwnerFactory: (id) => new Error(`missing:${id}`),
      alreadyExistsErrorFactory: (name) => new Error(`nameExists:${name}`),
    });

    const result = await update('r1', 'u1', { name: '  New   Name ' });

    expect(sharedServices.checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
    expect(saveChanges).toHaveBeenCalledWith(resource, {
      name: 'New Name',
      nameNormalized: 'new name',
    });
    expect(result).toEqual({ id: 'r1', name: 'New Name' });
  });

  it('throws when updating system resource', async () => {
    const findById = vi.fn().mockResolvedValue({ type: 'system' });
    const saveChanges = vi.fn();
    const update = updateNamedResource({
      findById,
      saveChanges,
      checkOwnerType: 'category',
      systemUpdateNotAllowedFactory: (id) => new Error(`system:${id}`),
      userMissingOwnerFactory: (id) => new Error(`missing:${id}`),
      alreadyExistsErrorFactory: (name) => new Error(`nameExists:${name}`),
    });

    await expect(update('r1', 'u1', { name: 'x' })).rejects.toThrow('system:r1');
    expect(saveChanges).not.toHaveBeenCalled();
  });

  it('throws when user resource has no owner', async () => {
    const findById = vi.fn().mockResolvedValue({ type: 'user', ownerId: undefined });
    const saveChanges = vi.fn();
    const update = updateNamedResource({
      findById,
      saveChanges,
      checkOwnerType: 'category',
      systemUpdateNotAllowedFactory: (id) => new Error(`system:${id}`),
      userMissingOwnerFactory: (id) => new Error(`missing:${id}`),
      alreadyExistsErrorFactory: (name) => new Error(`nameExists:${name}`),
    });

    await expect(update('r1', 'u1', { name: 'x' })).rejects.toThrow('missing:r1');
    expect(saveChanges).not.toHaveBeenCalled();
  });

  // TODO write unit test for already exists error case when saveChanges throws 11000 error code
});
