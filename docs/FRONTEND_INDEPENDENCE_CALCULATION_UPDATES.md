# 📌 Frontend Note: Calculation & Category Exclusion Updates for `GET /api/net-worth/independence`

This note summarizes the recent updates made to the Financial Independence & Liquid Safety Buffer aggregation logic in `finance-tracker-api`.

---

## 1. Summary of Changes

### A. Non-Living Transaction Kinds Filtered Out
* **Previous behavior**: Transfers between accounts (`kind: 'transfer'`), currency exchanges (`kind: 'exchange'`), and asset investments/deposits (`kind: 'investment'`) were counted as regular expenses or incomes.
* **New behavior**: Only standard consumption transactions are aggregated into `grossExpenses`, `nonWorkIncome`, and `workIncome`. Internal capital movements (`transfer`, `exchange`, `investment`) are completely excluded.
* **Impact for UI**: `grossExpenses` now accurately reflects true daily living expenses and lifestyle cost, eliminating artificial burn rate inflation caused by moving money into savings or buying stocks.

### B. Category Exclusions Now Apply to Both Expenses & Incomes
* **Previous behavior**: `excludeCategoryIds` / `excludeCategoryNames` (and auto-detected work categories) only excluded transactions from the **income** side (treating them as `workIncome` rather than `nonWorkIncome`), but did not filter out expenses under those categories.
* **New behavior**: Any category matched by `excludeCategoryIds` or `excludeCategoryNames` (or auto-detected work categories) is excluded from **both** living expenses (`grossExpenses`) and non-work passive income (`nonWorkIncome`).
* **Multi-filter support**: Supplying both `excludeCategoryIds` and `excludeCategoryNames` simultaneously is supported (merges both filters).

### C. `netBurnRate` Flooring
* **Previous behavior**: `netBurnRate` could be negative when `nonWorkIncome > grossExpenses`.
* **New behavior**: `monthlyAverages.netBurnRate` is guaranteed to be non-negative (`Math.max(0, grossExpenses - nonWorkIncome)`).
* When `grossExpenses <= nonWorkIncome`, `netBurnRate` is `0` and `independence.isPerpetual` is `true`.

---

## 2. Updated Metrics Breakdown

| Metric | Field | Description & Aggregation Rules |
| :--- | :--- | :--- |
| **Gross Living Expenses** | `monthlyAverages.grossExpenses` | Average monthly spending strictly from consumption expenses (`transactionType: 'expense'`, `kind: { $nin: ['transfer', 'exchange', 'investment'] }`, `categoryId` not in excluded categories). |
| **Passive / Non-Work Income** | `monthlyAverages.nonWorkIncome` | Average monthly passive inflows (cashbacks, reimbursements, dividends, rental income) excluding salary/work and excluded categories. |
| **Work Income** | `monthlyAverages.workIncome` | Average monthly salary / work income from detected or specified work categories. |
| **Net Burn Rate** | `monthlyAverages.netBurnRate` | Real monthly capital drain (`Math.max(0, grossExpenses - nonWorkIncome)`). |
| **Perpetual Independence** | `independence.isPerpetual` | `true` when passive non-work income fully covers living expenses (`grossExpenses <= nonWorkIncome`). |

---

## 3. Query Parameters Reference

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `baseCurrency` | `string` | No | `undefined` | Target currency for normalization (e.g. `PLN`, `USD`, `EUR`). |
| `periodMonths` | `number` | No | `12` | Number of past months to sample for monthly averages (1–120). |
| `startDate` | `string` (ISO) | No | `now - periodMonths` | Custom start date for historical transaction analysis. |
| `endDate` | `string` (ISO) | No | `now` | Custom end date for historical transaction analysis. |
| `excludeCategoryIds` | `string` (comma-sep) | No | Auto-detected work | ObjectIds to exclude from **both** living expenses and passive incomes. |
| `excludeCategoryNames` | `string` (comma-sep) | No | Auto-detected work | Category names to exclude from **both** expenses and passive incomes (case-insensitive). |
