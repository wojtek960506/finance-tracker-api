import { TransactionResponseDTO } from "@schemas/transaction";

type GetCSVPayload = Omit<
  TransactionResponseDTO,
  "ownerId" | "createdAt" | "updatedAt" | "id" | "refId" | "date"
> & { date: string }

export function getCsvForTransactions(payload: GetCSVPayload) {
  let result = '';
  result += 'sourceIndex,date,description,amount,currency,category,paymentMethod,' +
    'account,exchangeRate,currencies,transactionType,sourceRefIndex\n';
  const tmp = (propName: keyof GetCSVPayload, isLast: boolean = false) => (
    (payload[propName] ? payload[propName] : '') + (isLast ? '' : ',')
  );
  result += tmp("sourceIndex");
  result += tmp("date");
  result += tmp("description");
  result += tmp("amount");
  result += tmp("currency");
  result += tmp("category");
  result += tmp("paymentMethod");
  result += tmp("account");
  result += tmp("exchangeRate");
  result += tmp("currencies");
  result += tmp("transactionType");
  result += tmp("sourceRefIndex", true);
  result += '\n';
  
  return result;
}