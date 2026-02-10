import { AppError } from "@utils/errors/general-errors";


export class UserNotFoundError extends AppError {
  readonly code = "USER_NOT_FOUND_ERROR";

  constructor(readonly userId: string) {
    super(404, "User not found");
  }
}
