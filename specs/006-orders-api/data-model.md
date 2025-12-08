# Data Model - Orders API

## Entities

### Order
- `id` (uuid)
- `companyId` (uuid)
- `createdDate` (ISO 8601)
- `orderedBy` (`Pax8 Partner` | `Customer` | `Pax8`)
- `orderedByUserId` (uuid, read-only)
- `orderedByUserEmail` (email)
- `isScheduled` (boolean, read-only)
- `lineItems` (`OrderLineItem`[])

### OrderLineItem
- `id` (uuid)
- `productId` (uuid)
- `subscriptionId` (uuid, nullable until created)
- `commitmentTermId` (uuid, required when product requires commitment)
- `provisionStartDate` (ISO 8601 date-time)
- `lineItemNumber` (number, write-only reference order)
- `billingTerm` (`Monthly` | `Annual` | `2-Year` | `3-Year` | `One-Time` | `Trial` | `Activation`)
- `parentSubscriptionId` (uuid, write-only)
- `parentLineItemNumber` (number, write-only)
- `quantity` (number)
- `provisioningDetails` (`ProvisioningDetail`[], write-only)

### ProvisioningDetail
- `label` (string, read-only)
- `key` (string)
- `values` (string[], write-only)
- `description` (string, read-only)
- `valueType` (`Input` | `Single-Value` | `Multi-Value`, read-only)
- `possibleValues` (string[], read-only)

### CreateOrderRequest
- `companyId` (uuid, required)
- `lineItems` (`CreateLineItem`[], required)
- `orderedBy` (`Pax8 Partner` | `Customer` | `Pax8`, optional)
- `orderedByUserEmail` (email, optional)

### CreateLineItem
- `productId` (uuid, required)
- `quantity` (number, required)
- `billingTerm` (`Monthly` | `Annual` | `2-Year` | `3-Year` | `One-Time` | `Trial` | `Activation`, required)
- `lineItemNumber` (number, required reference within order)
- `commitmentTermId` (uuid, required when product requires commitment)
- `provisionStartDate` (ISO 8601 date-time, optional)
- `parentSubscriptionId` (uuid, optional)
- `parentLineItemNumber` (number, optional)
- `provisioningDetails` (`ProvisioningDetail`[], optional, write-only values)

### ListOrdersOptions
- `page` (number, default 0)
- `size` (number, default 10, max 200)
- `companyId` (uuid, optional filter)

### OrderListResponse
- `content` (`Order`[])
- `page`:
  - `size` (number)
  - `totalElements` (number)
  - `totalPages` (number)
  - `number` (number)

## Notes
- `isMock` query (boolean) can be sent on create for validation-only requests.
- `provisioningDetails.values` are write-only; responses may omit them.
- No `status` or `price` fields are present on `Order` or `OrderLineItem` in the Pax8 OpenAPI.
