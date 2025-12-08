# Research Findings - Subscriptions API

Decision: Limit `UpdateSubscriptionRequest` payload to `quantity` only.
Rationale: Aligns with README example and typical Pax8 subscription adjustments; reduces validation surface and matches clarification answer.
Alternatives considered: Allow billing term or product changes; rejected because they require cancellation and reorder workflows per spec assumptions.

Decision: Treat `CancelOptions.billingDate` as optional and return HTTP 204 on success.
Rationale: Clarification established optional future-effective cancellation; existing DELETE patterns in repo use void/204 responses.
Alternatives considered: Require billingDate or return a confirmation body; rejected to keep parity with current API patterns and minimize payloads.

Decision: Include commitment fields on `Subscription` (commitmentTermId, commitmentTermMonths, commitmentEndDate).
Rationale: Clarification requests full commitment context for reporting and parity with Pax8 billing data.
Alternatives considered: Omit commitment details or defer to product lookup; rejected because integrators need direct subscription-level commitment data.

Decision: Capture subscription history entries with action, timestamp, old/new quantity, and userId.
Rationale: Clarification selected standard audit payload sufficient for quantity/state changes without overcomplicating schema.
Alternatives considered: Rich diff payloads or pagination of history; rejected to keep history lightweight and consistent with README signature (array only).

Decision: Reuse existing pagination, retry, and rate-limit handling patterns.
Rationale: Constitution requires resilient-by-default behavior and zero runtime deps; current `http/` utilities already implement backoff and headers.
Alternatives considered: Adding external client libraries; rejected per zero-dependency principle and consistency with existing resources.

Decision: Use Vitest contract and integration suites for TDD before implementation.
Rationale: Constitution mandates Test-First Development; repo already structured with contract/integration tests for other APIs.
Alternatives considered: Ad-hoc manual testing or postponing automated tests; rejected due to non-negotiable TDD requirement.
