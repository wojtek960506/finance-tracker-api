import { getUserResultJSON, getUserResultSerialized } from '@testing/factories/user';
import { describe, expect, it } from 'vitest';

import { serializeUser } from '@user/serializers';

describe('serializeUser', () => {
  const user = getUserResultJSON();
  const iUser = {
    ...user,
    toObject: () => ({ ...user, __v: 0 }),
  };
  const userSerialized = getUserResultSerialized();

  it('serialize user', () => {
    expect(serializeUser(iUser as any)).toEqual(userSerialized);
  });
});
