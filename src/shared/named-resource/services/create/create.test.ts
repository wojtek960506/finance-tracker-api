import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/named-resource/db', () => ({
  findNamedResourceByName: vi.fn(),
  persistNamedResource: vi.fn(),
}));

vi.mock('@shared/named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(() => ({
    alreadyExistsErrorFactory: (name: string) => new Error(`exists:${name}`),
    systemNameConflictErrorFactory: (name: string) => new Error(`systemExists:${name}`),
  })),
}));

import * as namedResourceDb from '@shared/named-resource/db';

import { createNamedResource } from './create';

describe('createNamedResource', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates normalized user resource when name does not exist', async () => {
    vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue(null as any);
    vi.mocked(namedResourceDb.persistNamedResource).mockResolvedValue({ id: '1' } as any);

    const result = await createNamedResource('category', 'u1', { name: '  Foo   Bar ' });

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

    await expect(createNamedResource('category', 'u1', { name: 'Food' })).rejects.toThrow(
      'exists:Food',
    );
    expect(namedResourceDb.persistNamedResource).not.toHaveBeenCalled();
  });

  it('throws dedicated error when name conflicts with system resource', async () => {
    vi.mocked(namedResourceDb.findNamedResourceByName).mockResolvedValue({
      type: 'system',
    } as any);

    await expect(createNamedResource('category', 'u1', { name: 'Food' })).rejects.toThrow(
      'systemExists:Food',
    );
    expect(namedResourceDb.persistNamedResource).not.toHaveBeenCalled();
  });
});
