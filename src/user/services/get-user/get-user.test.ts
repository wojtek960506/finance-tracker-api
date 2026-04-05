import { describe, expect, it, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import { getUserResultJSON, getUserResultSerialized } from '@testing/factories/user';
import * as db from '@user/db';
import * as serializers from '@user/serializers';
import { AppError } from '@utils/errors';

import { getUser } from './get-user';

describe('getUser', () => {
  it('get not authenticated user', async () => {
    vi.spyOn(db, 'findUser');
    vi.spyOn(serializers, 'serializeUser');
    await expect(getUser(USER_ID_STR, '123')).rejects.toThrow(AppError);
    expect(db.findUser).not.toHaveBeenCalled();
    expect(serializers.serializeUser).not.toHaveBeenCalled();
  });

  it('get authenticated user', async () => {
    const userJSON = getUserResultJSON();
    const userSerialized = getUserResultSerialized();

    vi.spyOn(db, 'findUser').mockResolvedValue(userJSON as any);
    vi.spyOn(serializers, 'serializeUser').mockResolvedValue(userSerialized as any);

    const result = await getUser(USER_ID_STR, USER_ID_STR);

    expect(db.findUser).toHaveBeenCalledOnce();
    expect(db.findUser).toHaveBeenCalledWith(USER_ID_STR);
    expect(serializers.serializeUser).toHaveBeenCalledOnce();
    expect(serializers.serializeUser).toHaveBeenCalledWith(userJSON);
    expect(result).toEqual(userSerialized);
  });
});
