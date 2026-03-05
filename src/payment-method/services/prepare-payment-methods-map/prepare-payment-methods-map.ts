import { findPaymentMethods } from "@payment-method/db";
import { ITransaction } from "@transaction/model";
import { PaymentMethodResponseDTO } from "@payment-method/schema";


export type PaymentMethodsMap = Record<
  string,
  Pick<PaymentMethodResponseDTO, "id" | "type" | "name">
>;

export const preparePaymentMethodsMap = async (
  ownerId: string,
  transactions?: Pick<ITransaction, "paymentMethodId">[]
) => {
  const paymentMethodIds = transactions?.map(t => t.paymentMethodId.toString());
  const paymentMethods = await findPaymentMethods(ownerId, paymentMethodIds);
  return Object.fromEntries(paymentMethods.map(
    c => [c._id.toString(), { id: c._id.toString(), type: c.type, name: c.name }]
  ));
}
