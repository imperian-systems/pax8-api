# Implementation Plan: Usage Summaries API

**Branch**: `010-usage-summaries-api` | **Date**: December 9, 2025 | **Spec**: `specs/010-usage-summaries-api/spec.md`
**Input**: Feature specification from `/specs/010-usage-summaries-api/spec.md`

**Note**: Generated via `/speckit.plan` workflow.

## Summary

Implement the Pax8 Usage Summaries API surface: list usage summaries for a subscription (via `/subscriptions/{subscriptionId}/usage-summaries`), get usage summary by ID, and list usage lines for a summary (requires usageDate parameter). Follow existing client patterns (TypeScript strict, native fetch, shared HTTP utilities, consistent error handling) and align models/endpoints to Pax8 Partner API OpenAPI while keeping runtime dependencies at zero. Usage summaries are accessed via subscription context per FR-009.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) on Node.js 22+  
**Primary Dependencies**: Native `fetch`; existing internal utilities in `src/http`, `src/auth`, `src/errors`; dev tooling via Vitest/ts-node; no new runtime deps  
**Storage**: N/A (HTTP client library only)  
**Testing**: Vitest (unit/contract/integration patterns already in repo)  
**Target Platform**: Node.js 22+ consumers (library)  
**Project Type**: Single TypeScript library (dual ESM/CJS build)  
**Performance Goals**: Align with success criteria (p95 API calls under ~2s for list/detail/lines) and maintain zero-additional latency beyond existing client overhead  
**Constraints**: Page size max 200; zero runtime dependencies; TDD required; must honor retry/backoff and error typing per constitution; OpenAPI as source of truth  
**Scale/Scope**: Add usage summaries coverage (3 methods) plus associated models and tests; read-only operations only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type Safety First**: PASS — All new models and methods will be fully typed, no `any`, strict TS.
- **OpenAPI as Source of Truth**: PASS — Models/methods will be hand-crafted to match Pax8 Partner API UsageSummary/UsageLine endpoints from official OpenAPI; code will reference source sections.
- **Test-First Development (TDD)**: PASS — Contract and integration tests will be authored before implementation; red-green-refactor enforced.
- **Resilient by Default**: PASS — Reuse existing retry/backoff, timeout, and error handling utilities; respect 429 `Retry-After`.
- **Zero Runtime Dependencies**: PASS — Use native fetch and existing utilities; no new runtime deps introduced.
- **Developer Experience Excellence**: PASS — Add JSDoc, examples, and consistent naming/pagination ergonomics.

**Post-Design Check (Phase 1)**: Pending — To be verified after design artifacts generated.

## Project Structure

### Documentation (this feature)

```text
specs/010-usage-summaries-api/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── usage-summaries.openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── index.ts                      # export UsageSummariesApi
│   ├── subscriptions.ts              # extend with listUsageSummaries method
│   └── usage-summaries.ts            # new: UsageSummariesApi class (get, listLines)
├── models/
│   ├── subscriptions.ts              # existing
│   └── usage-summaries.ts            # new: UsageSummary, UsageLine, options, responses
├── client/
│   └── pax8-client.ts                # add usageSummaries property
├── errors/
├── auth/
├── http/
└── index.ts                          # export new types

tests/
├── contract/
│   └── api/
│       └── usage-summaries-contract.test.ts   # new
└── integration/
    └── api/
        └── usage-summaries-flow.test.ts       # new (optional if real API creds available)
```

**Structure Decision**: Single TypeScript library; add usage-summaries models/api plus contract tests alongside existing resource patterns. Usage summary listing lives on SubscriptionsApi (mirrors Pax8 API structure), while get/listLines live on new UsageSummariesApi.

## Complexity Tracking

No constitution violations requiring justification.

---

## Post-Design Constitution Check (Phase 1)

*Re-evaluated after design artifacts generated.*

- **Type Safety First**: ✅ PASS — All types fully defined in data-model.md with TypeScript interfaces, type guards, and assertion functions.
- **OpenAPI as Source of Truth**: ✅ PASS — OpenAPI contract created in contracts/usage-summaries.openapi.yaml matching official Pax8 API.
- **Test-First Development (TDD)**: ✅ PASS — Contract test structure defined in project structure.
- **Resilient by Default**: ✅ PASS — Design uses existing retry/error utilities; rate limit handling via Retry-After.
- **Zero Runtime Dependencies**: ✅ PASS — Only native fetch and existing utilities; no new deps.
- **Developer Experience Excellence**: ✅ PASS — Quickstart.md with comprehensive examples; JSDoc comments specified.

**All gates passed.** Ready for Phase 2 (tasks.md generation via `/speckit.tasks`).
