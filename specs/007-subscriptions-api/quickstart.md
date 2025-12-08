# Quickstart - Subscriptions API

## List subscriptions with filters
```typescript
const page = await client.subscriptions.list({
  companyId: 'company-id',
  status: 'Active',
  page: 0,
  size: 20,
  sort: 'productId,asc'
});

console.log(page.content[0]?.id);
console.log(page.page.totalElements);
```

## Get a subscription
```typescript
const subscription = await client.subscriptions.get('subscription-id');
console.log(subscription.quantity);
console.log(subscription.billingTerm);
```

## Update subscription quantity
```typescript
const updated = await client.subscriptions.update('subscription-id', {
  quantity: 15
});

console.log(updated.quantity);
```

## Cancel a subscription (immediate or scheduled)
```typescript
// Immediate cancellation
await client.subscriptions.cancel('subscription-id');

// Schedule cancellation on a billing date
await client.subscriptions.cancel('subscription-id', {
  billingDate: '2025-12-31'
});
```

## Get subscription history
```typescript
const history = await client.subscriptions.getHistory('subscription-id');
console.log(history[0]?.action);
console.log(history[0]?.date);
```

### Notes
- Pagination is page-based (`page`, `size` up to 200) and supports optional filters: `companyId`, `productId`, `status`, `sort`.
- Updates are limited to `quantity`; invalid or negative quantities should return validation errors.
- Cancellations return HTTP 204 with no body; `billingDate` is optional for future-effective cancellation.
- History returns an array of change records (action, timestamp, old/new quantity, userId) without pagination.
