# Investments Module: Enhancements & Roadmap

This document outlines the completed improvements, architectural refinements, and future roadmap for the **Investments Module** and its integration with the core transaction ledger.

---

## ✅ Completed Enhancements

### 1. On-the-Fly Instrument Creation ("Quick Add" / Find-or-Create) — *Completed*

**Overview**:
Allowed users and bulk import tools to create an investment transaction without pre-creating the instrument on a separate screen.

**Implementation**:
- Updated `TransactionInvestmentSchema` to accept either an existing `instrumentId` or an inline `newInstrument` descriptor (`TransactionInvestmentNewInstrumentSchema`).
- Implemented `resolveInstrumentId` and `findOrCreateInstrument` to check for an existing instrument by normalized name or create a new one inside the session.

---

### 2. Populating Investment Details on Transaction Queries — *Completed*

**Overview**:
When querying transactions via `GET /transactions` or `GET /transactions/:id`, linked investment details (instrument metadata, operation kind, note) are automatically populated.

**Implementation**:
- Followed the batch map pattern (`prepareInvestmentOperationsMap`) to resolve investment operations in bulk without N+1 overhead.
- Serialized investment details in `TransactionInvestmentResponseSchema` and passed maps via `TransactionSerializationMaps`.

---

### 3. Dedicated Route Endpoints & Discriminated Unions — *Completed*

**Overview**:
Provided dedicated endpoints and typed schemas for each transaction kind to ensure strict payload validation, precise OpenAPI docs, and automatic TypeScript type narrowing:

- `POST /transactions/standard`, `PUT /transactions/standard/:id`
- `POST /transactions/investment`, `PUT /transactions/investment/:id`
- `POST /transactions/transfer`, `PUT /transactions/transfer/:id`
- `POST /transactions/exchange`, `PUT /transactions/exchange/:id`

**Implementation**:
- Dedicated route handlers (`createStandardTransactionHandler`, `createInvestmentTransactionHandler`, etc.) delegate directly to their respective service functions without generic payload sniffing.
- `TransactionResponseSchema` and `TransactionDetailsResponseSchema` are now `z.discriminatedUnion('kind', [...])` with kind-specific response types.

---

### 4. Operation Schema Discriminated Union (Snapshots vs. Cashflow) — *Completed*

**Overview**:
Split the `InvestmentOperation` schema into two distinct schemas with a discriminated union on `kind` at the validation and response layers:

1. **`InvestmentSnapshotOperationItemSchema` / `InvestmentSnapshotOperationResponseSchema`**:
   - `kind: z.literal('snapshot')`
   - Omits `transactionId` completely (since balance snapshots have no linked bank transaction).
   - Represents asset balance valuations at a point in time (no bank cash movement).
2. **`InvestmentCashFlowOperationSchema` / `InvestmentCashFlowOperationResponseSchema`**:
   - `kind: z.enum(['buy', 'sell', 'interest', 'fee'])`
   - `transactionId: z.string().regex(OBJECT_ID_REGEX)`
   - Represents operations linked to actual bank accounts / cash balances.

**Implementation**:
- `InvestmentOperationSchema` and `InvestmentOperationResponseSchema` are now defined as `z.discriminatedUnion('kind', [...])`.
- Updated `serializeOperation` to branch return types based on `operation.kind`.

---

## 📋 Planned Enhancements & Roadmap

### 5. Cascading Lifecycle & Trash Sync

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

---

## 7. CSV Export & Import Support for Investments & Transaction Kinds

### Overview

The current CSV export (`GET /transactions/export`) formats transactions using standard transaction and exchange properties, but lacks `kind` specification and does not extract linked investment operations. To ensure full data portability and backups, the CSV export pipeline should support investment metadata.

### Proposed CSV Columns

Add `kind` and investment-specific columns to `csvExportColumns`:

| Column Key | Header | Description | Applicable Kinds |
| :--- | :--- | :--- | :--- |
| `kind` | `kind` | Transaction kind (`standard`, `transfer`, `exchange`, `investment`) | All |
| `investmentOperationKind` | `investmentOperationKind` | Operation type (`buy`, `sell`, `interest`, `fee`) | `investment` |
| `investmentInstrumentName` | `investmentInstrumentName` | Name of the financial asset (e.g. `Apple Inc.`) | `investment` |
| `investmentInstrumentKind` | `investmentInstrumentKind` | Instrument category (`share`, `etf`, `crypto`, `bond`, `commodity`, `custom`) | `investment` |
| `investmentNote` | `investmentNote` | Free-form operation note | `investment` |

### Export Pipeline Updates

1. **Resolve Investment IDs**:
   - Update `findTransactionResourceIds` (or query during export initialization) to collect `investmentTxIds` where `kind === 'investment'`.
2. **Fetch Operations Map**:
   - Call `prepareInvestmentOperationsMap(userId, investmentTxIds)` in parallel with `prepareNamedResourcesMap`.
3. **Map Row Data in `transactionToCsvRow`**:
   - Update `transactionToCsvRow(transaction, categoriesMap, paymentMethodsMap, accountsMap, investmentsMap)` to populate the investment fields when `transaction.kind === 'investment'`.

### Round-Trip Import / Backup Restoration

Ensure that the exported CSV format can be seamlessly imported via future CSV transaction import features by leveraging the on-the-fly instrument resolver (`TransactionInvestmentNewInstrumentSchema`).

