import { describe, expect, it } from "vitest";
import { validateBody } from "./validation";
import { TransactionCreateSchema } from "@schemas/transaction";
import { generateFullTransaction, generatePartialTransaction } from "./__mocks__/transactionMock";
import { FastifyRequest } from "fastify";
import { ValidationError } from "./errors";


describe("validateBody", () => {

  it("when data is proper then no errors", async () => {
    const fullBody = generateFullTransaction();
    const req = { body: { ...fullBody } };

    const validateFunc = validateBody(TransactionCreateSchema);
    
    await validateFunc(req as FastifyRequest, {} as any);
    expect(req.body).toEqual(fullBody);
  })

  it("when data is proper then no errors", async () => {
    const partialBody = generatePartialTransaction()
    const req = { body: { ...partialBody } };

    const validateFunc = validateBody(TransactionCreateSchema);
    
    try {
      await validateFunc(req as FastifyRequest, {} as any);
      throw new Error("Expected `validateFunc` to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
      expect((error as ValidationError).details).not.toBeUndefined();
    }
  })

})