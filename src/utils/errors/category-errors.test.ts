import { describe, expect, it } from 'vitest';

import {
  CategoryAlreadyExistsError,
  CategoryDependencyError,
  CategoryNotFoundError,
  CategoryOwnershipError,
  CategorySystemNameConflictError,
  SystemCategoryDeletionNotAllowed,
  SystemCategoryHasOwner,
  SystemCategoryNotAllowed,
  SystemCategoryUpdateNotAllowed,
  SystemCategoryWrongType,
  UserCategoryMissingOwner,
} from './category-errors';

describe('category errors', () => {
  it('CategoryNotFoundError sets defaults', () => {
    const err = new CategoryNotFoundError('cat-1', 'Food');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('CATEGORY_NOT_FOUND');
    expect(err.message).toBe('Category not found');
    expect(err.categoryId).toBe('cat-1');
    expect(err.categoryName).toBe('Food');
  });

  it('CategoryOwnershipError captures identifiers', () => {
    const err = new CategoryOwnershipError('u1', 'cat-1', 'u2');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('CATEGORY_OWNERSHIP_VIOLATION');
    expect(err.message).toBe('Category does not belong to the current user');
    expect(err.wrongUserId).toBe('u1');
    expect(err.categoryId).toBe('cat-1');
    expect(err.categoryOwnerId).toBe('u2');
  });

  it('CategoryDependencyError uses correct message', () => {
    const err = new CategoryDependencyError('cat-1');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('CATEGORY_DEPENDENCY_ERROR');
    expect(err.message).toBe('Category is being used by some transactions');
    expect(err.categoryId).toBe('cat-1');
  });

  it('CategoryAlreadyExistsError uses name', () => {
    const err = new CategoryAlreadyExistsError('food');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CATEGORY_ALREADY_EXISTS');
    expect(err.message).toBe("Category with normalized name 'food' already exists");
    expect(err.categoryName).toBe('food');
  });

  it('CategorySystemNameConflictError uses name', () => {
    const err = new CategorySystemNameConflictError('transfer');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CATEGORY_SYSTEM_NAME_CONFLICT');
    expect(err.message).toBe(
      "Category name 'transfer' is reserved by a system category. Choose a different name",
    );
    expect(err.categoryName).toBe('transfer');
  });

  it('SystemCategoryUpdateNotAllowed uses id', () => {
    const err = new SystemCategoryUpdateNotAllowed('cat-1');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('SYSTEM_CATEGORY_UPDATE_NOT_ALLOWED');
    expect(err.message).toBe('Updating system category not allowed');
    expect(err.categoryId).toBe('cat-1');
  });

  it('SystemCategoryDeletionNotAllowed uses id', () => {
    const err = new SystemCategoryDeletionNotAllowed('cat-1');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('SYSTEM_CATEGORY_DELETION_NOT_ALLOWED');
    expect(err.message).toBe('Deleting system category not allowed');
    expect(err.categoryId).toBe('cat-1');
  });

  it('UserCategoryMissingOwner uses id', () => {
    const err = new UserCategoryMissingOwner('cat-1');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('USER_CATEGORY_MISSING_OWNER');
    expect(err.message).toBe('Invalid category state - user category is missing owner');
    expect(err.categoryId).toBe('cat-1');
  });

  it('SystemCategoryWrongType uses identifiers', () => {
    const err = new SystemCategoryWrongType('cat-1', 'exchange');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('SYSTEM_CATEGORY_WRONG_TYPE');
    expect(err.message).toBe(
      "Invalid category state - category with name 'exchange' should be system category",
    );
    expect(err.categoryId).toBe('cat-1');
    expect(err.categoryName).toBe('exchange');
  });

  it('SystemCategoryHasOwner uses id', () => {
    const err = new SystemCategoryHasOwner('cat-1');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('SYSTEM_CATEGORY_HAS_OWNER');
    expect(err.message).toBe("System category shouldn't have owner");
    expect(err.categoryId).toBe('cat-1');
  });

  it('SystemCategoryNotAllowed uses id', () => {
    const err = new SystemCategoryNotAllowed('cat-1');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('SYSTEM_CATEGORY_NOT_ALLOWED');
    expect(err.message).toBe("System category is not allowed in 'standard' transaction");
    expect(err.categoryId).toBe('cat-1');
  });
});
