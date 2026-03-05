import { normalizeWhitespace } from "@utils/strings";
import { PaymentMethodAlreadyExistsError } from "@utils/errors";
import { PaymentMethodType } from "@models/payment-method-model";
import { PaymentMethodDTO, PaymentMethodResponseDTO } from "@schemas/payment-method";
import { findPaymentMethodByName, persistPaymentMethod } from "@db/payment-methods";


export const createPaymentMethod = async (
  ownerId: string,
  dto: PaymentMethodDTO,
): Promise<PaymentMethodResponseDTO> => {
  const { name } = dto;
  
  const paymentMethod = await findPaymentMethodByName(name, ownerId);
  if (paymentMethod) throw new PaymentMethodAlreadyExistsError(name);

  const props = {
    ownerId,
    type: "user" as PaymentMethodType,
    name: normalizeWhitespace(name),
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
  }
  return persistPaymentMethod(props);
}
