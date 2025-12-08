# Research Findings - Orders API

## Decision 1: List filters and sorting
- **Decision**: Align with OpenAPI: support `page`, `size`, and `companyId` filter; no `status` filter and no server-side sort for orders.
- **Rationale**: Pax8 Partner v1 OpenAPI (`/orders`) defines only `page`, `size`, `companyId`; no sort or status filters. Constitution requires OpenAPI as source of truth.
- **Alternatives considered**: (a) Add `status` filter and `sort` per README/spec (would diverge from OpenAPI); (b) Client-side sort/filter (inefficient, misleading). 

## Decision 2: Order status field
- **Decision**: Do not expose a typed `status` field on `Order` because the OpenAPI does not define one; treat status as unavailable in responses.
- **Rationale**: OpenAPI `Order` schema lacks `status`; adding would be speculative and violate source-of-truth principle.
- **Alternatives considered**: (a) Introduce inferred statuses (speculative); (b) Map subscription status (not part of order response).

## Decision 3: Line item pricing
- **Decision**: Do not include `price` on `OrderLineItem`; pricing is handled on resulting subscriptions, not returned on orders in OpenAPI.
- **Rationale**: OpenAPI `LineItem` schema has no price fields; aligning avoids incorrect typings.
- **Alternatives considered**: (a) Add `price` from subscription pricing (not present on order response); (b) Add `price` in request (unsupported by API).

## Decision 4: Required line item fields
- **Decision**: `billingTerm` is required for each line item; include `commitmentTermId` when the product requires commitment; allow optional `provisionStartDate`, `parentSubscriptionId`, `parentLineItemNumber`, and write-only `provisioningDetails`.
- **Rationale**: OpenAPI `CreateLineItem` requires `productId`, `quantity`, `lineItemNumber`, `billingTerm`; includes commitment and parent linkage fields; provisioning details follow product schema.
- **Alternatives considered**: (a) Omit `commitmentTermId` (would fail for commitment products); (b) Make `billingTerm` optional (violates spec).

## Decision 5: Subscription linkage
- **Decision**: Include `subscriptionId` on response `OrderLineItem` (nullable until created) to provide order→subscription traceability.
- **Rationale**: OpenAPI `LineItem` includes `subscriptionId`; exposing it enables reconciliation without extra lookups.
- **Alternatives considered**: (a) Omit subscription linkage (harder reconciliation); (b) Expose at order level only (less granular).

## Decision 6: Provisioning details shape
- **Decision**: Use OpenAPI `ProvisioningDetail` shape: `label` (ro), `key`, `values` (write-only array of strings), `description` (ro), `valueType`, `possibleValues` (ro). Treat as write-only for create; may not be echoed in responses.
- **Rationale**: Matches Partner v1 schema; respects write-only semantics while keeping type safety.
- **Alternatives considered**: (a) Send single-value string (breaks multi-value cases); (b) Assume echo in response (not guaranteed).

## Decision 7: Misc request fields
- **Decision**: Support optional `isMock` query on create (validation-only) and `orderedBy`/`orderedByUserEmail` fields on `CreateOrder`; capture read-only `orderedByUserId` in responses.
- **Rationale**: Documented in OpenAPI; useful for validation and audit trails.
- **Alternatives considered**: (a) Ignore `isMock` (lose safe validation path); (b) Omit orderedBy metadata (lose audit info).
