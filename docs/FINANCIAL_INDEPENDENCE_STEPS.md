# 🗺️ Implementation Steps: Financial Independence & Safety Buffer (`GET /api/net-worth/independence`)

This roadmap document tracks the step-by-step progress of implementing the Financial Independence and Liquid Safety Buffer calculation on the `feat/financial-independence` branch.

---

## Progress Checklist

- [x] **Step 1: Branch Setup & Planning Documentation**
  - [x] Create and switch to branch `feat/financial-independence`
  - [x] Create step-by-step tracking document `docs/FINANCIAL_INDEPENDENCE_STEPS.md`

- [x] **Step 2: Zod Schemas & DTO Type Contracts**
  - [x] Add `NetWorthIndependenceQuerySchema` with query parameters (`baseCurrency`, `periodMonths`, `startDate`, `endDate`, `excludeCategoryIds`, `excludeCategoryNames`)
  - [x] Add `NetWorthIndependenceResponseSchema` with multi-tier capital metrics (`liquidCash`, `savings`, `liquidCapital`, `total`), monthly averages, realistic `independence` horizons, `zeroIncomeBaseline` stress test, and `excludedCategories`
  - [x] Add unit tests in `src/net-worth/schema/net-worth-schema.test.ts`

- [x] **Step 3: Financial Independence Calculation Engine & Service**
  - [x] Implement `src/net-worth/services/get-financial-independence.ts`:
    - Auto-detection of active salary/work categories (`praca`, `work`, `salary`, `wynagrodzenie`, `zarobki`, `etat`, `b2b`) + explicit override support
    - Fetch current wealth state (`getNetWorth`) to extract `liquidCash`, `savings`, and `total`
    - Aggregate historical transactions across `[startDate, endDate]`
    - Currency conversion & normalization using `getCrossRate` / `fetchLatestRates`
    - Compute monthly averages, `netBurnRate`, `independence` horizons, and `zeroIncomeBaseline`
  - [x] Implement comprehensive unit tests in `src/net-worth/services/get-financial-independence.test.ts`
  - [x] Export service from `src/net-worth/services/index.ts`

- [x] **Step 4: Route Handler & Fastify Integration**
  - [x] Create `src/net-worth/routes/handlers/get-financial-independence-handler.ts`
  - [x] Register `GET /independence` route in `src/net-worth/routes/net-worth-routes.ts`
  - [x] Add integration tests in `src/net-worth/routes/net-worth-routes.test.ts`

- [x] **Step 5: Documentation & OpenAPI Specification Export**
  - [x] Create `docs/FRONTEND_INTEGRATION_INDEPENDENCE.md`
  - [x] Export updated `openapi.json` via `pnpm openapi:export`
  - [x] Run full test suite (`pnpm test`), linting (`pnpm lint`), and formatting (`pnpm format:fix`)
