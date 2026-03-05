import { PaymentMethodModel } from "@models/payment-method-model";


export const findPaymentMethods = async (
  ownerId?: string,
  paymentMethodIds?: string[],
) => {
  
  type OwnerSystemType<T extends string | undefined> = [{ ownerId: T }, { type: 'system' } ];
  type Query = {
    $or?: OwnerSystemType<string>,
    $and?: OwnerSystemType<undefined>,
    _id?: { $in: string[] },
  }

  const query: Query = {};

  if (ownerId !== undefined) query.$or = [{ ownerId }, { type: 'system' }];
  else query.$and = [{ ownerId }, { type: 'system' }];

  if (paymentMethodIds) query._id = { $in: paymentMethodIds };

  return PaymentMethodModel.find(query);
}
