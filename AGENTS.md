# Project Guidelines & Architecture

This repository is **finance-tracker-api**, the backend REST API service for personal finance, investment, and lifestyle management built with Node.js, Fastify, TypeScript, Mongoose, and Zod.

---

## 1. Project Architecture & Stack

- **Core**: Fastify (with `fastify-type-provider-zod`), TypeScript (strict mode), Node.js.
- **Database & ODM**: MongoDB with Mongoose models, schemas, and aggregation pipelines.
- **Validation & Serialization**: Zod (`zod/v4`), `@fastify/swagger` and `@fastify/swagger-ui` for OpenAPI v3 documentation.
- **Authentication**: JWT access tokens in headers + refresh tokens in secure cookies.
- **Testing**: Vitest (`--run`), in-memory MongoDB or mocked collections.

---

## 2. Domain & Modular Structure

We follow a feature-driven, modular domain architecture:

```
src/
├── <domain>/               # Domain module (e.g., sports, vehicles, transaction, named-resource)
│   ├── routes/             # Fastify route plugins
│   │   ├── handlers/       # Request handlers (private to routes)
│   │   ├── <sub-routes>.ts # Internal sub-route definitions
│   │   ├── <routes>.ts     # Primary domain route plugin
│   │   └── index.ts        # Route public interface (ONLY exports primary route plugin)
│   ├── services/           # Business logic & database operations
│   │   ├── <sub-service>/  # Specific sub-service logic
│   │   └── index.ts        # Services public interface
│   ├── model/              # Mongoose schemas and models (internal to domain)
│   ├── schema/             # Zod DTO schemas and types
│   ├── serializers/        # Output transformation functions
│   ├── types.ts            # Internal domain types and attributes
│   ├── consts.ts           # Domain-specific constants
│   └── index.ts            # Public domain interface (routes, schema, services, types)
├── app/                    # Application setup, plugins, error handling, bootstrap
├── named-resource/         # Common polymorphic named resource management
├── shared/                 # Cross-domain HTTP utilities, middlewares, and services
└── utils/                  # Pure utility functions, errors, and constants
```

---

## 3. Encapsulation & Information Hiding Rules

1. **Do Not Expose Components Not Used Outside Their Folder**:
   - `index.ts` files act as strict encapsulation boundaries. Only export what is explicitly consumed by outer modules.
   - If a helper, sub-route, handler, model, or serializer is only consumed within its parent folder, **do NOT re-export it in `index.ts`**.

2. **Routes Encapsulation**:
   - `routes/index.ts` must **ONLY** export the primary domain router plugin (e.g., `export * from './sport-routes';`).
   - Never re-export `handlers` from `routes/index.ts`. Handlers are private to the route definitions inside `routes/`.
   - Never re-export internal sub-routes (e.g., `sportCategoryRoutes`, `sportEntryRoutes`, `sportStatsRoutes`) from `routes/index.ts` if they are mounted internally by the domain router.

3. **Services Encapsulation**:
   - Internal validation helpers, access assertion functions (e.g., `assertSportCategoryAccess`), and sub-service utilities must remain private to their subfolder and never be re-exported through `services/index.ts`.
   - Only export services that are invoked by route handlers or required by other domains (e.g., dependency check functions).

4. **Domain Root Encapsulation**:
   - The domain root `index.ts` (e.g., `src/sports/index.ts`) must only export public interfaces: `routes`, `schema`, `services`, and `types`.
   - Never export database models (`model/`), serializers (`serializers/`), or internal constants (`consts/`) through the domain root `index.ts`.

---

## 4. Implementation & OpenAPI Rules

1. **Line Length & Formatting**:
   - **Line limit**: Keep code lines under 100 characters.
   - Maintain clean import ordering: external libraries, path aliases (`@sports/*`, `@shared/*`, `@utils/*`), and relative imports (`./...`).
   - Run `pnpm fix` and `pnpm lint` to ensure code formatting and import sorting are clean.

2. **OpenAPI & Swagger Schema Registration**:
   - When registering schemas with `z.globalRegistry.add(Schema, { id: 'Name' })`, **only register response schemas and sub-entity DTOs**.
   - **Never register `querystring` or `params` schemas in `z.globalRegistry`**, as `@fastify/swagger` cannot resolve parameter `$ref`s and will fail to export the OpenAPI spec.

3. **Testing & Quality Assurance**:
   - Always verify changes before completing a task:
     ```bash
     pnpm test <path-to-tests>
     pnpm openapi:export
     pnpm lint
     ```
   - Do not stage git changes automatically without explicit direction from the user.
