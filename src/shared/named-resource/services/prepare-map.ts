export const prepareNamedResourcesMap = <
  TResource extends {
    _id: { toString: () => string };
    type: 'user' | 'system';
    name: string;
  },
>(
  resources: TResource[],
) => {
  return Object.fromEntries(
    resources.map((resource) => [
      resource._id.toString(),
      {
        id: resource._id.toString(),
        type: resource.type,
        name: resource.name,
      },
    ]),
  );
};
