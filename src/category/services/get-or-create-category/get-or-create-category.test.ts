import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { getOrCreateCategory } from './get-or-create-category';

import * as db from '@/category/db';
import { serializeCategory } from '@/category/serializers';
import * as services from '@/category/services';
import * as namedResource from '@/shared/named-resource';

const getOrCreateImpl = vi.fn();

vi.mock('@category/db', () => ({
  findCategoryByName: vi.fn(),
}));

vi.mock('@category/serializers', () => ({
  serializeCategory: vi.fn(),
}));

vi.mock('@category/services', () => ({
  createCategory: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    getOrCreateNamedResource: vi.fn(() => getOrCreateImpl),
  };
});

describe('getOrCreateCategory wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to getOrCreateNamedResource with category deps', async () => {
    getOrCreateImpl.mockResolvedValue({ id: '1' });

    const result = await getOrCreateCategory('u1', 'Food');

    expect(namedResource.getOrCreateNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.getOrCreateNamedResource as Mock).mock.calls[0];
    expect(deps.findByName).toBe(db.findCategoryByName);
    expect(deps.serialize).toBe(serializeCategory);
    expect(deps.create).toBe(services.createCategory);
    expect(getOrCreateImpl).toHaveBeenCalledWith('u1', 'Food');
    expect(result).toEqual({ id: '1' });
  });
});
