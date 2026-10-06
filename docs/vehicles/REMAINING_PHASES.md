# Vehicles Domain: Remaining Phases & Roadmap

This document outlines the remaining sub-phases for completing the Vehicles domain in `finance-tracker-api`.

---

## 📌 Status Summary (Completed So Far)

- [x] **Phase 1: Foundation, Types & Models**
  - Mongoose models (`Vehicle`, `VehicleFuelEntry`, `VehicleEquipment`, `VehicleMaintenance`)
  - Unit tests (`10/10` passing)
- [x] **Phase 2: Zod Schemas, Serializers & Domain Errors**
  - Zod schemas, OpenAPI registry, domain errors (`VehicleNotFoundError`, etc.)
  - Unit tests (`19/19` passing)
- [x] **Phase 3: Domain Services & Business Logic (Sub-phases 3.1 - 3.4)**
  - `3.1`: Vehicle CRUD services (`create`, `get`, `update`, `delete`, `findVehicleByIdOrSlug`)
  - `3.2`: Fuel calculation & validation services (`enrichFuelEntries`, `validateOdometerSequence`, CRUD)
  - `3.3`: Equipment & Maintenance CRUD services
  - `3.4`: Spending-to-Transaction linking & unlinking services
- [x] **Phase 4A: Vehicle Core Routes & Handlers**
  - Handlers (`create`, `getVehicles`, `getVehicle`, `update`, `delete`)
  - Fastify route plugin registered at `/api/vehicles` in `app.ts`
  - Integration tests (`14/14` passing)
- [x] **Phase 4B: Fuel Routes & Handlers**
  - Handlers (`createFuelEntry`, `getFuelEntries`, `getFuelEntry`, `updateFuelEntry`, `deleteFuelEntry`)
  - Enforces chronological odometer validation & dynamic calculation queries
  - Fastify routes registered under `/api/vehicles/:vehicleId/fuel`
  - Integration tests (`15/15` fuel tests passing)
- [x] **Phase 4C: Equipment Routes & Handlers**
  - Handlers (`createEquipment`, `getEquipmentList`, `getEquipmentItem`, `updateEquipment`, `deleteEquipment`)
  - Fastify routes registered under `/api/vehicles/:vehicleId/equipment`
  - Unit tests (`18/18` equipment tests passing)
- [x] **Phase 4D: Maintenance Routes & Handlers**
  - Handlers (`createMaintenance`, `getMaintenanceList`, `getMaintenanceItem`, `updateMaintenance`, `deleteMaintenance`)
  - Fastify routes registered under `/api/vehicles/:vehicleId/maintenance`
  - Unit tests (`18/18` maintenance tests passing)
- [x] **Phase 4E: Spending Linking Routes & Handlers**
  - Handlers (`linkSpendings`, `unlinkSpending`)
  - Fastify routes registered under `/api/vehicles/spendings`
  - Unit tests (`9/9` spending link tests passing)



---

## 🚀 Remaining Phases Roadmap

### Phase 4A: Vehicle Core Routes & Handlers (Completed)
**Scope**: Vehicle management endpoints under `/api/vehicles`.
- **Endpoints**:
  - `POST /api/vehicles` — Create a vehicle (status: 201)
  - `GET /api/vehicles` — List user's vehicles (paginated)
  - `GET /api/vehicles/:vehicleId` — Get vehicle by MongoDB ObjectId or slug
  - `PATCH /api/vehicles/:vehicleId` — Partial update of vehicle details
  - `DELETE /api/vehicles/:vehicleId` — Delete vehicle
- **Tasks**:
  - Handlers in `src/vehicles/routes/handlers/vehicles/`:
    - `create-vehicle-handler.ts`
    - `get-vehicles-handler.ts`
    - `get-vehicle-handler.ts`
    - `update-vehicle-handler.ts`
    - `delete-vehicle-handler.ts`
  - Fastify route plugin in `src/vehicles/routes/vehicle-routes.ts`
  - Register `/api/vehicles` in `src/app/app.ts`
  - Supertest integration tests in `src/vehicles/routes/vehicle-routes.test.ts`

---

### Phase 4B: Fuel Routes & Handlers (Completed)
**Scope**: Fuel logs and dynamic calculation querying under `/api/vehicles/:vehicleId/fuel`.
- **Endpoints**:
  - `GET /api/vehicles/:vehicleId/fuel` — List fuel entries (Query: `startDate`, `endDate`, `isFullTank`, `enriched`, `page`, `limit`)
  - `POST /api/vehicles/:vehicleId/fuel` — Create fuel entry (enforces odometer sequence validation, status: 201)
  - `GET /api/vehicles/:vehicleId/fuel/:entryId` — Get single fuel entry (raw)
  - `PATCH /api/vehicles/:vehicleId/fuel/:entryId` — Update fuel entry
  - `DELETE /api/vehicles/:vehicleId/fuel/:entryId` — Delete fuel entry
