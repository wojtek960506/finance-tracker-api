export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const OTHER_CATEGORY_NAME = 'otherCategory';
export const OTHER_PAYMENT_METHOD_NAME = 'otherPaymentMethod';
export const OTHER_ACCOUNT_NAME = 'otherAccount';

export const SYSTEM_CATEGORY_NAMES = new Set([
  'exchange',
  'myAccount',
  OTHER_CATEGORY_NAME,
]);

export const SYSTEM_PAYMENT_METHOD_NAMES = new Set([
  'atm',
  'card',
  'cash',
  'bankTransfer',
  OTHER_PAYMENT_METHOD_NAME,
]);

export const SYSTEM_ACCOUNT_NAMES = new Set(['cash', OTHER_ACCOUNT_NAME]);

export const TRANSACTION_TYPES = new Set(['expense', 'income']);

export const TRANSACTION_KINDS = [
  'standard',
  'exchange',
  'transfer',
  'investment',
] as const;
