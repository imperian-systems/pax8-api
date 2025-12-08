# Quickstart - Orders API

## List orders for a company
```typescript
const orders = await client.orders.list({
  companyId: 'company-id',
  page: 0,
  size: 20
});

console.log(orders.content.length);
console.log(orders.page.totalElements);
```

## Get a specific order
```typescript
const order = await client.orders.get('order-id');
console.log(order.companyId);
console.log(order.lineItems[0]?.productId);
```

## Create an order (with billing term and provisioning details)
```typescript
const created = await client.orders.create({
  companyId: 'company-id',
  orderedBy: 'Pax8 Partner',
  orderedByUserEmail: 'agent@example.com',
  lineItems: [
    {
      productId: 'product-id',
      quantity: 5,
      billingTerm: 'Monthly',
      lineItemNumber: 1,
      provisioningDetails: [
        { key: 'tenantDomain', values: ['contoso.onmicrosoft.com'] }
      ]
    }
  ]
});

console.log(created.id);
console.log(created.lineItems[0]?.subscriptionId); // may be null until provisioned
```

## Validate order without creating (mock)
```typescript
await client.orders.create(
  {
    companyId: 'company-id',
    lineItems: [
      { productId: 'product-id', quantity: 1, billingTerm: 'Annual', lineItemNumber: 1 }
    ]
  },
  { isMock: true }
);
```

### Notes
- Pagination is page-based (`page`, `size` up to 200) and supports optional `companyId` filter.
- `billingTerm` is required per line item; include `commitmentTermId` when the product requires commitment.
- `provisioningDetails` use `values` (array) for inputs; these are write-only and may not be echoed in responses.
- `subscriptionId` on line items may be null until the order provisions subscriptions.
