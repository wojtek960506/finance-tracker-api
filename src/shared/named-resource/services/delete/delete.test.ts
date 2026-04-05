import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

vi.mock('@shared/named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
  removeNamedResourceById: vi.fn(),
}));

vi.mock('@shared/named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(() => ({
    checkOwnerType: 'category',
    checkOccurrences: vi.fn(),
    systemResourceDeleteErrorFactory: (id: string) => new Error(id),
  })),
}));

import * as namedResourceDb from '@shared/named-resource/db';
import * as namedResourceKindConfig from '@shared/named-resource/kind-config';
import { checkOwner } from '@shared/services';

import { deleteNamedResource } from './delete';

describe('deleteNamedResource', () => {
  it('throws when resource is system', async () => {
    vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({ type: 'system' } as any);

    await expect(deleteNamedResource('category', 'r1', 'u1')).rejects.toThrow('r1');
    expect(checkOwner).not.toHaveBeenCalled();
    expect(namedResourceDb.removeNamedResourceById).not.toHaveBeenCalled();
  });

  it('checks owner, verifies dependencies, and removes user resource', async () => {
    const checkOccurrences = vi.fn().mockResolvedValue(undefined);
    vi.mocked(namedResourceKindConfig.getNamedResourceKindConfig).mockReturnValue({
      checkOwnerType: 'category',
      checkOccurrences,
      systemResourceDeleteErrorFactory: (id: string) => new Error(id),
    } as any);
    vi.mocked(namedResourceDb.findNamedResourceById).mockResolvedValue({
      type: 'user',
      ownerId: 'u1',
    } as any);
    vi.mocked(namedResourceDb.removeNamedResourceById).mockResolvedValue({
      deletedCount: 1,
    } as any);

    const result = await deleteNamedResource('category', 'r1', 'u1');

    expect(namedResourceDb.findNamedResourceById).toHaveBeenCalledWith('category', 'r1');
    expect(checkOwner).toHaveBeenCalledWith('u1', 'r1', 'u1', 'category');
    expect(checkOccurrences).toHaveBeenCalledWith('r1');
    expect(namedResourceDb.removeNamedResourceById).toHaveBeenCalledWith('category', 'r1');
    expect(result).toEqual({ deletedCount: 1 });
  });
});
