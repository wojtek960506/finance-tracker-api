import { AppError } from "./general-errors";


export class CategoryNotFoundError extends AppError {
  readonly code = "CATEGORY_NOT_FOUND";

  constructor(readonly categoryId?: string, readonly categoryName?: string) {
    super(404, "Category not found");
  }
}

export class CategoryOwnershipError extends AppError {
  readonly code = 'CATEGORY_OWNERSHIP_VIOLATION';

  constructor(
    readonly wrongUserId: string,
    readonly categoryId: string,
    readonly categoryOwnerId: string,
  ) {
    super(403, 'Category does not belong to the current user');
  }
}

export class CategoryAlreadyExistsError extends AppError {
  readonly code = 'CATEGORY_ALREADY_EXISTS';

  constructor(readonly categoryName: string) {
    super(409, `Category with normalized name '${categoryName}' already exists`);
  }
}
