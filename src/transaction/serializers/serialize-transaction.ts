import { InvestmentOperationsMap } from '@investment/services';

import { NamedResourcesMap } from '@named-resource/kind-config';
import { ITransaction } from '@transaction/model';
import {
  TransactionResponseDTO,
  TrashedTransactionResponseDTO,
} from '@transaction/schema';

type TransactionObject = any;

export interface TransactionSerializationMaps {
  categoriesMap?: NamedResourcesMap;
  paymentMethodsMap?: NamedResourcesMap;
  accountsMap?: NamedResourcesMap;
  investmentsMap?: InvestmentOperationsMap;
}

const buildTransactionPayload = (
  transaction: TransactionObject,
  maps?: TransactionSerializationMaps,
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

  const category = maps?.categoriesMap
    ? maps.categoriesMap[categoryId.toString()]
    : { id: categoryId._id.toString(), type: categoryId.type, name: categoryId.name };
  const paymentMethod = maps?.paymentMethodsMap
    ? maps.paymentMethodsMap[paymentMethodId.toString()]
    : {
        id: paymentMethodId._id.toString(),
        type: paymentMethodId.type,
        name: paymentMethodId.name,
      };
  const account = maps?.accountsMap
    ? maps.accountsMap[accountId.toString()]
    : { id: accountId._id.toString(), type: accountId.type, name: accountId.name };

  const investment = maps?.investmentsMap
    ? maps.investmentsMap[_id.toString()]
    : undefined;

  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
    refId: refId?.toString(),
    category,
    paymentMethod,
    account,
    ...(investment ? { investment } : {}),
  };
};

export function serializeTransaction(
  transaction: ITransaction,
  maps?: TransactionSerializationMaps,
): TransactionResponseDTO {
  return buildTransactionPayload(transaction.toObject(), maps);
}

export function serializeTrashedTransaction(
  transaction: ITransaction,
  maps?: TransactionSerializationMaps,
): TrashedTransactionResponseDTO {
  const serialized = buildTransactionPayload(transaction.toObject(), maps);
  const deletion = transaction.toObject().deletion;

  return {
    ...serialized,
    deletion: {
      deletedAt: deletion!.deletedAt,
      purgeAt: deletion!.purgeAt,
    },
  };
}
