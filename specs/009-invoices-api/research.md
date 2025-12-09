# Research Notes: Invoices API

## Decisions

- **Decision**: Invoice listing supports page-based pagination with optional `companyId` filter only (no status/date filters).
  - **Rationale**: README shows `client.invoices.list({ companyId, size })` and aligns with Orders pattern (companyId-only filter, page/size). Keeps parity with existing API patterns and avoids undocumented filters.
  - **Alternatives considered**: Add status/date filters — rejected due to lack of README or prior-spec evidence; would be speculative.

- **Decision**: Use standard page metadata shape `{ content, page: { size, totalElements, totalPages, number } }` for invoices and invoice items.
  - **Rationale**: README declares `Promise<Page<Invoice>>` and project-wide page-based pagination standard; consistent with Companies/Orders/Subscriptions patterns.
  - **Alternatives considered**: Cursor-based pagination — rejected; cursor used only by Companies per README.

- **Decision**: Model fields align to existing billing patterns (id, companyId, invoiceDate, dueDate, paidDate?, totals, status enum, carriedBalance, partnerName) and invoice items (product info, quantity, unitPrice, total, chargeType, period dates, subscriptionId optional, invoiceId nullable for drafts).
  - **Rationale**: Follows spec content and mirrors patterns from other resources (orders/subscriptions) while staying within README surface. Supports both finalized invoices and drafts with the same shape, matching draft list signature.
  - **Alternatives considered**: Narrower models with only IDs and totals — rejected; would limit usefulness and diverge from other resource richness.

- **Decision**: Testing approach mirrors existing suites: contract tests for request/response shapes and integration-flow tests for list → get → listItems/draftItems.
  - **Rationale**: Constitution mandates TDD with contract + integration coverage; aligns with existing `tests/contract/api/*` and `tests/integration/api/*` structure.
  - **Alternatives considered**: Unit-only tests — rejected; would violate constitution and miss API shape coverage.
