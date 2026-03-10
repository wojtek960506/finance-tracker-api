import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as db from '@category/db';
import { serializeCategory } from '@category/serializers';
import {
  createCategory,
  getCategory,
  prepareCategoriesMap,
  updateCategory,
} from '@category/services';
import * as namedResource from '@shared/named-resource';
import {
  CategoryAlreadyExistsError,
  SystemCategoryUpdateNotAllowed,
  UserCategoryMissingOwner,
} from '@utils/errors';

const { createImpl, getImpl, updateImpl } = vi.hoisted(() => ({
  createImpl: vi.fn(),
  getImpl: vi.fn(),
  updateImpl: vi.fn(),
}));

vi.mock('@category/db', () => ({
  findCategoryById: vi.fn(),
  findCategoryByName: vi.fn(),
  findCategories: vi.fn(),
  persistCategory: vi.fn(),
  saveCategoryChanges: vi.fn(),
}));

vi.mock('@category/serializers', () => ({
  serializeCategory: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    createNamedResource: vi.fn(() => createImpl),
    getNamedResource: vi.fn(() => getImpl),
    updateNamedResource: vi.fn(() => updateImpl),
    prepareNamedResourcesMap: vi.fn(),
    deleteNamedResource: vi.fn(),
  };
});

describe('category services wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // beforeEach(() => {
  //   vi.clearAllMocks();
  // });

  it('createCategory is built with createNamedResource and forwards execution', async () => {
    createImpl.mockResolvedValue({ id: '1' });

    const result = await createCategory('u1', { name: 'Food' } as any);

    expect(namedResource.createNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.createNamedResource as Mock).mock.calls[0];
    expect(deps.findByName).toBe(db.findCategoryByName);
    expect(deps.persist).toBe(db.persistCategory);
    expect(deps.alreadyExistsErrorFactory('Food')).toBeInstanceOf(
      CategoryAlreadyExistsError,
    );
    expect(createImpl).toHaveBeenCalledWith('u1', { name: 'Food' });
    expect(result).toEqual({ id: '1' });
  });

  it('getCategory delegates through getNamedResource with category owner type', async () => {
    getImpl.mockResolvedValue({ id: '1' });

    const result = await getCategory('cat-1', 'u1');

    expect(namedResource.getNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.getNamedResource as Mock).mock.calls[0];
    expect(deps.findById).toBe(db.findCategoryById);
    expect(deps.serialize).toBe(serializeCategory);
    expect(deps.checkOwnerType).toBe('category');
    expect(getImpl).toHaveBeenCalledWith('cat-1', 'u1');
    expect(result).toEqual({ id: '1' });
  });

  it('updateCategory delegates through updateNamedResource with category errors', async () => {
    updateImpl.mockResolvedValue({ id: '1' });

    const result = await updateCategory('cat-1', 'u1', { name: 'New' } as any);

    expect(namedResource.updateNamedResource).toHaveBeenCalledOnce();
    const [deps] = (namedResource.updateNamedResource as Mock).mock.calls[0];
    expect(deps.findById).toBe(db.findCategoryById);
    expect(deps.saveChanges).toBe(db.saveCategoryChanges);
    expect(deps.checkOwnerType).toBe('category');
    expect(deps.systemUpdateNotAllowedFactory('x')).toBeInstanceOf(
      SystemCategoryUpdateNotAllowed,
    );
    expect(deps.userMissingOwnerFactory('x')).toBeInstanceOf(UserCategoryMissingOwner);
    expect(updateImpl).toHaveBeenCalledWith('cat-1', 'u1', { name: 'New' });
    expect(result).toEqual({ id: '1' });
  });

  it('prepareCategoriesMap delegates list fetch and map preparation', async () => {
    const categories = [{ _id: { toString: () => 'c1' }, name: 'Food', type: 'user' }];
    const prepared = { c1: { id: 'c1', name: 'Food', type: 'user' } };
    (db.findCategories as Mock).mockResolvedValue(categories);
    (namedResource.prepareNamedResourcesMap as Mock).mockReturnValue(prepared);

    const result = await prepareCategoriesMap('u1', [
      { categoryId: { toString: () => 'c1' } } as any,
    ]);

    expect(db.findCategories).toHaveBeenCalledWith('u1', ['c1']);
    expect(namedResource.prepareNamedResourcesMap).toHaveBeenCalledWith(categories);
    expect(result).toEqual(prepared);
  });
});
