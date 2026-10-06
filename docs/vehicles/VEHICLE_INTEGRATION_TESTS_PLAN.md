# Vehicle Domain — Integration Tests Plan

## 1. Context & Objectives

The **Vehicle Management** module (vehicles, fuel logs, maintenance, equipment, and finance spending links) is implemented and fully unit-tested with 100% passing tests.

The goal of this phase is to write end-to-end **Integration Tests** using a real MongoDB instance via Vitest integration config (`vitest.integration.config.ts`), Fastify `.inject()`, authentication tokens, and realistic data persistence.

---

## 2. Integration Test Infrastructure

### Configuration & Commands
- **Integration Test Config**: `vitest.integration.config.ts` (includes `src/**/*.integration.test.ts`)
- **Docker Compose for Mongo**: `compose.integration.yml`
- **Commands**:
  ```bash
  # Start Mongo Integration DB container
  pnpm test:integration:db:up

  # Run Integration Tests
  pnpm test:integration

  # Stop Mongo Integration DB container
  pnpm test:integration:db:down

  # Full automated script (starts DB, runs tests, stops DB)
  pnpm test:integration:full
  ```

### Existing Test Suite Helpers (`src/testing/integration/`)
- `suite.ts`: `setupIntegrationSuite()` manages Mongo connection lifecycle, database clearing between tests, and Fastify app instance (`getApp()`).
- `auth.ts`: `createIntegrationAccessToken(userId)` creates valid JWT Bearer tokens for injected requests.
- `fixtures/users.ts`: `createIntegrationUser()` inserts test users into the database.
- `fixtures/named-resources.ts`: `getSystemNamedResources()` retrieves system accounts/categories/payment methods.
- `fixtures/transactions.ts`: `insertTransactions()` & `buildStandardTransactionDoc()`.

---

## 3. Scope & File Structure

We will implement the integration tests in `src/testing/integration/vehicles/` and add supporting fixtures in `src/testing/integration/fixtures/vehicles.ts`.

```
src/testing/integration/
├── fixtures/
│   ├── vehicles.ts                                    # [New] Vehicle domain test factories & seeders
│   ├── users.ts
│   ├── transactions.ts
│   └── named-resources.ts
└── vehicles/
    ├── vehicle-routes.integration.test.ts             # [New] Core vehicle CRUD & cascading
    ├── vehicle-fuel-routes.integration.test.ts         # [New] Fuel entries & metrics calculation
    ├── vehicle-maintenance-routes.integration.test.ts  # [New] Maintenance records & lifecycle
    ├── vehicle-equipment-routes.integration.test.ts    # [New] Equipment tracking & statuses
    └── vehicle-spending-routes.integration.test.ts     # [New] Spending linking across domains
```

---

## 4. Test Scenarios per Module

### Phase 1: Fixtures & Seeders (`src/testing/integration/fixtures/vehicles.ts`)
Implement factory functions to construct and insert documents:
- `buildVehicleDoc(overrides)` / `createIntegrationVehicle(overrides)`
- `buildFuelEntryDoc(overrides)` / `insertFuelEntries(docs)`
- `buildMaintenanceDoc(overrides)` / `insertMaintenanceRecords(docs)`
- `buildEquipmentDoc(overrides)` / `insertEquipmentItems(docs)`
- `buildSpendingLinkDoc(overrides)` / `insertSpendingLinks(docs)`

---

### Phase 2: Core Vehicle Routes (`vehicle-routes.integration.test.ts`)
- **`POST /api/vehicles`**:
  - Creates a new vehicle with slug automatically derived from name.
  - Rejects creation if slug already exists for the same user (Conflict / 409).
  - Allows duplicate names across different users.
  - Validates required schema fields (vin, year, make, model).
- **`GET /api/vehicles`**:
  - Returns paginated list of vehicles owned by authenticated user.
  - Excludes other users' vehicles (data isolation).
  - Filters by `status` (active, sold, inactive), `make`, `model`.
  - Supports sorting by `name`, `createdAt`, `updatedAt`.
- **`GET /api/vehicles/:identifier`**:
  - Retrieves vehicle by MongoDB `_id`.
  - Retrieves vehicle by `slug`.
  - Returns 404 for non-existent vehicle or vehicle owned by another user.
- **`PUT /api/vehicles/:identifier`**:
  - Updates vehicle fields.
  - Re-generates slug when name changes and ensures uniqueness.
