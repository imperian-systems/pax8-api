# Implementation Plan: Products API

**Branch**: `005-products-api` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-products-api/spec.md`

## Summary

Implement typed Products API support (list, get, getProvisioningDetails, getDependencies, getPricing) with page-based pagination (default 10, max 200) and consistent error handling. Products are read-only catalog resources accessed via `/products` endpoints. Types and contracts will be hand-crafted from the Pax8 Partner Endpoints v1 OpenAPI specification. The client will expose `client.products.list()`, `client.products.get()`, `client.products.getProvisioningDetails()`, `client.products.getDependencies()`, and `client.products.getPricing()` methods with typed parameters and runtime validation at API boundaries.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) targeting Node.js 22+  
**Primary Dependencies**: None (zero runtime dependencies; native fetch)  
**Storage**: None (in-memory only)  
**Testing**: Vitest (unit, contract, integration), includes list + detail + provisioning + dependencies + pricing + error paths  
**Target Platform**: Node.js 22+ (library)  
**Project Type**: Single NPM package (API client)  
**Performance Goals**: p95 <2s for list/detail/pricing, <1s for get (per spec SC-001..005)  
**Constraints**: Page-based pagination default 10 / max 200; dual ESM/CJS build; strict typing; typed sort union `'name' | 'vendor'`; 422 for size > 200  
**Scale/Scope**: Library consumed by partner apps; read-only product catalog access with provisioning, dependencies, and pricing metadata

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety First | ✅ Pass | Hand-crafted TypeScript types for Product, ProductDetail, ProvisioningDetail, Dependencies, Pricing; strict mode; typed sort union; runtime validation at boundaries |
| II. OpenAPI as Source of Truth | ✅ Pass | Products endpoints derived from Pax8 Partner Endpoints v1 OpenAPI; contracts documented in `/contracts/products.openapi.yaml` |
| III. Test-First Development | ✅ Pass | Plan includes unit, contract, and integration tests before implementation |
| IV. Resilient by Default | ✅ Pass | Reuse HTTP retry/backoff and rate-limit handling from existing client |
| V. Zero Runtime Dependencies | ✅ Pass | Native fetch only; no new runtime deps |
| VI. Developer Experience Excellence | ✅ Pass | Clear method names (`list`, `get`, `getProvisioningDetails`, `getDependencies`, `getPricing`), JSDoc, pagination helpers, consistent errors |
| Pagination Standard (Tech Standards) | ✅ Pass | Page-based pagination (default 10, max 200) aligns with constitution |
| Dynamic Data Warning | ✅ Pass | Constitution notes pricing, dependencies, provisioning details are dynamic; document in JSDoc |

**Gate Status**: PASS — All principles satisfied; proceed to Phase 0.

## Project Structure

**Structure Decision**: Single NPM package (library) per constitution. Add `api/products.ts`, `models/products.ts` with corresponding tests and contracts. Reuse existing pagination, HTTP, and error infrastructure.

```text
src/
├── api/
│   ├── companies.ts        # Existing Companies API
│   ├── contacts.ts         # Existing Contacts API
│   ├── products.ts         # NEW: Products API client (list/get/provisioning/dependencies/pricing)
│   └── index.ts            # API exports aggregator (update to export products)
├── models/
│   ├── companies.ts        # Existing Company types
│   ├── contacts.ts         # Existing Contact types
│   └── products.ts         # NEW: Product types and request/response shapes
├── pagination/
│   └── cursor.ts           # Existing pagination helpers (reusable for page iteration)
├── client/
│   └── pax8-client.ts      # Update to wire products API
├── auth/
│   ├── token-manager.ts
│   └── types.ts
├── http/
│   └── retry.ts
├── errors/
│   ├── pax8-error.ts
│   └── auth-error.ts
└── index.ts                # Public API exports (update to export products)

tests/
├── unit/
│   ├── api/products.test.ts         # Method behavior + validation
│   └── models/products.test.ts      # Type guards/runtime validation
├── contract/
│   └── api/products-contract.test.ts # Validate request/response against OpenAPI
└── integration/
    └── api/products-flow.test.ts    # Read operations happy/error paths (mock server)
```

## Complexity Tracking

> No constitution violations for this feature. Read-only operations, page-based pagination matches standard.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

---

## Post-Design Constitution Check

*Re-evaluation after Phase 1 design completion.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety First | ✅ Pass | `data-model.md` defines 11 typed entities with strict field types; typed sort union in params |
| II. OpenAPI as Source of Truth | ✅ Pass | `contracts/products.openapi.yaml` defines all 5 endpoints with schemas matching Pax8 API |
| III. Test-First Development | ✅ Pass | Test structure defined; contracts enable contract testing |
| IV. Resilient by Default | ✅ Pass | Error responses defined in OpenAPI; retry logic reused from client |
| V. Zero Runtime Dependencies | ✅ Pass | No new dependencies introduced in design |
| VI. Developer Experience Excellence | ✅ Pass | `quickstart.md` provides clear usage examples for all 5 methods |
| Pagination Standard | ✅ Pass | Page-based pagination (0-indexed, default 10, max 200) documented in contract |
| Dynamic Data Warning | ✅ Pass | Pricing/dependencies documented as dynamic in research.md |

**Post-Design Gate Status**: PASS — Design artifacts align with constitution.

---

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | `specs/005-products-api/research.md` | Endpoint decisions, pagination approach, entity mappings |
| Data Model | `specs/005-products-api/data-model.md` | Entity definitions with field types and validation rules |
| API Contract | `specs/005-products-api/contracts/products.openapi.yaml` | OpenAPI 3.0 specification for Products API |
| Quickstart | `specs/005-products-api/quickstart.md` | Usage examples for all Products API methods |

---

## Next Steps

Phase 2 (Task Generation) will create:
- `tasks.md` with implementation tasks decomposed from this plan
- Test-first development tasks (contracts → unit → integration)
- Implementation tasks for models, API client, and client wiring
