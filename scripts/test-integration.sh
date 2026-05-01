#!/usr/bin/env bash

set -euo pipefail

cleanup() {
  pnpm test:integration:db:down
}

trap cleanup EXIT

pnpm test:integration:db:up
pnpm test:integration
