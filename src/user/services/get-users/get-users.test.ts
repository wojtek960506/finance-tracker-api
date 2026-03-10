import { getUserResultJSON, getUserResultSerialized } from '@testing/factories/user';
import { describe, expect, it, vi } from 'vitest';

import { UserModel } from '@user/model';
import * as serializers from '@user/serializers';

import { getUsers } from './get-users';

describe('getUsers', () => {
  const user = getUserResultJSON();
  const userSerialized = getUserResultSerialized();

  const sortMock = vi.fn();
  const query = { sort: sortMock };

  it('get users', async () => {
    sortMock.mockResolvedValue([user]);
    vi.spyOn(UserModel, 'find').mockReturnValue(query as any);
    vi.spyOn(serializers, 'serializeUser').mockReturnValueOnce(userSerialized as any);

    const result = await getUsers();

    expect(UserModel.find).toHaveBeenCalledOnce();
    expect(sortMock).toHaveBeenCalledOnce();
    expect(result).toEqual([userSerialized]);
  });
});
