import { AppError } from "@utils/errors/general-errors";


export class UserNotFoundError extends AppError {
  readonly code = "USER_NOT_FOUND_ERROR";

  constructor(readonly userId: string) {
    super(404, "User not found");
  }
}

export class UserNotAuthorizedToDeleteError extends AppError {
  readonly code = "USER_NOT_AUTHORIZED_TO_DELETE_ERROR";

  constructor(readonly userId: string, readonly authenticatedUserId: string) {
    super(403, "User is not authorized to delete this user");
  }
}

export class UserNotDeletedError extends AppError {
  readonly code = "USER_NOT_DELETED_ERROR";

  constructor(readonly userId: string) {
    super(500, "User was not deleted");
  }
}
