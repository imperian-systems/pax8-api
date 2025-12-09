# Implementation Plan: Quotes API

**Branch**: `011-quotes-api` | **Date**: December 9, 2025 | **Spec**: `specs/011-quotes-api/spec.md`
**Input**: Feature specification from `/specs/011-quotes-api/spec.md`

**Note**: Generated via `/speckit.plan` workflow.

## Summary

Implement the Pax8 Quoting API v2 surface: full quote lifecycle (create, list, get, update, delete), line item management (add, update, delete single, bulk delete), section organization, access list sharing, and quote preferences. This is a v2 API (base path `/v2/`) that uses `limit/page` pagination rather than `page/size`. Follow existing client patterns (TypeScript strict, native fetch, shared HTTP utilities, consistent error handling) while extending Pax8Client to handle both v1 and v2 base paths. Implements discriminated union for line item types (Standard, Custom, UsageBased). Zero runtime dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) on Node.js 22+  
**Primary Dependencies**: Native `fetch`; existing internal utilities in `src/http`, `src/auth`, `src/errors`; dev tooling via Vitest/ts-node; no new runtime deps  
**Storage**: N/A (HTTP client library only)  
**Testing**: Vitest (unit/contract/integration patterns already in repo)  
**Target Platform**: Node.js 22+ consumers (library)  
**Project Type**: Single TypeScript library (dual ESM/CJS build)  
**Performance Goals**: Align with success criteria (p95 API calls under ~2s) and maintain zero-additional latency beyond existing client overhead  
**Constraints**: Zero runtime dependencies; TDD required; must honor retry/backoff and error typing per constitution; OpenAPI as source of truth; max 30 line items per quote  
**Scale/Scope**: Add quotes coverage (15+ methods across 2 API classes) plus associated models and tests; CRUD + nested resources

### Key Technical Differences from v1 APIs

- **Base Path**: `/v2/` instead of `/v1/`
- **Pagination**: Uses `limit` and `page` (not `page` and `size`)
- **Authentication**: Same OAuth 2.0 client credentials (token works for both v1 and v2)
- **Error Structure**: Similar structure but different error type enumerations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type Safety First**: PASS — All new models will be fully typed with discriminated unions for line item types, no `any`, strict TS.
- **OpenAPI as Source of Truth**: PASS — Models/methods derived from official Pax8 Quoting Endpoints v2 OpenAPI (`https://devx.pax8.com/openapi/6761fd80721228003dd0af1a`).
- **Test-First Development (TDD)**: PASS — Contract and integration tests will be authored before implementation; red-green-refactor enforced.
- **Resilient by Default**: PASS — Reuse existing retry/backoff, timeout, and error handling utilities; respect 429 `Retry-After`.
- **Zero Runtime Dependencies**: PASS — Use native fetch and existing utilities; no new runtime deps introduced.
- **Developer Experience Excellence**: PASS — Add JSDoc, examples, discriminated unions for type narrowing, consistent naming.

**Post-Design Check (Phase 1)**: Pending — To be verified after design artifacts generated.

## Project Structure

### Documentation (this feature)

```text
specs/011-quotes-api/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── quotes.openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── index.ts                      # export QuotesApi, QuotePreferencesApi
│   ├── quotes.ts                     # new: QuotesApi class (CRUD, line items, sections, access list)
│   └── quote-preferences.ts          # new: QuotePreferencesApi class (get, update)
├── models/
│   ├── quotes.ts                     # new: Quote, LineItem, Section, AccessListEntry, etc.
│   └── quote-preferences.ts          # new: QuotePreferences
├── client/
│   └── pax8-client.ts                # add quotes, quotePreferences properties (v2 path handling)
├── errors/
├── auth/
├── http/
│   └── api-utils.ts                  # extend with v2 pagination validators (validateLimit, validateV2Page)
└── index.ts                          # export new types

tests/
├── contract/
│   └── api/
│       ├── quotes-contract.test.ts           # new: quote CRUD + nested operations
│       └── quote-preferences-contract.test.ts # new: preferences operations
└── integration/
    └── api/
        └── quotes-flow.test.ts               # new (optional if real API creds available)
```

**Structure Decision**: Single TypeScript library; add quotes models/api plus contract tests alongside existing resource patterns. QuotesApi handles all quote operations including nested resources (line items, sections, access list). QuotePreferencesApi handles partner-level preferences. Client extended with v2 path support.

## Complexity Tracking

No constitution violations requiring justification.

---

## Post-Design Constitution Check (Phase 1)

*Re-evaluated after design artifacts generated.*

- **Type Safety First**: ✅ PASS — All types fully defined in data-model.md with TypeScript interfaces, discriminated unions for line item types, type guards, and assertion functions.
- **OpenAPI as Source of Truth**: ✅ PASS — OpenAPI contract created in contracts/quotes.openapi.yaml matching official Pax8 Quoting API v2 specification.
- **Test-First Development (TDD)**: ✅ PASS — Contract test structure defined in project structure; test files identified.
- **Resilient by Default**: ✅ PASS — Design uses existing retry/error utilities; rate limit handling via Retry-After header.
- **Zero Runtime Dependencies**: ✅ PASS — Only native fetch and existing utilities; no new runtime deps.
- **Developer Experience Excellence**: ✅ PASS — Quickstart.md with comprehensive examples; JSDoc comments specified; discriminated unions for type narrowing.

**All gates passed.** Ready for Phase 2 (tasks.md generation via `/speckit.tasks`).


