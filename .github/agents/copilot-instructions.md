# pax8-api Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-08

## Active Technologies
- TypeScript 5.x with strict mode + None (zero runtime dependencies per constitution) (002-pax8-client-auth)
- In-memory token storage only (002-pax8-client-auth)
- TypeScript 5.x (strict) targeting Node.js 22+ + None (zero runtime dependencies; native fetch) (003-companies-api)
- None (in-memory only) (003-companies-api)
- TypeScript 5.x (strict), Node.js 22+ + Native `fetch` (no runtime deps); internal modules under `src/api`, `src/client`, `src/http`; dev tooling: TypeScript, Vitest, ESLint, Prettier (006-orders-api)
- N/A (HTTP client library) (006-orders-api)
- TypeScript 5.x (strict) on Node.js 22+ with native fetch + Zero runtime deps; dev: Vitest, ts-node/tsup build pipeline (007-subscriptions-api)
- N/A (HTTP client only) (007-subscriptions-api)
- TypeScript 5.x (strict) on Node.js 22+ + Native `fetch`; existing internal utilities in `src/http`, `src/auth`, `src/errors`; dev tooling via Vitest/ts-node; no new runtime deps (009-invoices-api)
- N/A (HTTP client library only) (009-invoices-api)
- TypeScript 5.x with strict mode + Native fetch (Node.js 22+), no runtime dependencies (011-webhooks-api)
- N/A (API client library) (011-webhooks-api)

- TypeScript 5.x with strict mode + None (documentation only; documents native fetch on Node.js 22+) (001-readme-docs)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x with strict mode: Follow standard conventions

## Recent Changes
- 011-webhooks-api: Added TypeScript 5.x with strict mode + Native fetch (Node.js 22+), no runtime dependencies
- 011-quotes-api: Added TypeScript 5.x (strict) on Node.js 22+ + Native `fetch`; existing internal utilities in `src/http`, `src/auth`, `src/errors`; dev tooling via Vitest/ts-node; no new runtime deps
- 010-usage-summaries-api: Added TypeScript 5.x (strict) on Node.js 22+ + Native `fetch`; existing internal utilities in `src/http`, `src/auth`, `src/errors`; dev tooling via Vitest/ts-node; no new runtime deps
- 009-invoices-api: Added TypeScript 5.x (strict) on Node.js 22+ + Native `fetch`; existing internal utilities in `src/http`, `src/auth`, `src/errors`; dev tooling via Vitest/ts-node; no new runtime deps


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
