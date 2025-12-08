# Implementation Plan: Contacts API

**Branch**: `004-contacts-api` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-contacts-api/spec.md`

## Summary

Implement typed Contacts API support (list, get, create, update, delete) with page-based pagination (default 10, max 200) and consistent error handling. Contacts are nested under companies (`/companies/{companyId}/contacts`). Types and contracts will be hand-crafted from the Pax8 Partner Endpoints v1 OpenAPI specification. The client will expose `client.contacts.list()`, `client.contacts.get()`, `client.contacts.create()`, `client.contacts.update()`, and `client.contacts.delete()` methods with runtime validation at API boundaries.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) targeting Node.js 22+  
**Primary Dependencies**: None (zero runtime dependencies; native fetch)  
**Storage**: None (in-memory only)  
**Testing**: Vitest (unit, contract, integration), includes CRUD + pagination + error paths  
**Target Platform**: Node.js 22+ (library)  
**Project Type**: Single NPM package (API client)  
**Performance Goals**: p95 <2s for list/detail, <3s for create (per spec SC-001..003)  
**Constraints**: Page-based pagination default 10 / max 200; dual ESM/CJS build; strict typing; runtime validation at API boundaries  
**Scale/Scope**: Library consumed by partner apps; must handle contact CRUD with proper error propagation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety First | ✅ Pass | Hand-crafted TypeScript types for contacts; strict mode; runtime validation at boundaries |
| II. OpenAPI as Source of Truth | ✅ Pass | Contacts endpoints derived from Pax8 Partner Endpoints v1 OpenAPI; contracts documented in `/contracts/contacts.openapi.yaml` |
| III. Test-First Development | ✅ Pass | Plan includes unit, contract, and integration tests before implementation |
| IV. Resilient by Default | ✅ Pass | Reuse HTTP retry/backoff and rate-limit handling from existing client |
| V. Zero Runtime Dependencies | ✅ Pass | Native fetch only; no new runtime deps |
| VI. Developer Experience Excellence | ✅ Pass | Clear method names, JSDoc, pagination helpers, consistent errors |
| Pagination Standard (Tech Standards) | ✅ Pass | Page-based pagination (default 10, max 200) aligns with constitution |

**Gate Status**: PASS — All principles satisfied; proceed to Phase 0.

## Project Structure

**Structure Decision**: Single NPM package (library) per constitution. Add `api/contacts.ts`, `models/contacts.ts` with corresponding tests and contracts. Reuse existing pagination, HTTP, and error infrastructure.

```text
src/
├── api/
│   ├── companies.ts        # Existing Companies API
│   ├── contacts.ts         # NEW: Contacts API client (list/get/create/update/delete)
│   └── index.ts            # API exports aggregator (update to export contacts)
├── models/
│   ├── companies.ts        # Existing Company types
│   └── contacts.ts         # NEW: Contact types and request/response shapes
├── pagination/
│   └── cursor.ts           # Existing cursor helpers (reusable for page iteration)
├── client/
│   └── pax8-client.ts      # Update to wire contacts API
├── auth/
│   ├── token-manager.ts
│   └── types.ts
├── http/
│   └── retry.ts
├── errors/
│   ├── pax8-error.ts
│   └── auth-error.ts
└── index.ts                # Public API exports (update to export contacts)

tests/
├── unit/
│   ├── api/contacts.test.ts         # Method behavior + validation
│   └── models/contacts.test.ts      # Type guards/runtime validation
├── contract/
│   └── api/contacts-contract.test.ts # Validate request/response against OpenAPI
└── integration/
    └── api/contacts-flow.test.ts    # CRUD happy/error paths (mock server)
```

## Complexity Tracking

> No constitution violations for this feature. Page-based pagination matches standard.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Post-Design Constitution Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety First | ✅ Pass | data-model.md defines typed requests/responses and validation rules; strict mode enforced |
| II. OpenAPI as Source of Truth | ✅ Pass | contacts.openapi.yaml aligns with Partner Endpoints v1; hand-crafted types mirror spec |
| III. Test-First Development | ✅ Pass | Planned unit, contract, integration tests precede implementation |
| IV. Resilient by Default | ✅ Pass | Retry/backoff and rate-limit handling applied to contacts endpoints |
| V. Zero Runtime Dependencies | ✅ Pass | Uses native fetch; no new runtime packages |
| VI. Developer Experience Excellence | ✅ Pass | Quickstart and JSDoc for contact methods; CRUD examples included |
| Pagination Standard (Tech Standards) | ✅ Pass | Page-based pagination with default 10, max 200 |

**Post-Design Gate Status**: PASS — All principles satisfied.

## Generated Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| Research | [research.md](./research.md) | Decisions on endpoints, contact types, pagination, validation, and error handling |
| Data Model | [data-model.md](./data-model.md) | Contact entity fields, ContactType, pagination metadata, validation rules |
| Contract | [contracts/contacts.openapi.yaml](./contracts/contacts.openapi.yaml) | OpenAPI contract for CRUD endpoints |
| Quickstart | [quickstart.md](./quickstart.md) | Usage examples for list, get, create, update, delete |