- **Tasks**:
  - Handlers in `src/vehicles/routes/handlers/fuel/`
  - Register routes in `vehicle-routes.ts`
  - Integration tests for fuel endpoints

---

### Phase 4C: Equipment Routes & Handlers (Completed)
**Scope**: Equipment purchases and modifications under `/api/vehicles/:vehicleId/equipment`.
- **Endpoints**:
  - `GET /api/vehicles/:vehicleId/equipment` — List equipment items (Query: `startDate`, `endDate`, `page`, `limit`)
  - `POST /api/vehicles/:vehicleId/equipment` — Create equipment purchase (status: 201)
  - `GET /api/vehicles/:vehicleId/equipment/:itemId` — Get single equipment item
  - `PATCH /api/vehicles/:vehicleId/equipment/:itemId` — Update equipment item
  - `DELETE /api/vehicles/:vehicleId/equipment/:itemId` — Delete equipment item
- **Tasks**:
  - Handlers in `src/vehicles/routes/handlers/equipment/`
  - Register routes in `vehicle-routes.ts`
  - Integration tests for equipment endpoints

---

### Phase 4D: Maintenance Routes & Handlers (Completed)
**Scope**: Maintenance, service records, and licensing costs under `/api/vehicles/:vehicleId/maintenance`.
- **Endpoints**:
  - `GET /api/vehicles/:vehicleId/maintenance` — List maintenance records (Query: `section`, `startDate`, `endDate`, `page`, `limit`)
  - `POST /api/vehicles/:vehicleId/maintenance` — Create maintenance record (status: 201)
  - `GET /api/vehicles/:vehicleId/maintenance/:recordId` — Get single maintenance record
  - `PATCH /api/vehicles/:vehicleId/maintenance/:recordId` — Update maintenance record
  - `DELETE /api/vehicles/:vehicleId/maintenance/:recordId` — Delete maintenance record
- **Tasks**:
  - Handlers in `src/vehicles/routes/handlers/maintenance/`
  - Register routes in `vehicle-routes.ts`
  - Integration tests for maintenance endpoints

---

### Phase 4E: Spending Linking Routes & Handlers (Completed)
**Scope**: Spending-to-Transaction linking routes under `/api/vehicles/spendings`.
- **Endpoints**:
  - `POST /api/vehicles/spendings/link` — Link spendings across vehicles to a financial `Transaction`
  - `POST /api/vehicles/spendings/unlink` — Unlink spending from its `Transaction`
- **Tasks**:
  - Handlers in `src/vehicles/routes/handlers/spendings/`:
    - `link-spendings-handler.ts`
    - `unlink-spending-handler.ts`
  - Fastify route plugin in `src/vehicles/routes/vehicle-spending-routes.ts`
  - Register route plugin in `src/vehicles/routes/vehicle-routes.ts`
  - Unit tests for route endpoints in `src/vehicles/routes/vehicle-spending-routes.test.ts`

---

### Phase 5: Domain Integration Tests (E2E with Mongo Container)
**Scope**: End-to-end database integration tests with a real MongoDB test container across the entire Vehicles domain.
- **Test Suites**:
  - Vehicle lifecycle & slug generation (`vehicle.integration.test.ts`)
  - Fuel log chronological odometer sequence validation & dynamic calculations (`vehicle-fuel.integration.test.ts`)
  - Equipment & Maintenance tracking (`vehicle-equipment.integration.test.ts`, `vehicle-maintenance.integration.test.ts`)
  - Spending linking & cascade effects on deletion/update (`vehicle-spending-link.integration.test.ts`)

---

### Phase 6: Batch Data Importer (Separate / Standalone Module)
**Scope**: Generic or dedicated batch historical data importer (to be implemented as a unified import module or vehicle-specific batch import tool).
- **Potential Tasks**:
  - Batch import schema definitions (`vehicle-import-schema.ts` / generic `import-schema.ts`)
  - Bulk upsert service with idempotency tracking (`sourceRow`)
  - Import endpoint / CLI tool integration

---

### Phase 7: OpenAPI Spec Export & Final QA
- Export updated OpenAPI schema: `pnpm openapi:export`
- Run full test suite: `pnpm test`
- Run linter and type-checking: `pnpm lint` && `pnpm build`

