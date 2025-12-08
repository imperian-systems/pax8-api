# Implementation Plan: Companies API

**Branch**: `003-companies-api` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-companies-api/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.
## Summary

Implement typed Companies API support (list, detail, search) using cursor-based pagination (default limit 50, max 100) and consistent error handling. Types and contracts will be hand-crafted from the Pax8 Partner Endpoints v1 OpenAPI specification. The client will expose `listCompanies`, `getCompany`, and `searchCompanies` methods with runtime validation at API boundaries.


## Technical Context

**Language/Version**: TypeScript 5.x (strict) targeting Node.js 22+  
**Primary Dependencies**: None (zero runtime dependencies; native fetch)  
**Storage**: None (in-memory only)  
**Testing**: Vitest (unit, contract, integration), includes pagination + error paths  
**Target Platform**: Node.js 22+ (library)  
**Project Type**: Single NPM package (API client)  
**Performance Goals**: p95 <2s for list/detail/search responses (per spec SC-001..003)  
**Constraints**: Cursor pagination default 50 / max 100; dual ESM/CJS build; strict typing; runtime validation at API boundaries  
**Scale/Scope**: Library consumed by partner apps; must handle high-volume pagination with backpressure and retry logic
## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety First | ✅ Pass | Hand-crafted TypeScript types for companies; strict mode; runtime validation at boundaries |
| II. OpenAPI as Source of Truth | ✅ Pass | Companies endpoints derived from Pax8 Partner Endpoints v1 OpenAPI; contracts documented in `/contracts/companies.openapi.yaml` |
| III. Test-First Development | ✅ Pass | Plan includes unit, contract, and integration tests before implementation |
| IV. Resilient by Default | ✅ Pass | Reuse HTTP retry/backoff and rate-limit handling from existing client; paginate defensively |
| V. Zero Runtime Dependencies | ✅ Pass | Native fetch only; no new runtime deps |
| VI. Developer Experience Excellence | ✅ Pass | Clear method names, JSDoc, pagination helpers, consistent errors |
| Pagination Standard (Tech Standards) | ⚠️ Violation | Constitution cites page-based pagination (default 10, max 200); this feature adopts cursor-based pagination (default 50, max 100) to match API behavior and reduce page drift |

**Gate Status**: CONDITIONAL PASS — Violation documented (pagination standard). Justification recorded in Complexity Tracking; proceed with awareness.
### Project Structure

**Structure Decision**: Single NPM package (library) per constitution. Add `api/companies.ts`, `models/companies.ts`, and `pagination/cursor.ts` with corresponding tests and contracts.

```text
src/
├── api/
│   ├── companies.ts        # Companies API client (list/detail/search)
│   └── index.ts            # API exports aggregator
├── models/
│   └── companies.ts        # Company types and pagination metadata
├── pagination/
│   └── cursor.ts           # Cursor helpers (reusable)
├── client/
│   └── pax8-client.ts      # Existing client wiring
├── auth/
│   ├── token-manager.ts
│   └── types.ts
├── http/
│   └── retry.ts
├── errors/
│   ├── pax8-error.ts
│   └── auth-error.ts
└── index.ts                # Public API exports

tests/
├── unit/
│   ├── api/companies.test.ts        # Method behavior + validation
│   ├── models/companies.test.ts     # Type guards/runtime validation
│   └── pagination/cursor.test.ts    # Cursor helpers
├── contract/
│   └── api/companies-contract.test.ts # Validate request/response against OpenAPI
└── integration/
  └── api/companies-flow.test.ts   # List/search/detail happy/error paths (mock server)
```
## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Pagination standard (page-based, default 10/max 200) | Pax8 companies endpoints require cursor tokens; cursor avoids page drift, supports stable iteration, and matches upstream behavior | Page-number pagination would require additional translation layer, risk stale results, and diverge from upstream API contracts |
## Post-Design Constitution Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety First | ✅ Pass | data-model.md defines typed responses and validation rules; strict mode enforced |
| II. OpenAPI as Source of Truth | ✅ Pass | companies.openapi.yaml aligns with Partner Endpoints v1; hand-crafted types mirror spec |
| III. Test-First Development | ✅ Pass | Planned unit, contract, integration tests precede implementation |
| IV. Resilient by Default | ✅ Pass | Retry/backoff and rate-limit handling applied to companies endpoints |
| V. Zero Runtime Dependencies | ✅ Pass | Uses native fetch; no new runtime packages |
| VI. Developer Experience Excellence | ✅ Pass | Quickstart and JSDoc for company methods; pagination helpers included |
| Pagination Standard (Tech Standards) | ⚠️ Violation | Cursor-based pagination retained; see Complexity Tracking rationale |

**Post-Design Gate Status**: CONDITIONAL PASS — Known pagination standard deviation remains documented and accepted for this feature.

## Generated Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| Research | [research.md](./research.md) | Decisions on pagination, filtering, endpoints, validation, and error handling |
| Data Model | [data-model.md](./data-model.md) | Company entity fields, pagination metadata, validation rules |
| Contract | [contracts/companies.openapi.yaml](./contracts/companies.openapi.yaml) | OpenAPI contract for list/detail/search endpoints |
| Quickstart | [quickstart.md](./quickstart.md) | Usage examples for list, detail, search with cursor pagination |
