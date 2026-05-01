# Finance Tracker API

Backend API for the Finance Tracker application.

This repository contains a TypeScript REST API built with Fastify and MongoDB. It handles
authentication, user management, named resources such as accounts/categories/payment
methods, transaction workflows, currency metadata, and OpenAPI documentation.

## What this API does

- Authenticates users with JWT access tokens and refresh-token cookies.
- Stores data in MongoDB via Mongoose.
- Exposes typed REST endpoints validated with Zod.
- Provides OpenAPI and Swagger UI documentation at `/docs`.
- Supports standard, transfer, and exchange transactions.
- Includes soft-delete trash flows, totals, statistics, and CSV export for transactions.
- Seeds system resources such as default accounts, categories, and payment methods on startup.

## Tech stack

- Node.js
- TypeScript
- Fastify
- Zod
- MongoDB + Mongoose
- Vitest
- pnpm

## Main route groups

The app registers these route groups:

- `/` - welcome endpoint
- `/docs` - Swagger UI / OpenAPI docs
- `/api/auth` - login, logout, refresh, current user
- `/api/users` - create/list/delete users, create seeded test user
- `/api/accounts` - CRUD and favorites for accounts
- `/api/categories` - CRUD and favorites for categories
- `/api/paymentMethods` - CRUD and favorites for payment methods
- `/api/currencies` - static list of supported currencies
- `/api/transactions` - list, create, update, trash, restore, export, totals, statistics

## Transaction capabilities

The transaction module supports several workflows:

- Standard transaction creation and update
- Transfer transactions represented as two linked entries
- Exchange transactions represented as two linked entries
- Paginated transaction listing
- Trash and restore flows
- Permanent deletion from trash
- CSV export
- Totals grouped by currency and type
- Time-based statistics

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment file

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

Required variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/some-db-dev
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174,https://some-web.app
JWT_ACCESS_SECRET=replace-with-a-strong-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=30
COOKIE_SECRET=replace-with-a-strong-secret
```

Notes:

- `MONGO_URI` is required for app startup.
- `CORS_ORIGINS` should be a comma-separated list of allowed frontend origins.
- In `production`, refresh cookies are sent with `Secure` and `SameSite=None`.

### 3. Start development server

```bash
pnpm dev
```

The server starts on the port defined by `PORT`, and Swagger UI is available at:

```text
http://localhost:5000/docs
```

## Available scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm test:integration
pnpm lint
pnpm format
pnpm fix
```

What they do:

- `pnpm dev` - start the app in watch mode with `tsx`
- `pnpm build` - bundle the app with `tsup`
- `pnpm start` - run the built server from `dist`
- `pnpm test` - run unit and route-level tests
- `pnpm test:watch` - run Vitest in watch mode
- `pnpm test:coverage` - generate coverage output
- `pnpm test:integration` - run integration tests against MongoDB
- `pnpm lint` - run ESLint
- `pnpm format` - check formatting with Prettier
- `pnpm fix` - run the repo fix script

## API documentation

OpenAPI documentation is generated from route schemas and exposed through Swagger UI.

- Swagger UI: `/docs`
- Route validation: Zod
- OpenAPI generation: `@fastify/swagger` + `fastify-type-provider-zod`

This makes the docs a reliable source for request/response formats while developing the
frontend or testing endpoints manually.

## Testing

### Unit and app-level tests

```bash
pnpm test
```

### Integration tests

Integration tests use a real MongoDB instance running in Docker while the test process
runs locally.

Start MongoDB:

```bash
pnpm test:integration:db:up
```

This starts MongoDB on `127.0.0.1:27018` as a single-node replica set so startup
transactions and integration flows work correctly.

Run integration tests:

```bash
pnpm test:integration
```

Default integration database URI:

```text
mongodb://127.0.0.1:27018/finance-tracker-test?replicaSet=rs0
```

You can override it with `INTEGRATION_MONGO_URI`.

Stop and clean the integration database:

```bash
pnpm test:integration:db:down
```

Run the full DB lifecycle helper:

```bash
pnpm test:integration:full
```

## Project structure

```text
src/
  app/                 app bootstrap, config, startup setup, shared plugins
  auth/                auth routes, schemas, token logic
  currency/            currency routes and constants
  named-resource/      shared logic for accounts/categories/payment methods
  named-resource-favorite/ favorite resource handling
  transaction/         transaction routes, schemas, services, db logic
  user/                user routes and services
  testing/             factories, fixtures, integration helpers
```

## Local development notes

- The server loads environment variables from `.env` in `src/server.ts`.
- MongoDB connection is established before Fastify starts listening.
- Default system accounts, categories, and payment methods are upserted during app startup.
- Sample HTTP request files are available in `http-requests/`.

## Status

This repo already includes a solid test suite and generated API docs, so the easiest way to
explore behavior is:

1. Start MongoDB and the API.
2. Open `/docs`.
3. Use the request examples in `http-requests/` or your frontend app against the running API.
