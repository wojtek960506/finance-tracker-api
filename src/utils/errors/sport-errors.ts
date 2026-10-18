import { AppError } from './general-errors';

export class SportCategoryNotFoundError extends AppError {
  readonly code = 'SPORT_CATEGORY_NOT_FOUND';

  constructor(
    readonly categoryId?: string,
    readonly categoryName?: string,
  ) {
    super(404, 'Sport category not found');
  }
}

export class SportCategoryOwnershipError extends AppError {
  readonly code = 'SPORT_CATEGORY_OWNERSHIP_VIOLATION';

  constructor(
    readonly wrongUserId: string,
    readonly categoryId: string,
    readonly categoryOwnerId: string,
  ) {
    super(403, 'Sport category does not belong to the current user');
  }
}

export class SportCategoryDependencyError extends AppError {
  readonly code = 'SPORT_CATEGORY_DEPENDENCY_ERROR';

  constructor(readonly categoryId: string) {
    super(403, 'Sport category is being used by some sport entries');
  }
}

export class SportCategoryAlreadyExistsError extends AppError {
  readonly code = 'SPORT_CATEGORY_ALREADY_EXISTS';

  constructor(readonly categoryName: string) {
    super(409, `Sport category with normalized name '${categoryName}' already exists`);
  }
}

export class SportCategorySystemNameConflictError extends AppError {
  readonly code = 'SPORT_CATEGORY_SYSTEM_NAME_CONFLICT';

  constructor(readonly categoryName: string) {
    super(
      409,
      `Sport category name '${categoryName}' is reserved by a system category. ` +
        'Choose a different name',
    );
  }
}

export class SystemSportCategoryUpdateNotAllowed extends AppError {
  readonly code = 'SYSTEM_SPORT_CATEGORY_UPDATE_NOT_ALLOWED';

  constructor(readonly categoryId: string) {
    super(403, 'Updating system sport category not allowed');
  }
}

export class SystemSportCategoryDeletionNotAllowed extends AppError {
  readonly code = 'SYSTEM_SPORT_CATEGORY_DELETION_NOT_ALLOWED';

  constructor(readonly categoryId: string) {
    super(403, 'Deleting system sport category not allowed');
  }
}

export class UserSportCategoryMissingOwner extends AppError {
  readonly code = 'USER_SPORT_CATEGORY_MISSING_OWNER';

  constructor(readonly categoryId: string) {
    super(500, 'Invalid category state - user sport category is missing owner');
  }
}

export class SportEntryNotFoundError extends AppError {
  readonly code = 'SPORT_ENTRY_NOT_FOUND';

  constructor(readonly entryId: string) {
    super(404, 'Sport entry not found');
  }
}

export class SportEntryOwnershipError extends AppError {
  readonly code = 'SPORT_ENTRY_OWNERSHIP_VIOLATION';

  constructor(
    readonly wrongUserId: string,
    readonly entryId: string,
    readonly entryOwnerId: string,
  ) {
    super(403, 'Sport entry does not belong to the current user');
  }
}
