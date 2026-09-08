# 📢 Backend API Update: Explicit `kind` Discriminator on Transactions

We have updated the Transaction schemas and API endpoints to introduce an explicit **`kind`** discriminator property across all transaction types.

## 1. Summary of Changes

Every transaction object returned by the API (and required in creation/update payloads) now includes a `kind` attribute:

```typescript
export type TransactionKind = 'standard' | 'exchange' | 'transfer' | 'investment';
```

- **Standard Transactions**: `kind: 'standard'`
- **Exchange Transactions**: `kind: 'exchange'`
- **Transfer Transactions**: `kind: 'transfer'`
- **Investment Transactions**: `kind: 'investment'`

---

## 2. Frontend Action Items

1. **Type Definitions / Discriminated Unions**:
   Update frontend TypeScript response definitions to include `kind`. You can now narrow returned transaction types safely via `transaction.kind`:
   ```typescript
   if (transaction.kind === 'exchange') {
     // narrowed to Exchange transaction
   }
   ```

2. **Creation & Update Payloads (`kind` is NOT included in request bodies)**:
   - Request body schemas for `POST /transactions/standard`, `POST /transactions/exchange`, `POST /transactions/transfer` (and their `PUT` equivalents) **do not accept `kind`**. The backend route automatically assigns the correct `kind` when creating/updating.
   - For `POST /transactions/bulk`, items are identified by their property signature (`transactionType` for standard, `currencyExpense` for exchange, otherwise transfer).

3. **Regenerate API Client / Types**:
   The OpenAPI specification on the backend (`openapi.json` / `/docs`) has been re-generated to reflect these input and response schema changes. You can re-generate your frontend API client or SDK models from the updated spec.

---

## 3. Database Status

Existing database records have been fully backfilled with the appropriate `kind` values.

