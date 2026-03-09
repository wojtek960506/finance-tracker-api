type SerializableNamedResource = {
  toObject: () => {
    _id: { toString: () => string };
    ownerId?: { toString: () => string };
    __v?: number;
    [key: string]: unknown;
  };
};

type SerializedNamedResource = {
  id: string;
  ownerId?: string;
};

export const serializeNamedResource = <TResponse extends SerializedNamedResource>(
  resource: SerializableNamedResource,
) => {
  const { _id, ownerId, __v, ...rest } = resource.toObject();

  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId ? ownerId.toString() : undefined,
  } as TResponse;
};
