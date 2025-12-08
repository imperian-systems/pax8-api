# Data Model - Subscriptions API

## Entities

### Subscription
- `id` (uuid)
- `companyId` (uuid)
- `productId` (uuid)
- `quantity` (number)
- `status` (`SubscriptionStatus`)
- `price` (number)
- `billingTerm` (`BillingTerm`)
- `billingStart` (ISO 8601)
- `startDate` (ISO 8601)
- `endDate` (ISO 8601, nullable)
- `createdDate` (ISO 8601)
- `commitmentTermId` (uuid, nullable)
- `commitmentTermMonths` (number, nullable)
- `commitmentEndDate` (ISO 8601, nullable)

### SubscriptionStatus
- `Active`
- `Cancelled`
- `PendingManual`
- `PendingAutomated`
- `PendingCancel`
- `WaitingForDetails`
- `Trial`
- `Converted`
- `PendingActivation`
- `Activated`

### BillingTerm
- `Monthly`
- `Annual`
- `2-Year`
- `3-Year`
- `One-Time`
- `Trial`
- `Activation`

### UpdateSubscriptionRequest
- `quantity` (number, required)

### CancelOptions
- `billingDate` (ISO 8601 date string, optional)

### SubscriptionHistory
- `id` (uuid)
- `subscriptionId` (uuid)
- `action` (string, e.g., `QuantityUpdate`, `StatusChange`, `Created`)
- `date` (ISO 8601)
- `userId` (uuid, nullable)
- `previousQuantity` (number, nullable)
- `newQuantity` (number, nullable)

### ListSubscriptionsOptions
- `page` (number, default 0)
- `size` (number, default 10, max 200)
- `sort` (string, optional)
- `companyId` (uuid, optional)
- `productId` (uuid, optional)
- `status` (`SubscriptionStatus`, optional)

### SubscriptionListResponse
- `content` (`Subscription`[])
- `page`:
  - `size` (number)
  - `totalElements` (number)
  - `totalPages` (number)
  - `number` (number)

## Notes
- Pagination is page-based (0-indexed) with max size 200; sort uses server-supported fields.
- Update operations are limited to quantity changes; other modifications require cancellation/reorder.
- Cancellation supports optional `billingDate` for future-effective cancellations and returns HTTP 204 with no body.
- History is returned as a full array (no pagination) ordered by date.
- Commitment details live on the subscription for reporting and billing alignment.
