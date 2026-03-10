import { ClientSession, Model } from 'mongoose';

import { NamedResourceMinimal } from '@shared/named-resource';
import { normalizeWhitespace } from '@utils/strings';
import { withSession } from '@utils/with-session';

const upsertSystemNamedResourcesCore = async <TResource extends NamedResourceMinimal>(
  session: ClientSession,
  model: Model<TResource>,
  names: Set<string>,
) => {
  for (const name of names) {
    const nameNormalizedWhitespace = normalizeWhitespace(name);
    const doc = {
      type: 'system',
      name: nameNormalizedWhitespace,
      nameNormalized: nameNormalizedWhitespace.toLowerCase(),
    };
    await model.updateOne(doc, { $setOnInsert: doc }, { upsert: true, session });
  }
};

export const upsertSystemNamedResources = async <TResource extends NamedResourceMinimal>(
  model: Model<TResource>,
  names: Set<string>,
) => withSession(upsertSystemNamedResourcesCore, model, names);
