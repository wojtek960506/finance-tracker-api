import { ClientSession } from "mongoose";
import { withSession } from "@utils/with-session";
import { createUser } from "@services/users/create-user";
import { createRandomTransactions } from "@services/transactions";
import {
  UserCreateDTO,
  TestUserCreateDTO,
  TestUserCreateResponseDTO,
} from "@schemas/user";


const createTestUserCore = async (
  session: ClientSession,
  dto: UserCreateDTO,
  totalTransactions?: number,
): Promise<TestUserCreateResponseDTO> => {
  const { id: userId, email } = await createUser(dto, session);

  totalTransactions = totalTransactions ?? 200;
  const insertedTransactionsCount = await createRandomTransactions(
    userId, totalTransactions, session,
  );

  return { userId, email, insertedTransactionsCount }
}

export const createTestUser = async (
  dto: TestUserCreateDTO,
): Promise<TestUserCreateResponseDTO> => {
  const { username, totalTransactions } = dto;

  const newBody = {
    firstName: username,
    lastName: username,
    email: `${username}@test.com`,
    password: '123',
  };

  return withSession(createTestUserCore, newBody, totalTransactions);
}