# Finance Tracker API

Backend API for the Finance Tracker application.

This repository contains a TypeScript REST API built with Fastify and MongoDB. It handles
authentication, user management, named resources such as accounts/categories/payment
methods, transaction workflows, currency metadata, and OpenAPI documentation.

## What this API does

- Authenticates users with JWT access tokens and refresh-token cookies.
- Supports email verification for new accounts, including resend flow and legacy-user rollout.
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
- `/api/auth` - login, logout, refresh, current user, email verification
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
APP_ORIGIN=http://localhost:3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/some-db-dev
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174,https://some-web.app
CORS_ORIGIN_PATTERNS=^https://example-frontend(?:-[a-z0-9-]+)?\\.vercel\\.app$
JWT_ACCESS_SECRET=replace-with-a-strong-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=30
EMAIL_VERIFICATION_EXPIRES_HOURS=24
RESEND_API_KEY=api key taken from resend.com
RESEND_FROM_EMAIL=your-email@resend.dev
COOKIE_SECRET=replace-with-a-strong-secret
```

Notes:

- `MONGO_URI` is required for app startup.
- `APP_ORIGIN` is the frontend base URL used to build links in verification emails.
- `CORS_ORIGINS` should be a comma-separated list of allowed frontend origins.
- `CORS_ORIGIN_PATTERNS` is optional and can be used for dynamic origins such as Vercel
  preview deployments.
- `EMAIL_VERIFICATION_EXPIRES_HOURS` controls how long email verification tokens stay valid.
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are required whenever you want real verification
  emails to be sent through Resend, including local development.
- In `production`, refresh cookies are sent with `Secure` and `SameSite=None`.

### 3. Start development server

```bash
pnpm dev
```

The server starts on the port defined by `PORT`, and Swagger UI is available at:

```text
http://localhost:5000/docs
```

Verification links are always logged to the server console for easier manual testing.
Real email delivery goes through Resend in local and non-local environments when
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured. Automated tests skip real email
delivery.

## Available scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm migrate:legacy-email-verification
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
- `pnpm migrate:legacy-email-verification` - backfill pre-existing users as
  `legacy-backfill` so they are not locked out by the email verification rollout
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

## Auth notes

- New accounts created through `POST /api/users` start unverified and receive a verification
  email.
- Email verification is completed through `POST /api/auth/verify-email`.
- Users can request a fresh verification email through `POST /api/auth/resend-verification`.
- Login is blocked for unverified accounts with the `AUTH_EMAIL_NOT_VERIFIED` error code.
- Existing users can be backfilled with `pnpm migrate:legacy-email-verification` so the
  rollout does not lock them out. These users remain login-allowed and can later become
  fully self-verified through the resend + verify flow.

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
- Auth email sending uses Resend in non-local environments and console logging in local
  development/testing.

## Status

This repo already includes a solid test suite and generated API docs, so the easiest way to
explore behavior is:

1. Start MongoDB and the API.
2. Open `/docs`.
3. Use the request examples in `http-requests/` or your frontend app against the running API.
