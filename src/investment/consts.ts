export const INVESTMENT_INSTRUMENT_KINDS = [
  'share',
  'fund',
  'termDeposit',
  'savings',
] as const;

export const INVESTMENT_OPERATION_KINDS = [
  'buy',
  'sell',
  'interest',
  'fee',
  'snapshot',
] as const;

export const INVESTMENT_OPERATION_CASH_FLOW_KINDS = new Set([
  'buy',
  'sell',
  'interest',
  'fee',
]);
