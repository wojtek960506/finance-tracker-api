import { describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource/kind-config', () => ({
  getNamedResourceKindConfig: vi.fn(),
}));

import * as kindConfig from '@named-resource/kind-config';

import { removeNamedResourceById } from './remove';

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
