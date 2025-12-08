# Implementation Plan: Orders API

**Branch**: `006-orders-api` | **Date**: December 8, 2025 | **Spec**: [/specs/006-orders-api/spec.md](/specs/006-orders-api/spec.md)
**Input**: Feature specification from `/specs/006-orders-api/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add Orders API support to the TypeScript Pax8 client: list orders with page/size and companyId filter (no status or sort), fetch order details, and create orders with validated line items (product, quantity, billingTerm, commitmentTermId when required, provisioning details) while returning typed responses and subscription references.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22+  
**Primary Dependencies**: Native `fetch` (no runtime deps); internal modules under `src/api`, `src/client`, `src/http`; dev tooling: TypeScript, Vitest, ESLint, Prettier  
**Storage**: N/A (HTTP client library)  
**Testing**: Vitest (unit/contract/integration patterns already in repo)  
**Target Platform**: Node.js 22+ library (dual ESM/CJS outputs)  
**Project Type**: Single package (library)  
**Performance Goals**: Match existing client latency expectations; list/detail <2s p95 and create <3s p95 per spec success criteria (subject to upstream API)  
**Constraints**: Zero runtime deps; OpenAPI-aligned types; page-based pagination (page/size, max 200); retries/resilience per shared HTTP client  
**Scale/Scope**: Feature scope limited to orders list/get/create APIs with typed filters and line items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type Safety First**: Must define Order/OrderLineItem/CreateOrderRequest types exactly per Pax8 OpenAPI (Partner Endpoints v1); no `any` escapes. **Status**: PASS (will map to OpenAPI during design).
- **OpenAPI as Source of Truth**: Hand-crafted types and methods must cite Pax8 OpenAPI endpoints (orders). **Status**: PASS (plan to align with spec 6463f53f2c9755000aaf50be).
- **Test-First Development (TDD)**: Add/extend contract and integration tests for list/get/create before implementation using Vitest. **Status**: PASS (required for coding).
- **Resilient by Default**: Reuse existing HTTP client with retries/backoff for 429/5xx; ensure orders endpoints covered. **Status**: PASS (use shared retry logic).
- **Zero Runtime Dependencies**: Keep runtime dependency-free; reuse native fetch and existing helpers. **Status**: PASS.
- **Developer Experience Excellence**: Add JSDoc and examples consistent with README patterns. **Status**: PASS.

**Post-Design Re-check**: PASS. Data model and contracts align to Pax8 OpenAPI (removed speculative status/price), tests planned before code, runtime deps remain zero.

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
```text
src/
├── index.ts
├── api/
│   ├── companies.ts
│   ├── contacts.ts
│   ├── products.ts
│   ├── index.ts
│   └── (add orders.ts)
├── auth/
│   ├── token-manager.ts
│   └── types.ts
├── client/
│   ├── config.ts
│   └── pax8-client.ts
├── errors/
│   ├── auth-error.ts
│   └── pax8-error.ts
├── http/
│   └── retry.ts
└── models/
    ├── companies.ts
    ├── contacts.ts
    ├── products.ts
    └── (add orders.ts)

tests/
├── contract/
│   └── api/
│       ├── companies-contract.test.ts
│       ├── contacts-contract.test.ts
│       ├── products-contract.test.ts
│       └── (add orders-contract.test.ts)
└── integration/
    └── api/
        ├── companies-flow.test.ts
        ├── contacts-flow.test.ts
        ├── products-flow.test.ts
        └── (add orders-flow.test.ts)
```

**Structure Decision**: Single-package TypeScript client. Add `orders` API/model files and contract/integration tests following existing patterns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
