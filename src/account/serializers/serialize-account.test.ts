import {
  getSystemExpenseAccountResultJSON,
  getSystemExpenseAccountResultSerialized,
  getUserAccountResultJSON,
  getUserAccountResultSerialized,
} from '@testing/factories/account';
import { describe, expect, it } from 'vitest';

import { serializeAccount } from './serialize-account';

describe('serializeAccount', () => {
  const userAccountJSON = getUserAccountResultJSON();
  const userAccountSerialized = getUserAccountResultSerialized();
  const iAccountUser = {
    ...userAccountJSON,
    toObject: () => ({ ...userAccountJSON, __v: 1 }),
  };

  const systemAccountJSON = getSystemExpenseAccountResultJSON();
  const systemAccountSerialized = getSystemExpenseAccountResultSerialized();
  const iAccountSystem = {
    ...systemAccountJSON,
    toObject: () => ({ ...systemAccountJSON, __v: 1 }),
  };

  it('serialize account with owner', () => {
    const result = serializeAccount(iAccountUser as any);
    expect(result).toEqual(userAccountSerialized);
  });

  it('serialize account without owner', () => {
    const result = serializeAccount(iAccountSystem as any);
    expect(result).toEqual(systemAccountSerialized);
  });
});
