export type NamedResourceMinimal = {
  type: 'user' | 'system';
  ownerId?: unknown;
  _id: { toString: () => string };
  name: string;
  save: () => Promise<unknown>;
};

export type NamedResourceCreateProps = {
  ownerId: string;
  type: 'user' | 'system';
  name: string;
  nameNormalized: string;
};

export type NamedResourceUpdateProps = Pick<
  NamedResourceCreateProps,
  'name' | 'nameNormalized'
>;
