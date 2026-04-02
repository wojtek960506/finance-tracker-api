import { AppError } from './general-errors';

export class PaymentMethodNotFoundError extends AppError {
  readonly code = 'PAYMENT_METHOD_NOT_FOUND';

  constructor(
    readonly paymentMethodId?: string,
    readonly paymentMethodName?: string,
  ) {
    super(404, 'Payment method not found');
  }
}

export class PaymentMethodOwnershipError extends AppError {
  readonly code = 'PAYMENT_METHOD_OWNERSHIP_VIOLATION';

  constructor(
    readonly wrongUserId: string,
    readonly paymentMethodId: string,
    readonly paymentMethodOwnerId: string,
  ) {
    super(403, 'Payment method does not belong to the current user');
  }
}

export class PaymentMethodDependencyError extends AppError {
  readonly code = 'PAYMENT_METHOD_DEPENDENCY_ERROR';

  constructor(readonly paymentMethodId: string) {
    super(403, 'Payment method is being used by some transactions');
  }
}

export class PaymentMethodAlreadyExistsError extends AppError {
  readonly code = 'PAYMENT_METHOD_ALREADY_EXISTS';

  constructor(readonly paymentMethodName: string) {
    super(
      409,
      `Payment method with normalized name '${paymentMethodName}' already exists`,
    );
  }
}

export class PaymentMethodSystemNameConflictError extends AppError {
  readonly code = 'PAYMENT_METHOD_SYSTEM_NAME_CONFLICT';

  constructor(readonly paymentMethodName: string) {
    super(
      409,
      `Payment method name '${paymentMethodName}' is reserved by a system payment method. ` +
        `Choose a different name`,
    );
  }
}

export class SystemPaymentMethodUpdateNotAllowed extends AppError {
  readonly code = 'SYSTEM_PAYMENT_METHOD_UPDATE_NOT_ALLOWED';

  constructor(readonly paymentMethodId: string) {
    super(403, 'Updating system payment method not allowed');
  }
}

export class SystemPaymentMethodDeletionNotAllowed extends AppError {
  readonly code = 'SYSTEM_PAYMENT_METHOD_DELETION_NOT_ALLOWED';

  constructor(readonly paymentMethodId: string) {
    super(403, 'Deleting system payment method not allowed');
  }
}

export class UserPaymentMethodMissingOwner extends AppError {
  readonly code = 'USER_PAYMENT_METHOD_MISSING_OWNER';

  constructor(readonly paymentMethodId: string) {
    super(500, 'Invalid payment method state - user payment method is missing owner');
  }
}
