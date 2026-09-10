# 📋 Frontend Integration Guide: Investment Module & Transactions

This document outlines all current backend updates, contracts, schemas, and UI recommendations for integrating the Investment feature on the frontend.

---

## 1. Overview of Architecture

The backend supports investment tracking via two synchronized layers:
1. **Financial Flow (Cash Layer)**: Standard, Exchange, Transfer, and **Investment Transactions** (with `kind: 'investment'`).
2. **Portfolio Ledger (Operations Layer)**: `InvestmentOperation` records capturing `buy`, `sell`, `interest`, `fee`, and `snapshot` operations.

Soft deletion, trash management, restoration, and permanent deletion are automatically synchronized between transactions and investment operations.

---

## 2. API Endpoints Reference

### A. Investment Instruments (`/investments/instruments`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/investments/instruments` | List investment instruments (supports `?kind=`, `?currency=`, `?search=`). |
| `POST` | `/investments/instruments` | Create a new investment instrument. |
| `GET` | `/investments/instruments/:id` | Get details of a single instrument. |
| `PATCH` | `/investments/instruments/:id` | Update an existing instrument (name, kind, currency, notes). |
| `DELETE` | `/investments/instruments/:id` | Delete an instrument and its associated snapshot operations. |

**Instrument Kinds**: `'share' | 'fund' | 'bond' | 'crypto' | 'commodity' | 'custom'`

---

### B. Investment Operations (`/investments/operations`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/investments/operations` | List investment operations (supports `?instrumentId=`, `?kind=`, `?startDate=`, `?endDate=`). |
| `POST` | `/investments/operations` | Create a point-in-time balance **snapshot** (`kind: 'snapshot'`). Non-snapshot cash flows (`buy`, `sell`, `interest`, `fee`) are created via transaction endpoints. |
| `DELETE` | `/investments/operations/:id` | Delete a snapshot operation (cashflow operations linked to transactions cannot be deleted directly here). |

---

### C. Investment Transactions (`/transactions/investment`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/transactions/investment` | Create an investment transaction (automatically creates linked `InvestmentOperation` in the database). |
| `PUT` | `/transactions/investment/:id` | Update an existing investment transaction and its linked operation. |
| `GET` | `/transactions` | List transactions (returns `kind: 'investment'` with populated `investment` details). |
| `GET` | `/transactions/:id` | Get a transaction by ID. |
| `DELETE` | `/transactions/:id` | Soft-deletes transaction and associated investment operation (moves to trash). |
| `POST` | `/transactions/:id/restore` | Restores transaction and associated investment operation from trash. |
| `DELETE` | `/transactions/trash/:id` | Permanently removes transaction and deletes associated investment operation. |

---

## 3. TypeScript Contracts & Payload Models

### A. Investment Instrument Model

```typescript
export type InvestmentInstrumentKind =
  | 'share'
  | 'fund'
  | 'bond'
  | 'crypto'
  | 'commodity'
  | 'custom';

export interface InvestmentInstrumentResponse {
  id: string;
  name: string;
  kind: InvestmentInstrumentKind;
  currency: string;
  notes?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstrumentPayload {
  name: string;
  kind?: InvestmentInstrumentKind; // default 'share'
  currency?: string;
  notes?: string;
}
```

---

### B. Investment Operations Model

Operations returned from `GET /investments/operations` use a discriminated union on `kind`:

```typescript
export type InvestmentOperationKind = 'buy' | 'sell' | 'interest' | 'fee' | 'snapshot';

// 1. Snapshot Operation (standalone checkpoint, no bank transaction linked)
export interface InvestmentSnapshotOperationResponse {
  id: string;
  kind: 'snapshot';
  ownerId: string;
  instrumentId: string;
  amount: number;       // Current asset valuation or balance
  currency: string;
  date: string;         // ISO date
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Cash Flow Operation (linked to a bank transaction)
export interface InvestmentCashFlowOperationResponse {
  id: string;
  kind: 'buy' | 'sell' | 'interest' | 'fee';
  transactionId: string; // Linked bank transaction ID
  ownerId: string;
  instrumentId: string;
  amount: number;
  currency: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvestmentOperationResponse =
  | InvestmentSnapshotOperationResponse
  | InvestmentCashFlowOperationResponse;
```

---

### C. Creating / Updating Investment Transactions (`POST /transactions/investment`)

When creating an investment transaction, you can link to an **existing instrument** OR provide an **inline new instrument** to be created on-the-fly:

```typescript
// 1. Using an existing instrument
interface CreateInvestmentTransactionWithExistingInstrumentPayload {
  amount: number;
  currency: string;
  accountId: string;
  paymentMethodId: string;
  categoryId: string;
  date: string;
  notes?: string;
  // NOTE: transactionType is NOT passed by the frontend.
  // The backend automatically computes it:
  // - buy / fee -> 'expense'
  // - sell / interest -> 'income'
  investment: {
    operationKind: 'buy' | 'sell' | 'interest' | 'fee';
    instrumentId: string;
    note?: string;
  };
}

// 2. Creating a new instrument on the fly ("Quick Add")
interface CreateInvestmentTransactionWithNewInstrumentPayload {
  amount: number;
  currency: string;
  accountId: string;
  paymentMethodId: string;
  categoryId: string;
  date: string;
  notes?: string;
  investment: {
    operationKind: 'buy' | 'sell' | 'interest' | 'fee';
    newInstrument: {
      name: string;
      kind?: 'share' | 'fund' | 'bond' | 'crypto' | 'commodity' | 'custom';
      currency?: string;
      notes?: string;
    };
    note?: string;
  };
}

export type CreateInvestmentTransactionPayload =
  | CreateInvestmentTransactionWithExistingInstrumentPayload
  | CreateInvestmentTransactionWithNewInstrumentPayload;
```

---

### D. Investment Transaction Response Shape (`GET /transactions` & `GET /transactions/:id`)

When `transaction.kind === 'investment'`, the populated investment details are returned as:

```typescript
export interface InvestmentTransactionResponse {
  id: string;
  kind: 'investment';
  transactionType: 'expense' | 'income';
  amount: number;
  currency: string;
  accountId: string;
  paymentMethodId: string;
  categoryId: string;
  date: string;
  notes?: string;
  investment: {
    operationKind: 'buy' | 'sell' | 'interest' | 'fee';
    instrument: {
      id: string;
      name: string;
      kind: 'share' | 'fund' | 'bond' | 'crypto' | 'commodity' | 'custom';
      currency: string;
    };
    note?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Recommended Frontend UI Components & Flows

1. **Transaction Form / Modal**:
   - Add an **"Investment"** tab/radio option alongside Standard, Transfer, and Exchange.
   - Select operation kind (`buy`, `sell`, `interest`, `fee`).
   - Select existing instrument via search dropdown or type a new instrument name with "Create new instrument" quick-add support.
   - Bank Account, Payment Method, Category, Amount, Currency, Date, and Notes inputs.

2. **Instruments View (`/investments/instruments`)**:
   - List instruments with badges for kind (`share`, `crypto`, `fund`, etc.) and currency.
   - "New Instrument" creation modal.
   - Instrument edit / delete actions.

3. **Operations View (`/investments/operations`)**:
   - Filter operations by instrument, operation kind, and date range.
   - "Add Snapshot" button to record point-in-time balance valuations.

4. **Trash & Restoration**:
   - Trashed transactions automatically soft-delete linked investment operations.
   - Restoring a trashed investment transaction automatically restores its ledger operation.
