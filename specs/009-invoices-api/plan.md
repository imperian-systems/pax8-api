# Implementation Plan: Invoices API

**Branch**: `009-invoices-api` | **Date**: December 8, 2025 | **Spec**: `specs/009-invoices-api/spec.md`
**Input**: Feature specification from `/specs/009-invoices-api/spec.md`

**Note**: Generated via `/speckit.plan` workflow.

## Summary

Implement the Pax8 Invoices API surface described in the README: list invoices (page-based with optional company filter), get invoice by ID, list invoice line items, and list draft invoice items for a company. Follow existing client patterns (TypeScript strict, native fetch, shared HTTP utilities, consistent error handling) and align models/endpoints to Pax8 OpenAPI while keeping runtime dependencies at zero.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) on Node.js 22+  
**Primary Dependencies**: Native `fetch`; existing internal utilities in `src/http`, `src/auth`, `src/errors`; dev tooling via Vitest/ts-node; no new runtime deps  
**Storage**: N/A (HTTP client library only)  
**Testing**: Vitest (unit/contract/integration patterns already in repo)  
**Target Platform**: Node.js 22+ consumers (library)  
**Project Type**: Single TypeScript library (dual ESM/CJS build)  
**Performance Goals**: Align with success criteria (p95 API calls under ~2s for list/detail/line items) and maintain zero-additional latency beyond existing client overhead  
**Constraints**: Page size max 200; zero runtime dependencies; TDD required; must honor retry/backoff and error typing per constitution; OpenAPI as source of truth  
**Scale/Scope**: Add invoices coverage (4 methods) plus associated models and tests; no data mutation flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type Safety First**: PASS — All new models and methods will be fully typed, no `any`, strict TS.
- **OpenAPI as Source of Truth**: PASS — Models/methods will be hand-crafted to match Pax8 Invoices endpoints from official OpenAPI/README; code will reference source sections where available.
- **Test-First Development (TDD)**: PASS — Contract and integration tests will be authored before implementation; red-green-refactor enforced.
- **Resilient by Default**: PASS — Reuse existing retry/backoff, timeout, and error handling utilities; respect 429 `Retry-After`.
- **Zero Runtime Dependencies**: PASS — Use native fetch and existing utilities; no new runtime deps introduced.
- **Developer Experience Excellence**: PASS — Add JSDoc, examples, and consistent naming/pagination ergonomics.

**Post-Design Check (Phase 1)**: PASS — Design artifacts (data model, contract, quickstart) align with OpenAPI-driven, typed, TDD, and zero-runtime-deps principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
specs/009-invoices-api/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md (created by /speckit.tasks later)

src/
├── api/
│   ├── index.ts
│   └── invoices.ts            # new
├── models/
│   └── invoices.ts           # new
├── errors/
├── auth/
├── client/
├── http/
└── index.ts

tests/
├── contract/
│   └── api/
│       └── invoices-contract.test.ts   # new
└── integration/
  └── api/
    └── invoices-flow.test.ts       # new
```

**Structure Decision**: Single TypeScript library; add invoices models/api plus contract & integration tests alongside existing resource patterns.

## Complexity Tracking

No constitution violations requiring justification.
