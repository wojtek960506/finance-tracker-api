# Finance Tracker - server

This module contains implementation for REST API server in my Finance Tracker web application.

## Integration tests

Integration tests use a real MongoDB instance running in Docker while the test process
itself runs locally.

### Start MongoDB for integration tests

```bash
pnpm test:integration:db:up
```

This starts MongoDB on `127.0.0.1:27018`.

### Run integration tests

```bash
pnpm test:integration
```

By default, integration tests use:

```text
mongodb://127.0.0.1:27018/finance-tracker-test
```

You can override that per run with `INTEGRATION_MONGO_URI`.

### Stop MongoDB for integration tests

```bash
pnpm test:integration:db:down
```
