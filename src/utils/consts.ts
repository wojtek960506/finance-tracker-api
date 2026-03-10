export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const SYSTEM_CATEGORY_NAMES = new Set(['exchange', 'myAccount']);

export const SYSTEM_PAYMENT_METHOD_NAMES = new Set([
  'atm',
  'card',
  'cash',
  'bankTransfer',
]);

export const CURRENCIES = new Set(['PLN', 'EUR', 'CZK', 'GBP', 'USD', 'HUF', 'RON']);

export const ACCOUNTS = new Set([
  'cash',
  'pekao',
  'mBank',
  'revolut',
  'veloBank',
  'nestBank',
  'aliorBank',
  'cardByCliq',
  'creditAgricole',
]);

export const TRANSACTION_TYPES = new Set(['expense', 'income']);
