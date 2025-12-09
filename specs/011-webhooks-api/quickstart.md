````markdown
# Quickstart - Webhooks API

## List webhooks with filters
```typescript
const page = await client.webhooks.list({
  active: true,
  topic: 'subscription.updated',
  page: 0,
  size: 20,
  sort: 'createdAt:desc'
});

console.log(page.content[0]?.displayName);
console.log(page.page.totalElements);
```

## Create a webhook
```typescript
const webhook = await client.webhooks.create({
  displayName: 'Order Notifications',
  url: 'https://example.com/webhooks/pax8',
  authorization: 'Bearer my-secret-token',
  active: true,
  contactEmail: 'alerts@example.com',
  errorThreshold: 5,
  webhookTopics: [
    {
      topic: 'order.created',
      filters: [
        {
          action: 'created',
          conditions: [
            { field: 'companyId', operator: 'EQUALS', value: ['company-uuid'] }
          ]
        }
      ]
    }
  ]
});

console.log(webhook.id);
console.log(webhook.webhookTopics.length);
```

## Get a webhook by ID
```typescript
const webhook = await client.webhooks.get('webhook-id');
console.log(webhook.displayName);
console.log(webhook.active);
console.log(webhook.lastDeliveryStatus);
```

## Update webhook configuration
```typescript
const updated = await client.webhooks.updateConfiguration('webhook-id', {
  displayName: 'Updated Webhook Name',
  url: 'https://new-endpoint.example.com/webhooks',
  errorThreshold: 10
});

console.log(updated.displayName); // 'Updated Webhook Name'
```

## Update webhook status (enable/disable)
```typescript
// Disable a webhook
const disabled = await client.webhooks.updateStatus('webhook-id', {
  active: false
});
console.log(disabled.active); // false

// Re-enable the webhook
const enabled = await client.webhooks.updateStatus('webhook-id', {
  active: true
});
console.log(enabled.active); // true
```

## Delete a webhook
```typescript
await client.webhooks.delete('webhook-id');
// Returns void on success (HTTP 204)
```

## Manage webhook topics

### Add a topic
```typescript
const updated = await client.webhooks.addTopic('webhook-id', {
  topic: 'subscription.cancelled',
  filters: [
    {
      action: 'cancelled',
      conditions: []
    }
  ]
});

console.log(updated.webhookTopics.length);
```

### Replace all topics
```typescript
const updated = await client.webhooks.replaceTopics('webhook-id', {
  webhookTopics: [
    {
      topic: 'invoice.created',
      filters: [{ action: 'created', conditions: [] }]
    },
    {
      topic: 'invoice.updated',
      filters: [{ action: 'updated', conditions: [] }]
    }
  ]
});
```

### Remove a topic
```typescript
await client.webhooks.removeTopic('webhook-id', 'topic-id');
// Returns void on success (HTTP 204)
```

### Update topic configuration
```typescript
const updated = await client.webhooks.updateTopicConfiguration(
  'webhook-id',
  'topic-id',
  {
    filters: [
      {
        action: 'updated',
        conditions: [
          { field: 'status', operator: 'IN', value: ['Active', 'Cancelled'] }
        ]
      }
    ]
  }
);
```

## Get topic definitions
```typescript
const definitions = await client.webhooks.getTopicDefinitions({
  search: 'subscription',
  page: 0,
  size: 10
});

for (const def of definitions.content) {
  console.log(`${def.topic}: ${def.description}`);
  console.log('Available filters:', def.availableFilters.map(f => f.action));
}
```

## Test a webhook
```typescript
const testResult = await client.webhooks.test('webhook-id', 'subscription.created');

console.log('URL called:', testResult.url);
console.log('Sample payload:', testResult.samplePayload);
```

## View webhook logs
```typescript
// List delivery logs with filters
const logs = await client.webhooks.listLogs('webhook-id', {
  status: 'FAILED',
  topicName: 'order.created',
  startDate: '2025-12-01T00:00:00Z',
  endDate: '2025-12-09T23:59:59Z',
  page: 0,
  size: 50
});

for (const log of logs.content) {
  console.log(`${log.id}: ${log.finalStatus} at ${log.createdAt}`);
  console.log('  Attempts:', log.callHistory.length);
}

// Get a specific log entry
const logEntry = await client.webhooks.getLog('webhook-id', 'log-id');
console.log('Call history:', logEntry.callHistory);
```

## Retry failed webhook delivery
```typescript
await client.webhooks.retryDelivery('webhook-id', 'log-id');
// Returns void on success (HTTP 202 Accepted)
// Check logs later to verify retry outcome
```

### Notes
- Webhooks API uses base URL `/api/v2` (distinct from v1 used by other endpoints).
- Pagination is page-based (`page`, `size` up to 200); sort format is `field:asc/desc`.
- `errorThreshold` maximum is 20; controls retry attempts before email notification.
- `integrationId` is required only for 3rd party integrators.
- Adding a duplicate topic to a webhook returns a validation error.
- Retry requests return HTTP 202 Accepted; delivery status must be checked via logs.
- Delete operations (webhook, topic) return HTTP 204 No Content.
- Filter operators: `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`, `LESS_THAN`, `IN`, `NOT_IN`, `CONTAINS`.

````
