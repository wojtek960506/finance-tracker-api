# Python Microservices Architecture & Integration Plan

## 1. Overview & Objectives

This document outlines the architectural strategy and implementation roadmap for introducing **Python-based microservices** into the Finance Tracker project alongside the existing **Node.js (Fastify)** backend.

### Primary Goals

- **Learning & Skill Expansion**: Practice Python backend development, modern async patterns, and microservice architecture.
- **Specialized Workloads**: Leverage Python's rich ecosystem for financial calculations, data science, time-series analysis, and third-party integrations (broker CSV/PDF parsing, market data).
- **Decoupled Architecture**: Keep core transaction ledger logic and authentication in Node.js while offloading heavy computation and specialized background jobs to Python.

---

## 2. Target Python Services & Candidates

```
                         ┌─────────────────────────────┐
                         │   Client (Web / Mobile)     │
                         └──────────────┬──────────────┘
                                        │ (JWT Auth)
                                        ▼
                         ┌─────────────────────────────┐
                         │ Node.js API Gateway / Core  │
                         │      (Fastify + MongoDB)    │
                         └──────────────┬──────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │ (Internal HTTP / REST)     │ (Async Queue / Redis)      │ (Market Sync)
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Portfolio Analytics │     │  Statement / Broker  │     │   Market Data & FX   │
│       Service        │     │    Import Worker     │     │   Ingestion Worker   │
│  (FastAPI + NumPy)   │     │  (Pandas + Celery)   │     │   (yfinance / Cron)  │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

### Candidate 1: Portfolio Analytics & Performance Engine _(High Priority)_

- **Responsibilities**:
  - Time-Weighted Return (TWR) & Money-Weighted Return (MWR / IRR) calculations.
  - Compound Annual Growth Rate (CAGR), Sharpe ratio, and drawdown metrics.
  - Realized vs. unrealized Profit and Loss (PnL) aggregation across asset classes.
  - Future valuation projections and Monte Carlo simulations.
- **Key Libraries**: `numpy`, `pandas`, `scipy`.

### Candidate 2: Market Data & FX Rate Ingestion Worker

- **Responsibilities**:
  - Periodic fetching of stock quotes, ETF prices, crypto tickers, and FX conversion rates.
  - Ingesting price history snapshots for instruments.
- **Key Libraries**: `yfinance`, `httpx`, `apscheduler` / `celery`.

### Candidate 3: Broker Statement & Receipt Parser

- **Responsibilities**:
  - Ingesting broker statement exports (Interactive Brokers, Degiro, XTB, Revolut, Trading212).
  - Normalizing varied CSV formats into standardized investment transactions.
  - Document extraction from receipts or bank statements (using PDF parsing or AI/OCR).
- **Key Libraries**: `pandas`, `pdfplumber`, `pydantic`.

---

## 3. Technology Stack

| Component                | Technology                      | Rationale                                                                                      |
| :----------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------- |
| **Framework**            | **FastAPI**                     | Async-first, high performance, automatic OpenAPI documentation, intuitive coming from Fastify. |
| **Validation**           | **Pydantic v2**                 | Strict schema validation with syntax and ergonomics similar to Zod in TypeScript.              |
| **Package Manager**      | **uv** (or **Poetry**)          | Extremely fast package installation, virtual environment management, and lockfile resolution.  |
| **Server**               | **Uvicorn**                     | Standard ASGI web server for asynchronous Python applications.                                 |
| **HTTP Client**          | **HTTPX**                       | Fully async HTTP client for inter-service communication and external API calls.                |
| **Testing**              | **pytest** + **pytest-asyncio** | Modern test runner matching the speed and clarity of Vitest.                                   |
| **Linting & Formatting** | **Ruff**                        | Blazing fast linter and code formatter (replaces flake8, black, isort).                        |

---

## 4. Repository Structure Strategy

### Phase 1: Non-Disruptive Monorepo Layout (Recommended Initial Step)

Keep the existing Node.js root untouched to avoid disrupting current tooling (`pnpm`, Vitest, Husky, Docker integration tests), and add an isolated `services/` directory:

```text
finance-tracker-api/
├── package.json                    # Existing Node setup (Fastify core)
├── src/                            # Existing Fastify src
├── tsconfig.json
│
├── services/
│   └── analytics-service/          # Python microservice
│       ├── pyproject.toml          # uv / poetry dependencies
│       ├── uv.lock
│       ├── README.md
│       ├── Dockerfile
│       ├── src/
│       │   ├── main.py             # FastAPI entrypoint
│       │   ├── api/                # Route handlers
│       │   │   └── v1/
│       │   │       ├── router.py
│       │   │       └── endpoints/
│       │   │           └── performance.py
│       │   ├── core/               # Configuration & settings
│       │   └── services/           # Financial calculation algorithms
│       │       └── twr_calculator.py
│       └── tests/
│           ├── conftest.py
│           └── test_performance.py
```

### Git & Tooling Isolation:

- Add `services/**/.venv` and `services/**/__pycache__` to root `.gitignore`.
- Run Python linting and tests independently (`cd services/analytics-service && pytest`).

---

## 5. Communication & Security Design

### Synchronous HTTP Pattern (Node ➔ Python)

1. **Client Request**: Frontend calls `GET /investments/portfolio/performance` on the Fastify backend.
2. **Auth & Extraction**: Fastify verifies the user's JWT, loads relevant transactions/operations from MongoDB.
3. **Internal RPC**: Fastify sends a `POST http://localhost:8001/api/v1/calculate-performance` request to the Python service with the transaction payload and user metadata.
4. **Header Propagation**:
   - `X-Internal-Secret`: Shared secret to ensure requests come only from the internal gateway.
   - `X-User-Id`: Authenticated user ID passed downstream.
5. **Computation & Response**: Python computes the financial metrics and responds with structured JSON. Fastify formats and returns it to the client.

```typescript
// Fastify integration client sketch
export class AnalyticsServiceClient {
  constructor(
    private readonly baseUrl: string,
    private readonly internalSecret: string,
  ) {}

  async calculatePerformance(
    payload: PortfolioPerformancePayload,
  ): Promise<PortfolioPerformanceResult> {
    const res = await fetch(`${this.baseUrl}/api/v1/calculate-performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': this.internalSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new ExternalServiceError('Analytics service calculation failed');
    }
    return res.json();
  }
}
```

---

## 6. Implementation Roadmap

- [ ] **Step 1: Scaffolding**
  - Initialize `services/analytics-service` with `uv init` / `pyproject.toml`.
  - Configure FastAPI application with `/health` and OpenAPI docs at `/docs`.
- [ ] **Step 2: Core Financial Algorithms**
  - Implement TWR and PnL calculation pure functions in Python with extensive unit tests (`pytest`).
- [ ] **Step 3: API Endpoint Implementation**
  - Create `POST /api/v1/calculate-performance` with Pydantic request/response schemas.
- [ ] **Step 4: Fastify Integration**
  - Build a lightweight typed client in Fastify to communicate with the analytics microservice.
  - Expose the user-facing route in Fastify under `/investments/portfolio/performance`.
- [ ] **Step 5: Docker Compose Orchestration**
  - Add the Python service to `compose.yml` for unified one-command local startup and integration testing.
