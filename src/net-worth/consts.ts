export const NET_WORTH_CATEGORIES = [
  'cash',
  'share',
  'fund',
  'termDeposit',
  'savings',
] as const;

export type NetWorthCategory = (typeof NET_WORTH_CATEGORIES)[number];
