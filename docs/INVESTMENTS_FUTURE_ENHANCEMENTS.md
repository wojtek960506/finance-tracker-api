# Investments Module: Future Enhancements & Roadmap

This document outlines the planned improvements, architectural refinements, and future features for the **Investments Module** and its integration with the core transaction ledger.

---

## 1. On-the-Fly Instrument Creation ("Quick Add" / Find-or-Create)

### Overview

Allow users or import tools (e.g. CSV broker statements) to create an investment transaction without pre-creating the instrument on a separate screen.

### Proposed Schema

Update `TransactionInvestmentSchema` so `investment` accepts either an existing `instrumentId` OR inline instrument metadata:

```typescript
export const TransactionInvestmentSchema = TransactionStandardSchema.extend({
  kind: z.literal('investment'),
  transactionType: z.enum(TRANSACTION_TYPES).optional(),
  investment: z
    .object({
      operationKind: InvestmentOperationKindSchema.exclude(['snapshot']),
      note: z.string().optional(),
      // Option A: Reference existing instrument
      instrumentId: z.string().optional(),
      // Option B: Define new instrument inline
      newInstrument: z
        .object({
          name: z.string().min(1).max(100),
          kind: InstrumentKindSchema.default('custom'),
          currency: CurrencyCodeSchema.optional(), // Defaults to transaction currency
          notes: z.string().optional(),
        })
        .optional(),
    })
    .refine(
      (data) =>
        (data.instrumentId && !data.newInstrument) ||
        (!data.instrumentId && data.newInstrument),
      { message: 'Either instrumentId or newInstrument must be provided, but not both' },
    ),
});
```

### Resolver Logic

Inside `createInvestmentTransaction` (within the MongoDB transaction session):

1. If `instrumentId` is passed, validate using `findInstrumentById(ownerId, instrumentId)`.
2. If `newInstrument` is passed:
   - Normalize name (`nameNormalized = name.trim().toLowerCase()`).
   - Check if an instrument with `nameNormalized` already exists for `ownerId`.
   - If found, reuse its `_id`.
   - If not found, create a new `InvestmentInstrument` in the current session.

---

## 2. Populating Investment Details on Transaction Queries

### Overview

When fetching transactions via `GET /transactions` or `GET /transactions/:id`, include the linked investment details (instrument name, operation kind, note) for transactions where `kind === 'investment'`.

### Implementation Options

#### Option A: Batch Map in `getTransactions` (Recommended)

Follow the existing `NamedResourcesMap` pattern to avoid N+1 queries:

1. Extract all `_id`s where `kind === 'investment'`.
2. Execute a single query:
   ```typescript
   const operations = await InvestmentOperationModel.find({
     ownerId,
     transactionId: { $in: investmentTxIds },
   });
   ```
3. Map by `transactionId` and attach to `TransactionResponseDTO`.

#### Option B: Mongoose Virtual Populate

Define a reverse virtual on `transactionSchema`:

```typescript
transactionSchema.virtual('investmentOperation', {
  ref: 'InvestmentOperation',
  localField: '_id',
  foreignField: 'transactionId',
  justOne: true,
});
```

Call `.populate('investmentOperation')` during `loadOwnedTransactionDetails`.

---

## 3. Dedicated Transaction Route Endpoints vs. Discriminated Union

### Overview

Provide dedicated endpoints for each transaction kind to improve OpenAPI documentation, strict payload validation, and client SDK generation:

- `POST /transactions/standard`
- `POST /transactions/investment`
- `POST /transactions/transfer`
- `POST /transactions/exchange`

Each route handler delegates directly to its specific service (`createStandardTransaction`, `createInvestmentTransaction`, etc.) without needing generic `'investment' in dto` checks.

---

## 4. Operation Schema Discriminated Union

### Overview

Split the `InvestmentOperation` schema into two distinct schemas at the validation layer:

1. **`InvestmentSnapshotOperationSchema`**:
   - `kind: z.literal('snapshot')`
   - `transactionId: z.null()`
   - Represents asset balance valuations at a point in time (no bank cash movement).
2. **`InvestmentCashFlowOperationSchema`**:
   - `kind: z.enum(['buy', 'sell', 'dividend', 'fee', 'interest'])`
   - `transactionId: z.string()`
   - Represents transactions linked to actual bank accounts / cash balances.

---

## 5. Cascading Lifecycle & Trash Sync

### Overview

Synchronize the lifecycle of an `InvestmentOperation` when its parent `Transaction` is moved to trash, restored, or permanently deleted:

- **Soft Delete (Move to Trash)**:
  - When `deleteTransaction` runs, exclude operations whose `transactionId` is in trash from portfolio summaries and valuation calculations.
- **Restore**:
  - When `restoreTransaction` runs, re-include the linked operation.
- **Permanent Purge**:
  - When emptying trash or purging expired items, run:
    ```typescript
    await InvestmentOperationModel.deleteMany(
      {
        ownerId,
        transactionId: { $in: purgedTransactionIds },
      },
      { session },
    );
    ```

---

## 6. Portfolio Analytics & Performance Metrics

### Overview

Add specialized analytics endpoints under the `/investments` module:

1. **Portfolio Valuation (`GET /investments/portfolio/summary`)**:
   - Aggregate latest snapshot valuations and net invested capital per instrument.
2. **PnL & Returns (`GET /investments/portfolio/performance`)**:
   - Calculate realized gains (from `sell` and `dividend` operations) and unrealized gains (from latest snapshots vs. cumulative `buy` + `fee`).
3. **Asset Allocation Breakdown (`GET /investments/portfolio/allocation`)**:
   - Group portfolio holdings by `kind` (`share`, `fund`, `crypto`, `bond`, `commodity`, `custom`) and by `currency`.
