import { describe, expect, it } from 'vitest';

import { serializeUser } from '@user/serializers';

import { getUserResultJSON, getUserResultSerialized } from '@/testing/factories/user';

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
