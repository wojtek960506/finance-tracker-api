import { NamedResourceResponseDTO } from '@shared/named-resource';
import { TransactionResponseDTO } from '@transaction/schema';

type GetCSVPayload = Omit<
  TransactionResponseDTO,
  | 'ownerId'
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'refId'
  | 'date'
  | 'category'
  | 'paymentMethod'
  | 'account'
> & { date: string } & {
  category: Pick<NamedResourceResponseDTO, 'name'>;
  paymentMethod: Pick<NamedResourceResponseDTO, 'name'>;
  account: Pick<NamedResourceResponseDTO, 'name'>;
};

export function getCsvForTransactions(payload: GetCSVPayload) {
  let result = '';
  result +=
    'sourceIndex,date,description,amount,currency,category,paymentMethod,' +
    'account,exchangeRate,currencies,transactionType,sourceRefIndex\n';

  const getPropValue = (propName: keyof GetCSVPayload, isLast: boolean = false) => {
    const value =
      propName === 'category' || propName === 'paymentMethod' || propName === 'account'
        ? payload[propName].name
        : payload[propName]
          ? payload[propName]
          : '';

    return value + (isLast ? '' : ',');
  };
  result += getPropValue('sourceIndex');
  result += getPropValue('date');
  result += getPropValue('description');
  result += getPropValue('amount');
  result += getPropValue('currency');
  result += getPropValue('category');
  result += getPropValue('paymentMethod');
  result += getPropValue('account');
  result += getPropValue('exchangeRate');
  result += getPropValue('currencies');
  result += getPropValue('transactionType');
  result += getPropValue('sourceRefIndex', true);
  result += '\n';

  return result;
}
