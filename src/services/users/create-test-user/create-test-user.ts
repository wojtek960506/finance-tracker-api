import { ClientSession } from "mongoose";
import { withSession } from "@utils/with-session";
import { TestUserCreateResponse } from "@services/users";
import { createUser } from "@services/users/create-user";
import { TestUserCreateDTO, UserCreateDTO } from "@schemas/user";
import { createRandomTransactions } from "@services/transactions";


const createTestUserCore = async (
  session: ClientSession,
  dto: UserCreateDTO,
  totalTransactions: number,
): Promise<TestUserCreateResponse> => {
  const { id: userId, email } = await createUser(dto, session);

  const insertedTransactionsCount = await createRandomTransactions(
    userId, totalTransactions, session,
  );

  return { userId, email, insertedTransactionsCount }
}

export const createTestUser = async (
  dto: TestUserCreateDTO,
): Promise<TestUserCreateResponse> => {
  const { username, totalTransactions } = dto;

  const newBody = {
    firstName: username,
    lastName: username,
    email: `${username}@test.com`,
    password: '123',
  };

  return withSession(createTestUserCore, newBody, totalTransactions);
}