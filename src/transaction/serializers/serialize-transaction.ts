import { NamedResourcesMap } from '@named-resource/kind-config';
import { ITransaction } from '@transaction/model';
import {
  TransactionResponseDTO,
  TrashedTransactionResponseDTO,
} from '@transaction/schema';

type TransactionObject = any;

const buildTransactionPayload = (
  transaction: TransactionObject,
  categoriesMap?: NamedResourcesMap,
  paymentMethodsMap?: NamedResourcesMap,
  accountsMap?: NamedResourcesMap,
) => {
  const {
    _id,
    __v,
    ownerId,
    refId,
    deletion,
    categoryId,
    paymentMethodId,
    accountId,
    ...rest
  } = transaction;

  const category = categoriesMap
    ? categoriesMap[categoryId.toString()]
    : { id: categoryId._id.toString(), type: categoryId.type, name: categoryId.name };
  const paymentMethod = paymentMethodsMap
    ? paymentMethodsMap[paymentMethodId.toString()]
    : {
        id: paymentMethodId._id.toString(),
        type: paymentMethodId.type,
        name: paymentMethodId.name,
      };
  const account = accountsMap
    ? accountsMap[accountId.toString()]
    : { id: accountId._id.toString(), type: accountId.type, name: accountId.name };

  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
    refId: refId?.toString(),
    category,
    paymentMethod,
    account,
  };
};

export function serializeTransaction(transaction: ITransaction): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap: NamedResourcesMap,
  paymentMethodsMap: NamedResourcesMap,
  accountsMap: NamedResourcesMap,
): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap?: NamedResourcesMap,
  paymentMethodsMap?: NamedResourcesMap,
  accountsMap?: NamedResourcesMap,
): TransactionResponseDTO {
  return buildTransactionPayload(
    transaction.toObject(),
    categoriesMap,
    paymentMethodsMap,
    accountsMap,
  );
}

export function serializeTrashedTransaction(
  transaction: ITransaction,
): TrashedTransactionResponseDTO;
export function serializeTrashedTransaction(
  transaction: ITransaction,
  categoriesMap: NamedResourcesMap,
  paymentMethodsMap: NamedResourcesMap,
  accountsMap: NamedResourcesMap,
): TrashedTransactionResponseDTO;
export function serializeTrashedTransaction(
  transaction: ITransaction,
  categoriesMap?: NamedResourcesMap,
  paymentMethodsMap?: NamedResourcesMap,
  accountsMap?: NamedResourcesMap,
): TrashedTransactionResponseDTO {
  const serialized = buildTransactionPayload(
    transaction.toObject(),
    categoriesMap,
    paymentMethodsMap,
    accountsMap,
  );
  const deletion = transaction.toObject().deletion;

  return {
    ...serialized,
    deletion: {
      deletedAt: deletion!.deletedAt,
      purgeAt: deletion!.purgeAt,
    },
  };
}
