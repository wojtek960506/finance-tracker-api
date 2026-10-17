export const DEFAULT_SPORTS_LIMIT = 50;
export const MAX_SPORTS_LIMIT = 200;

export const SPORT_ENTRY_SORT_OPTIONS = [
  'date_desc',
  'date_asc',
  'cost_desc',
  'cost_asc',
] as const;

export type SportEntrySortOption = (typeof SPORT_ENTRY_SORT_OPTIONS)[number];

export const DEFAULT_SPORT_ENTRY_SORT: SportEntrySortOption = 'date_desc';
