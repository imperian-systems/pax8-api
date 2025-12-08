# Data Model - Invoices API

## Entities

### Invoice
- `id` (uuid)
- `companyId` (uuid)
- `invoiceDate` (ISO 8601)
- `dueDate` (ISO 8601)
- `paidDate` (ISO 8601, nullable)
- `total` (number)
- `balance` (number)
- `status` (`InvoiceStatus`)
- `carriedBalance` (number, nullable)
- `partnerName` (string)

### InvoiceStatus
- `Unpaid`
- `Paid`
- `Void`
- `Pending`
- `Overdue`

### InvoiceItem
- `id` (uuid)
- `invoiceId` (uuid, nullable for drafts)
- `companyId` (uuid)
- `subscriptionId` (uuid, nullable)
- `productId` (uuid)
- `productName` (string)
- `quantity` (number)
- `unitPrice` (number)
- `total` (number)
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)
- `chargeType` (`ChargeType`)

### ChargeType
- `NewCharge`
- `Renewal`
- `ProRata`
- `Adjustment`
- `Credit`

### ListInvoicesOptions
- `page` (number, default 0)
- `size` (number, default 10, max 200)
- `companyId` (uuid, optional)

### ListItemsOptions
- `page` (number, default 0)
- `size` (number, default 10, max 200)

### InvoiceListResponse
- `content` (`Invoice`[])
- `page`:
  - `size` (number)
  - `totalElements` (number)
  - `totalPages` (number)
  - `number` (number)

### InvoiceItemListResponse
- `content` (`InvoiceItem`[])
- `page`:
  - `size` (number)
  - `totalElements` (number)
  - `totalPages` (number)
  - `number` (number)

## Notes
- Pagination is page-based (0-indexed) with max size 200.
- Draft invoice items share the same shape as invoice items; `invoiceId` is null for drafts.
- Totals are derived from `quantity * unitPrice` and may reflect adjustments via `chargeType`.
