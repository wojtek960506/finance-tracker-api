export const getOrCreateNamedResource = <
  TResource,
  TResponse extends { name: string },
>(deps: {
  findByName: (name: string, ownerId: string) => Promise<TResource | null>;
  serialize: (resource: TResource) => TResponse;
  create: (ownerId: string, dto: { name: string }) => Promise<TResponse>;
}) => {
  return async (ownerId: string, name: string) => {
    const resource = await deps.findByName(name, ownerId);
    if (resource) return deps.serialize(resource);
    return deps.create(ownerId, { name });
  };
};
