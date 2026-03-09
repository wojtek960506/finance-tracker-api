import { findPaymentMethodByName, persistPaymentMethod } from '@payment-method/db';
import { PaymentMethodDTO, PaymentMethodResponseDTO } from '@payment-method/schema';
import { createNamedResource } from '@shared/named-resource';
import { PaymentMethodAlreadyExistsError } from '@utils/errors';

export const createPaymentMethod: (
  ownerId: string,
  dto: PaymentMethodDTO,
) => Promise<PaymentMethodResponseDTO> = createNamedResource<
  PaymentMethodDTO,
  PaymentMethodResponseDTO
>({
  findByName: findPaymentMethodByName,
  persist: persistPaymentMethod,
  alreadyExistsErrorFactory: (name) => new PaymentMethodAlreadyExistsError(name),
});
