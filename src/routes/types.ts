import { TransactionAttributes } from "@models/Transaction";

export interface ParamsJustId {
  id: string;
}

export type TransactionCreateDTO = Omit<TransactionAttributes, "createdAt" | "updatedAt">;
export type TransactionUpdateDTO = TransactionCreateDTO;
export type TransactionPatchDTO = Partial<TransactionCreateDTO>;