- **`DELETE /api/vehicles/:identifier`**:
  - Deletes vehicle from database.
  - **Cascade validation**: Verifies that associated fuel entries, maintenance records, equipment items, and spending links are deleted.

---

### Phase 3: Fuel Module Routes (`vehicle-fuel-routes.integration.test.ts`)
- **`POST /api/vehicles/:identifier/fuel`**:
  - Creates a fuel entry with volume, unit price, total cost, odometer, fuel type.
  - Optional Transaction Creation: When transaction payload is provided, creates a linked finance transaction in `@transaction` and creates a spending link.
- **`GET /api/vehicles/:identifier/fuel`**:
  - Retrieves fuel logs sorted by date/odometer.
  - Enriches fuel entries with calculated metrics: `distanceSinceLastFueling`, `consumptionPer100Km`, `costPerKm`.
  - Aggregates overall fuel stats (total volume, total cost, average consumption).
- **`GET /api/vehicles/:identifier/fuel/:id`**:
  - Fetches specific fuel entry.
- **`PUT /api/vehicles/:identifier/fuel/:id`**:
  - Updates fuel entry and keeps linked finance transaction/spending link in sync.
- **`DELETE /api/vehicles/:identifier/fuel/:id`**:
  - Deletes fuel entry and cleans up associated spending link.

---

### Phase 4: Maintenance & Equipment Routes
#### Maintenance (`vehicle-maintenance-routes.integration.test.ts`)
- **`POST /api/vehicles/:identifier/maintenance`**:
  - Creates maintenance record (type: `repair` | `service` | `inspection` | `tuning`, parts list, performedBy, cost, date, odometer).
  - Handles optional transaction creation & spending linking.
- **`GET /api/vehicles/:identifier/maintenance`**:
  - Lists records with filter by `type`, date range, pagination.
- **`GET /api/vehicles/:identifier/maintenance/:id`**:
  - Fetches single record.
- **`PUT /api/vehicles/:identifier/maintenance/:id`**:
  - Updates maintenance details and parts list.
- **`DELETE /api/vehicles/:identifier/maintenance/:id`**:
  - Deletes record and unlinks spending.

#### Equipment (`vehicle-equipment-routes.integration.test.ts`)
- **`POST /api/vehicles/:identifier/equipment`**:
  - Adds equipment items (e.g. dashcam, winter tires, roof box) with status (`installed`, `stored`, `sold`, `disposed`), warranty, purchase details.
  - Handles optional transaction creation & spending linking.
- **`GET /api/vehicles/:identifier/equipment`**:
  - Lists items filtered by status.
- **`GET /api/vehicles/:identifier/equipment/:id`**:
  - Fetches single item.
- **`PUT /api/vehicles/:identifier/equipment/:id`**:
  - Updates status and details (e.g. moving from `installed` to `stored`).
- **`DELETE /api/vehicles/:identifier/equipment/:id`**:
  - Deletes equipment item.

---

### Phase 5: Spending Linking Integration (`vehicle-spending-routes.integration.test.ts`)
- **`POST /api/vehicles/:identifier/spendings/link`**:
  - Links an existing finance transaction to a vehicle with a `moduleType` (`fuel`, `maintenance`, `equipment`, `other`).
  - Rejects attempt to link a transaction owned by another user (ownership verification).
  - Prevents duplicate linking of the same transaction.
- **`GET /api/vehicles/:identifier/spendings`**:
  - Returns unified list of all spending transactions associated with the vehicle.
  - Populates transaction details (amount, currency, category, payment method).
- **`DELETE /api/vehicles/:identifier/spendings/:id`**:
  - Unlinks the spending from the vehicle while preserving the original finance transaction.

---

## 5. Execution Steps for Next Session

1. **Verify Integration DB is Up**:
   ```bash
   pnpm test:integration:db:up
   ```
2. **Implement Step 1**: Create `src/testing/integration/fixtures/vehicles.ts`.
3. **Implement Step 2**: Create `src/testing/integration/vehicles/vehicle-routes.integration.test.ts`.
4. **Implement Step 3**: Create `src/testing/integration/vehicles/vehicle-fuel-routes.integration.test.ts`.
5. **Implement Step 4**: Create `src/testing/integration/vehicles/vehicle-maintenance-routes.integration.test.ts` and `src/testing/integration/vehicles/vehicle-equipment-routes.integration.test.ts`.
6. **Implement Step 5**: Create `src/testing/integration/vehicles/vehicle-spending-routes.integration.test.ts`.
7. **Run & Verify**:
   ```bash
   pnpm test:integration
   pnpm lint
   ```
