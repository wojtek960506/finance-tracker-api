import { getTransactionCreateTransactionDTO, getTransferTransactionProps } from "@utils/__mocks__/transactions/create-transfer";
import { randomObjectIdString } from "@utils/random";
import { describe, expect, it } from "vitest";
import { prepareTransferProps } from "./prepare-transfer-props";

describe("prepareTransferProps", () => {
  it("prepareProps", () => {
    const dto = getTransactionCreateTransactionDTO();
    const OWNER_ID = randomObjectIdString();
    const FROM_IDX = 1;
    const TO_IDX = 2;

    const {
      fromTransactionProps: fromProps,
      toTransactionProps: toProps,
    } = prepareTransferProps(dto, OWNER_ID, FROM_IDX, TO_IDX);

    const mockProps = getTransferTransactionProps(OWNER_ID, FROM_IDX, TO_IDX);

    expect(fromProps).toEqual(mockProps.fromProps);
    expect(toProps).toEqual(mockProps.toProps);
  })
})