import { ClientSession, startSession } from "mongoose"


export const withSession = async <T>(
  func: (
    session: ClientSession,
    ...args: any[]
  ) => Promise<T>,
  ...args: any[]
): Promise<T> => {

  let result: T | undefined = undefined;
  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      result = await func(session, ...args);
    })
  } finally {
    await session.endSession();
  }

  return result!;
}
