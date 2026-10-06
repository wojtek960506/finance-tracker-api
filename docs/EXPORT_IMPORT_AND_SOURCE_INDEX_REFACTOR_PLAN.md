# Plan: Export/Import Module & Elimination of `sourceIndex`/`sourceRow` from Database

## 1. Context & Motivation

Currently, several models in MongoDB store positional indexing properties:
- **Transactions**: `sourceIndex` (number) and `sourceRefIndex` (number)
- **Vehicles** (Fuel, Equipment, Maintenance): `sourceRow` (number)

In MongoDB, relationships between entities are natively linked via `Types.ObjectId` (e.g., `transaction.refId`, `vehicleFuelEntry.transactionId`, `vehicleFuelEntry.vehicleId`).

Storing permanent `sourceIndex`, `sourceRefIndex`, and `sourceRow` in the database adds unnecessary schema complexity, requires counters (`CounterModel`), and creates MongoDB index collision risks (such as sparse compound indexes on null values).

---

## 2. Dynamic In-Memory Mapping for Full Database Export & Import

When building the full application CSV export and import module, CSV row references will be generated dynamically in-memory rather than stored in MongoDB:

### Export Pipeline
1. Stream entities from MongoDB.
2. Maintain an in-memory mapping `idToExportId: Map<ObjectIdString, number>`.
3. Emit CSV rows with `exportId` and relational reference columns (e.g. `refExportId`, `transactionExportId`).

### Import / Legacy Data Importer Pipeline
1. Read CSV rows containing `exportId` and reference IDs.
2. In-memory map: `exportIdToMongoId: Map<number, ObjectId>`.
3. Insert documents into MongoDB without persisting `sourceIndex` or `sourceRow` into the document schema.
4. Update `refId` / `transactionId` in bulk using the mapped ObjectIds.

---

## 3. Legacy Importer Changes Needed (`src/transaction/db/persist-transaction/`)

In [`src/transaction/db/persist-transaction/persist-transactions.ts`](file:///home/wojtek960506/Programming/own_projects/finance-tracker/finance-tracker-api/src/transaction/db/persist-transaction/persist-transactions.ts):
- Currently, `persistTransactionsCore` accepts objects with `sourceIndex` and `sourceRefIndex` and saves them directly via `TransactionModel.insertMany(transactions)`.
- When refactoring:
  1. Strip `sourceIndex` and `sourceRefIndex` before inserting documents into `TransactionModel`.
  2. Use the in-memory array indices or temporary `sourceIndexToIdMap` solely to execute `refId` updates.
  3. Ensure `TransactionModel` only saves `refId`.

---

## 4. Cross-Repository Impact & Coordination

Changes will need to be coordinated across three repositories in the project:

### 1. `finance-tracker-legacy-data-importer`
- **Legacy CSV Parser & Mapping**:
  - Update legacy data import scripts/parsers to treat `sourceIndex` and `sourceRefIndex` as temporary in-memory link keys during parsing rather than requiring them in the persisted database schema.
  - Update DTOs/payloads sent to the API import endpoints so they match updated API contracts (or update direct DB insert models if it interacts with MongoDB directly).
  - Any vehicle domain legacy import scripts must be updated to not expect/produce `sourceRow`.

### 2. `finance-tracker-web-v2`
- **Types & Interfaces**:
  - Remove `sourceIndex` / `sourceRefIndex` and `sourceRow` from frontend TypeScript interfaces, schemas, and API client types.
- **UI Components & Table Views**:
  - Remove any display of `sourceIndex` or `sourceRow` in debug views, transaction tables, or detail sidebars if present.
  - Update transaction sorting or pagination keys if any components relied on `sourceIndex` for secondary tie-breaking (use date and `_id` or table position instead).
- **Export / Import Frontend Features**:
  - Wire future CSV export/import triggers and downloads/uploads against the new dynamic export/import endpoints.

### 3. `finance-tracker-api` (This Repository)
- Core schema, route, service, and test refactorings as listed below.

---

## 5. Full Refactor Checklist

1. **`finance-tracker-api` - Transaction Domain**:
   - [ ] Remove `sourceIndex` and `sourceRefIndex` from `transactionSchema` and `TransactionAttributes`.
   - [ ] Remove `CounterModel` and `getNextSourceIndex` / `getNextSourceIndices`.
   - [ ] Remove `sourceIndex` requirement from `TransactionCreateDTO` and `createTransaction` services.
   - [ ] Update sorting in transaction queries from `.sort({ date: -1, sourceIndex: -1 })` to `.sort({ date: -1, _id: -1 })`.
   - [ ] Update `persistTransactions` to keep `sourceIndex` in memory only for resolving `refId`.

2. **`finance-tracker-api` - Vehicle Domain**:
   - [ ] Remove `sourceRow` from `vehicleFuelEntrySchema`, `vehicleEquipmentSchema`, and `vehicleMaintenanceSchema`.
   - [ ] Remove compound indexes containing `sourceRow`.
   - [ ] Vehicle batch importer uses in-memory matching or domain keys for upserts.

3. **`finance-tracker-api` - CSV Export / Import Module**:
   - [ ] Implement streaming CSV exporter assigning dynamic `exportId` and `refExportId`.
   - [ ] Implement streaming CSV importer resolving references via in-memory `Map<exportId, ObjectId>`.

4. **`finance-tracker-legacy-data-importer`**:
   - [ ] Update legacy parsers to treat `sourceIndex` / `sourceRefIndex` as in-memory linkage only.
   - [ ] Remove `sourceRow` fields from vehicle legacy data ingestion scripts.
   - [ ] Align payload DTOs with updated API contracts.

5. **`finance-tracker-web-v2`**:
   - [ ] Remove `sourceIndex`, `sourceRefIndex`, and `sourceRow` from TypeScript interfaces and DTOs.
   - [ ] Remove references in tables, detail views, and sorting logic.
   - [ ] Integrate new export/import UI triggers with the API.

