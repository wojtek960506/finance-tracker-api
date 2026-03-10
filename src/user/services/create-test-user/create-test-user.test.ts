import { USER_ID_STR } from '@testing/factories/general';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { createRandomTransactions } from '@transaction/services';
import { createUser } from '@user/services';

import { createTestUser } from './create-test-user';

const sessionMock = {} as any;

vi.mock('@utils/with-session', () => ({
  withSession: vi.fn().mockImplementation(async (func, ...args) => {
    return await func(sessionMock, ...args);
  }),
}));
vi.mock('@user/services', () => ({ createUser: vi.fn() }));
vi.mock('@transaction/services', () => ({ createRandomTransactions: vi.fn() }));

describe('createTestUser', () => {
  const USERNAME = 'testUser';
  const TOTAL_TRANSACTIONS = 1000;
  const DEFAULT_TRANSACTIONS = 200;
  const EMAIL = `${USERNAME}@test.com`;
  const NEW_BODY = {
    firstName: USERNAME,
    lastName: USERNAME,
    email: EMAIL,
    password: '123',
  };
  const dto = { username: USERNAME, totalTransactions: TOTAL_TRANSACTIONS };
  const dtoWithoutTotalTransactions = { username: USERNAME };
  const testUser = { id: USER_ID_STR, email: EMAIL };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('create test user with specified total transactions', async () => {
    (createUser as Mock).mockResolvedValue(testUser);
    (createRandomTransactions as Mock).mockResolvedValue(TOTAL_TRANSACTIONS);

    const result = await createTestUser(dto);

    expect(createUser).toHaveBeenCalledOnce();
    expect(createUser).toHaveBeenCalledWith(NEW_BODY, sessionMock);
    expect(createRandomTransactions).toHaveBeenCalledOnce();
    expect(createRandomTransactions).toHaveBeenCalledWith(
      USER_ID_STR,
      TOTAL_TRANSACTIONS,
      sessionMock,
    );
    expect(result).toEqual({
      userId: USER_ID_STR,
      email: EMAIL,
      insertedTransactionsCount: TOTAL_TRANSACTIONS,
    });
  });

  it('create test user with default number of total transactions', async () => {
    (createUser as Mock).mockResolvedValue(testUser);
    (createRandomTransactions as Mock).mockResolvedValue(DEFAULT_TRANSACTIONS);

    const result = await createTestUser(dtoWithoutTotalTransactions);

    expect(createUser).toHaveBeenCalledOnce();
    expect(createUser).toHaveBeenCalledWith(NEW_BODY, sessionMock);
    expect(createRandomTransactions).toHaveBeenCalledOnce();
    expect(createRandomTransactions).toHaveBeenCalledWith(
      USER_ID_STR,
      DEFAULT_TRANSACTIONS,
      sessionMock,
    );
    expect(result).toEqual({
      userId: USER_ID_STR,
      email: EMAIL,
      insertedTransactionsCount: DEFAULT_TRANSACTIONS,
    });
  });
});
