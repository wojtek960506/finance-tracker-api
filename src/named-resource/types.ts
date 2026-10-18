export type NamedResourceKind =
  | 'account'
  | 'category'
  | 'paymentMethod'
  | 'sportCategory';

export type NamedResourceType = 'user' | 'system';

export interface NamedResourceAttributes {
  type: NamedResourceType;
  name: string;
  nameNormalized: string;
}
