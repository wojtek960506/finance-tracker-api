import { findCategoryByName } from '@category/db';
import { serializeCategory } from '@category/serializers';
import { createCategory } from '@category/services';
import { getOrCreateNamedResource } from '@shared/named-resource';

export const getOrCreateCategory = (ownerId: string, name: string) => {
  return getOrCreateNamedResource({
    findByName: findCategoryByName,
    serialize: serializeCategory,
    create: createCategory,
  })(ownerId, name);
};
