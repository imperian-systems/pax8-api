# Data Model - Webhooks API

## Entities

### Webhook
- `id` (uuid, readonly)
- `accountId` (uuid)
- `displayName` (string)
- `url` (string, optional)
- `authorization` (string, optional)
- `active` (boolean)
- `contactEmail` (string, optional)
- `errorThreshold` (int32, max 20, default 3)
- `integrationId` (uuid, optional)
- `webhookTopics` (`WebhookTopic`[])
- `lastDeliveryStatus` (`WebhookDeliveryStatus`, optional)
- `createdAt` (ISO 8601, readonly)
- `updatedAt` (ISO 8601, readonly)

### WebhookTopic
- `id` (uuid)
- `topic` (string)
- `filters` (`WebhookFilter`[])

### WebhookFilter
- `action` (string)
- `conditions` (`FilterCondition`[])

### FilterCondition
- `field` (string)
- `operator` (`FilterOperator`)
- `value` (string[])

### FilterOperator
- `EQUALS`
- `NOT_EQUALS`
- `GREATER_THAN`
- `LESS_THAN`
- `IN`
- `NOT_IN`
- `CONTAINS`

### WebhookDeliveryStatus
- `PENDING`
- `SUCCESS`
- `FAILED`
- `RETRYING`

### CreateWebhook
- `displayName` (string, required)
- `url` (string, optional)
- `authorization` (string, optional)
- `active` (boolean, default false)
- `contactEmail` (string, optional)
- `errorThreshold` (int32, max 20, default 3)
- `integrationId` (uuid, optional - required for 3rd party integrators)
- `webhookTopics` (`AddWebhookTopic`[], default [])

### UpdateWebhookConfiguration
- `displayName` (string, optional)
- `url` (string, optional)
- `authorization` (string, optional)
- `contactEmail` (string, optional)
- `errorThreshold` (int32, max 20, default 3)

### UpdateWebhookStatus
- `active` (boolean, required)

### AddWebhookTopic
- `topic` (string, required)
- `filters` (`UpdateWebhookFilter`[], required)

### UpdateWebhookFilter
- `action` (string, required)
- `conditions` (`UpdateFilterCondition`[], required)

### UpdateFilterCondition
- `field` (string, required)
- `operator` (`FilterOperator`, required)
- `value` (string[], required)

### ReplaceWebhookTopics
- `webhookTopics` (`AddWebhookTopic`[], required)

### UpdateWebhookTopicConfiguration
- `filters` (`UpdateWebhookFilter`[], required)

### TopicDefinition
- `topic` (string)
- `name` (string)
- `description` (string)
- `availableFilters` (`WebhookFilterDefinition`[])
- `samplePayload` (`WebhookPayload`)

### WebhookFilterDefinition
- `action` (string)
- `actionDisplayName` (string)
- `description` (string)
- `conditions` (`FilterConditionDefinition`[])

### FilterConditionDefinition
- `field` (string)
- `operator` (`FilterOperator`[])
- `dataType` (string)
- `description` (string)
- `value` (string - example value)

### WebhookPayload
- `accountId` (uuid)
- `url` (string)
- `webhookId` (uuid)
- `sentAt` (ISO 8601)
- `webhookTopic` (`WebhookTopic`)
- `payloadData` (object, optional - actual event data)

### WebhookTest
- `url` (string)
- `webhook` (`Webhook`)
- `samplePayload` (object, optional)

### WebhookLog
- `id` (uuid, readonly)
- `webhookId` (uuid)
- `webhookName` (string)
- `finalStatus` (`WebhookDeliveryStatus`)
- `callHistory` (`WebhookCall`[])
- `createdAt` (ISO 8601, readonly)

### WebhookCall
- `id` (uuid, readonly)
- `timestamp` (ISO 8601)
- `status` (`WebhookDeliveryStatus`)
- `errorMessage` (string, optional)
- `httpStatusCode` (int32, optional)
- `payload` (object, optional)

### ListWebhooksOptions
- `query` (string, optional)
- `page` (number, default 0)
- `size` (number, default 10)
- `active` (boolean, optional)
- `topic` (string, optional)
- `sort` (string, optional - format: field:asc/desc)
- `status` (string, optional)
- `accountId` (uuid, optional)

### ListTopicDefinitionsOptions
- `page` (number, default 0)
- `size` (number, default 10)
- `search` (string, optional)
- `sort` (string, optional)
- `topic` (string, optional)

### ListWebhookLogsOptions
- `topicName` (string, optional)
- `page` (number, default 0)
- `size` (number, default 10)
- `status` (string, optional)
- `startDate` (string, optional - ISO 8601)
- `endDate` (string, optional - ISO 8601)
- `sort` (string, optional)
- `query` (object, required)

### Page
- `number` (int32, default 0)
- `size` (int32, default 0)
- `totalElements` (int64, default 0)
- `totalPages` (int32, default 0)

### WebhookPagedResult
- `content` (`Webhook`[])
- `page` (`Page`)

### TopicDefinitionPagedResult
- `content` (`TopicDefinition`[])
- `number` (int32)
- `size` (int32)
- `totalElements` (int64)
- `totalPages` (int32)

### WebhookLogPagedResult
- `content` (`WebhookLog`[])
- `page` (`Page`)

## Notes
- Webhooks API uses API v2 base URL (`/api/v2`) unlike other v1 endpoints.
- Pagination is page-based (0-indexed); sort format is `field:asc/desc`.
- `errorThreshold` controls retry attempts before email notification; maximum value is 20.
- `integrationId` is required only for 3rd party integrators, optional for direct partners.
- Topics cannot be duplicated on a single webhook; adding an existing topic throws an error.
- Retry requests return HTTP 202 Accepted and are processed asynchronously.
- Delete operations return HTTP 204 No Content.
- Filter operators support comparison, containment, and set membership operations.
- Topic definitions include sample payloads for testing and development reference.
