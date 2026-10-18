# Complete User Deletion Cascade: Implementation Plan

## Executive Summary

When a user account is deleted via `DELETE /api/users/:id`, all associated user data across all database collections must be deleted atomically. 

Currently, [`src/user/services/delete-user/delete-user.ts`](file:///home/wojtek960506/Programming/own_projects/finance-tracker/finance-tracker-api/src/user/services/delete-user/delete-user.ts) only removes **Transactions** and legacy **Named Resources** (`category`, `paymentMethod`, `account`). Newer domains (**Vehicles**, **Investments**, **Sports**, **Favorites**, and **Counters**) are omitted, leaving orphaned documents in MongoDB.

This plan outlines the architecture, domain purge helpers, orchestration changes, and testing strategy for a full-cascade cleanup.

---

## 1. Audit: Affected Collections & Current Gaps

| Domain | Collection / Model | Key User Field | Current Status in `deleteUser` | Target Action |
| :--- | :--- | :--- | :---: | :--- |
| **User** | `users` (`UserModel`) | `_id` | ✅ Handled | Delete user record |
| **Transaction** | `transactions` (`TransactionModel`) | `ownerId` | ✅ Handled | Delete all user transactions |
| **Transaction** | `counters` (`CounterModel`) | `_id.userId` | ❌ **Missing** | Delete transaction counter |
| **Named Resources** | `categories` (`Category`) | `ownerId` | ✅ Handled | Delete custom categories |
| **Named Resources** | `paymentmethods` (`PaymentMethod`) | `ownerId` | ✅ Handled | Delete custom payment methods |
| **Named Resources** | `accounts` (`Account`) | `ownerId` | ✅ Handled | Delete custom accounts |
| **Named Resources** | `sportcategories` (`SportCategory`) | `ownerId` | ❌ **Missing** | Delete custom sport categories |
| **Favorites** | `favoritenamedresources` (`FavoriteNamedResourceModel`) | `userId` | ❌ **Missing** | Delete all user favorites |
| **Sports** | `sportentries` (`SportEntryModel`) | `ownerId` | ❌ **Missing** | Delete all sport entries |
| **Vehicles** | `vehicles` (`VehicleModel`) | `ownerId` | ❌ **Missing** | Delete all vehicle profiles |
| **Vehicles** | `vehiclefuelentries` (`VehicleFuelEntryModel`) | `ownerId` | ❌ **Missing** | Delete all fuel logs |
| **Vehicles** | `vehiclemaintenances` (`VehicleMaintenanceModel`) | `ownerId` | ❌ **Missing** | Delete all maintenance records |
| **Vehicles** | `vehicleequipments` (`VehicleEquipmentModel`) | `ownerId` | ❌ **Missing** | Delete all equipment records |
| **Investments** | `investmentinstruments` (`InvestmentInstrumentModel`) | `ownerId` | ❌ **Missing** | Delete all investment instruments |
| **Investments** | `investmentoperations` (`InvestmentOperationModel`) | `ownerId` | ❌ **Missing** | Delete all investment operations |

---

## 2. Architecture & Design Principles

To maintain the **Domain Encapsulation & Information Hiding** rules codified in [`AGENTS.md`](file:///home/wojtek960506/Programming/own_projects/finance-tracker/finance-tracker-api/AGENTS.md):

1. **No Leaking Internal Models**: `src/user/` should **not** import Mongoose models directly from `@vehicles/model`, `@sports/model`, or `@investment/model`.
2. **Domain-Owned Purge Services**: Each domain will expose a public cleanup function from its `services` interface:
   - `deleteUserSportsData(ownerId: string, session: ClientSession): Promise<number>`
   - `deleteUserVehiclesData(ownerId: string, session: ClientSession): Promise<number>`
   - `deleteUserInvestmentsData(ownerId: string, session: ClientSession): Promise<number>`
   - `deleteUserFavoritesData(userId: string, session: ClientSession): Promise<number>`
   - `deleteUserTransactionsData(ownerId: string, session: ClientSession): Promise<number>`
3. **Atomic Execution**: All purge operations will execute within the existing MongoDB `ClientSession` transaction in `withSession`. If any deletion fails, the entire transaction rolls back.

---

## 3. Step-by-Step Implementation Phases

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: Domain-Level Purge Services                  │
│ - Sports: entries & custom sport categories            │
│ - Vehicles: fuel, maintenance, equipment, vehicles     │
│ - Investments: operations & instruments                │
│ - Favorites: favorite named resources                  │
│ - Transactions: transactions & counters                │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 2: Orchestration in User Service                 │
│ - Update deleteUserCore in delete-user.ts              │
│ - Pass ClientSession to each domain purge service      │
│ - Structured audit logging of deleted counts           │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 3: Comprehensive Testing & Verification          │
│ - Update unit tests in user-services.test.ts           │
│ - Add integration test verifying zero orphaned records │
│ - Run pnpm test, pnpm lint, pnpm openapi:export        │
└────────────────────────────────────────────────────────┘
```

### Phase 1: Domain-Level Purge Services

#### 1.1 Sports Domain
- **File**: `src/sports/services/delete-user-sports-data.ts`
- **Actions**:
  1. Delete `SportEntryModel.deleteMany({ ownerId }, { session })`.
  2. Delete `getNamedResourceModel('sportCategory').deleteMany({ ownerId }, { session })`.
- **Export**: Export via `src/sports/services/index.ts` (public domain API).

#### 1.2 Vehicles Domain
- **File**: `src/vehicles/services/vehicles/delete-user-vehicles-data.ts`
- **Actions**:
  1. Delete `VehicleFuelEntryModel.deleteMany({ ownerId }, { session })`.
  2. Delete `VehicleMaintenanceModel.deleteMany({ ownerId }, { session })`.
  3. Delete `VehicleEquipmentModel.deleteMany({ ownerId }, { session })`.
  4. Delete `VehicleModel.deleteMany({ ownerId }, { session })`.
- **Export**: Export via `src/vehicles/services/index.ts`.

#### 1.3 Investments Domain
- **File**: `src/investment/services/delete-user-investments-data.ts`
- **Actions**:
  1. Delete `InvestmentOperationModel.deleteMany({ ownerId }, { session })`.
  2. Delete `InvestmentInstrumentModel.deleteMany({ ownerId }, { session })`.
- **Export**: Export via `src/investment/services/index.ts`.

#### 1.4 Favorites Domain
- **File**: `src/named-resource-favorite/services/delete-user-favorites-data.ts`
- **Actions**:
  1. Delete `FavoriteNamedResourceModel.deleteMany({ userId }, { session })`.
- **Export**: Export via `src/named-resource-favorite/services/index.ts`.

#### 1.5 Transactions & Named Resources (Standardize)
- **File**: `src/transaction/services/delete-user-transactions-data.ts`
- **Actions**:
  1. Delete `TransactionModel.deleteMany({ ownerId }, { session })`.
  2. Delete `CounterModel.deleteMany({ '_id.userId': ownerId }, { session })`.
- **Export**: Export via `src/transaction/services/index.ts`.

---

### Phase 2: User Service Orchestration

Update [`src/user/services/delete-user/delete-user.ts`](file:///home/wojtek960506/Programming/own_projects/finance-tracker/finance-tracker-api/src/user/services/delete-user/delete-user.ts):

```typescript
const deleteUserCore = async (
  session: ClientSession,
  id: string,
): Promise<UserResponseDTO> => {
  const user = await UserModel.findById(id);
  if (!user) throw new UserNotFoundError(id);

  // 1. Transactions & Counters
  await deleteUserTransactionsData(id, session);

  // 2. Named Resources (Categories, Accounts, Payment Methods)
  await getNamedResourceModel('category').deleteMany({ ownerId: id }, { session });
  await getNamedResourceModel('paymentMethod').deleteMany({ ownerId: id }, { session });
  await getNamedResourceModel('account').deleteMany({ ownerId: id }, { session });

  // 3. Favorites
  await deleteUserFavoritesData(id, session);

  // 4. Vehicles (Fuel, Maintenance, Equipment, Vehicles)
  await deleteUserVehiclesData(id, session);

  // 5. Investments (Operations, Instruments)
  await deleteUserInvestmentsData(id, session);

  // 6. Sports (Entries, Sport Categories)
  await deleteUserSportsData(id, session);

  // 7. Delete User Root Record
  const { deletedCount } = await UserModel.deleteOne({ _id: id }, { session });
  if (deletedCount !== 1) throw new UserNotDeletedError(id);

  return serializeUser(user);
};
```

---

### Phase 3: Testing & Quality Assurance

#### 3.1 Unit Tests (`src/user/services/user-services.test.ts`)
- Mock domain purge functions: `deleteUserSportsData`, `deleteUserVehiclesData`, `deleteUserInvestmentsData`, `deleteUserFavoritesData`, `deleteUserTransactionsData`.
- Verify that every domain purge function is invoked with `(id, session)`.
- Verify rollback behavior if any domain purge throws an error.

#### 3.2 Integration Test (`src/user/services/delete-user/delete-user.integration.test.ts`)
- Seed real data for User A across all 12+ collections:
  - 1 User
  - 2 Transactions + 1 Counter
  - 1 Custom Account, 1 Custom Category, 1 Custom Payment Method
  - 2 Favorites
  - 1 Vehicle, 2 Fuel logs, 1 Maintenance record, 1 Equipment item
  - 1 Investment Instrument, 2 Investment Operations
  - 1 Custom Sport Category, 2 Sport Entries
- Seed control data for User B across the same collections.
- Call `deleteUser(UserA.id, UserA.id)`.
- Assert:
  - All User A collections have exactly `0` records.
  - All User B collections are completely untouched and intact.

---

## 4. Related Cascade: Transaction Permanent Deletion (Empty Trash)

In addition to user deletion, there is an equivalent cross-domain linking gap when **individual transactions are permanently deleted** (e.g., emptying the trash via `DELETE /api/transactions/trash`).

### Current Behavior
In [`src/transaction/db/remove-transaction/remove-transaction.ts`](file:///home/wojtek960506/Programming/own_projects/finance-tracker/finance-tracker-api/src/transaction/db/remove-transaction/remove-transaction.ts) and [`remove-transactions.ts`](file:///home/wojtek960506/Programming/own_projects/finance-tracker/finance-tracker-api/src/transaction/db/remove-transactions/remove-transactions.ts):
- `InvestmentOperationModel` entries linked to the deleted transactions are deleted.
- **Vehicles** and **Sports** entries are **not** updated, leaving behind dangling `transactionId` references pointing to non-existent transactions.

### Target Behavior: Automatic Unlinking
Because vehicle logs and sports entries represent physical real-world events (e.g. refueling a car or purchasing equipment), deleting a bank transaction should **never delete the physical log**. Instead, the relationship must be safely severed:

```typescript
// Within removeTransactionCore & removeTransactions:
// 1. Unlink Vehicle Spendings
await Promise.all([
  VehicleFuelEntryModel.updateMany(
    { transactionId: { $in: idsToDelete } },
    { $set: { transactionId: null } },
    { session },
  ),
  VehicleMaintenanceModel.updateMany(
    { transactionId: { $in: idsToDelete } },
    { $set: { transactionId: null } },
    { session },
  ),
  VehicleEquipmentModel.updateMany(
    { transactionId: { $in: idsToDelete } },
    { $set: { transactionId: null } },
    { session },
  ),
  // 2. Unlink Sport Entries
  SportEntryModel.updateMany(
    { transactionId: { $in: idsToDelete } },
    { $set: { transactionId: null } },
    { session },
  ),
]);
```

---

## 5. Git & Branching Strategy

1. **Current branch (`feat/sports-domain`)**:
   - Keep focused on the sports domain.
   - Resolve any remaining sports domain considerations.
   - Commit unstaged sports encapsulation changes and docs.
2. **Dedicated branch (`feat/user-deletion-cascades`)**:
   - Create from `feat/sports-domain` (or `main` after merging).
   - Implement Phases 1–4 in atomic commits:
     - `feat(cascade): add domain-level user purge services`
     - `feat(user): orchestrate complete user deletion cascade across all domains`
     - `feat(transaction): unlink vehicle and sport spendings on permanent transaction removal`
     - `test(user): add comprehensive unit and integration tests for user and transaction cascades`
