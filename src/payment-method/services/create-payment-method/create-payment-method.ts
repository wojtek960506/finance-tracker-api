import { normalizeWhitespace } from "@utils/strings";
import { PaymentMethodType } from "@payment-method/model";
import { PaymentMethodAlreadyExistsError } from "@utils/errors";
import { findPaymentMethodByName, persistPaymentMethod } from "@payment-method/db";
import { PaymentMethodDTO, PaymentMethodResponseDTO } from "@payment-method/schema";



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
