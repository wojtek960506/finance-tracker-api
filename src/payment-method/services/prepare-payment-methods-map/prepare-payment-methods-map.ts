import { findPaymentMethods } from '@payment-method/db';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { prepareNamedResourcesMap } from '@shared/named-resource';
import { ITransaction } from '@transaction/model';

export type PaymentMethodsMap = Record<
  string,
  Pick<PaymentMethodResponseDTO, 'id' | 'type' | 'name'>
>;

export const preparePaymentMethodsMap = async (
  ownerId: string,
  transactions?: Pick<ITransaction, 'paymentMethodId'>[],
) => {
  const paymentMethodIds = transactions?.map((t) => t.paymentMethodId.toString());
  const paymentMethods = await findPaymentMethods(ownerId, paymentMethodIds);
  return prepareNamedResourcesMap(paymentMethods);
};
