import { describe, expect, it, Mock, vi } from "vitest";
import { saveTransactionChanges } from "@db/transactions/";
import { serializeTransaction } from "@schemas/serializers";
import {
  getStandardTransactionDTO,
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
} from "@/test-utils/factories/transaction";


vi.mock("@schemas/serializers", () => ({
  serializeTransaction: vi.fn(),
}));

describe("saveTransactionChanges", async () => {

  const saveMock = vi.fn();
  const populateMock = vi.fn();

  const dto = getStandardTransactionDTO();
  const transactionJSON = getStandardTransactionResultJSON();
  const transactionSerialized = getStandardTransactionResultSerialized();

  const newProps = { ...dto, amount: 123 }
  const transaction = { ...transactionJSON, save: saveMock, populate: populateMock } as any;
  const transactionAfterUpdate = { ...transaction, ...dto, amount: 123 }
  const transactionAfterSerialization = { ...transactionSerialized, amount: 123 }

  it("save single transaction changes ", async () => {
     (serializeTransaction as Mock).mockReturnValue(transactionAfterSerialization);

     const result = await saveTransactionChanges(transaction, newProps);

     expect(saveMock).toHaveBeenCalledOnce();
     expect(populateMock).toHaveBeenCalledOnce();
     expect(serializeTransaction).toHaveBeenCalledOnce();
     expect(serializeTransaction).toHaveBeenCalledWith(transactionAfterUpdate);
     expect(result).toEqual(transactionAfterSerialization);
  });
});
