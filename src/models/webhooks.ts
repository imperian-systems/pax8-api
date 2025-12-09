/**
 * Webhooks API models and types
 * Based on Pax8 Webhooks API v2 specification
 */

// Constants
export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;
export const MAX_ERROR_THRESHOLD = 20;

// Filter operators
export const FILTER_OPERATORS = ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN', 'CONTAINS'] as const;
export type FilterOperator = (typeof FILTER_OPERATORS)[number];

// Webhook delivery statuses
export const WEBHOOK_DELIVERY_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'RETRYING'] as const;
export type WebhookDeliveryStatus = (typeof WEBHOOK_DELIVERY_STATUSES)[number];

// Filter condition
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string[];
}

// Webhook filter
export interface WebhookFilter {
  action: string;
  conditions: FilterCondition[];
}

// Webhook topic
export interface WebhookTopic {
  id: string;
  topic: string;
  filters: WebhookFilter[];
}

// Main webhook entity
export interface Webhook {
  id: string;
  accountId: string;
  displayName: string;
  url?: string;
  authorization?: string;
  active: boolean;
  contactEmail?: string;
  errorThreshold: number;
  integrationId?: string;
  webhookTopics: WebhookTopic[];
  lastDeliveryStatus?: WebhookDeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

// Create webhook request
export interface CreateWebhook {
  displayName: string;
  url?: string;
  authorization?: string;
  active?: boolean;
  contactEmail?: string;
  errorThreshold?: number;
  integrationId?: string;
  webhookTopics?: AddWebhookTopic[];
}

// Update webhook configuration
export interface UpdateWebhookConfiguration {
  displayName?: string;
  url?: string;
  authorization?: string;
  contactEmail?: string;
  errorThreshold?: number;
}

// Update webhook status
export interface UpdateWebhookStatus {
  active: boolean;
}

// Update filter condition (for mutations)
export interface UpdateFilterCondition {
  field: string;
  operator: FilterOperator;
  value: string[];
}

// Update webhook filter (for mutations)
export interface UpdateWebhookFilter {
  action: string;
  conditions: UpdateFilterCondition[];
}

// Add webhook topic
export interface AddWebhookTopic {
  topic: string;
  filters: UpdateWebhookFilter[];
}

// Replace webhook topics
export interface ReplaceWebhookTopics {
  webhookTopics: AddWebhookTopic[];
}

// Update webhook topic configuration
export interface UpdateWebhookTopicConfiguration {
  filters: UpdateWebhookFilter[];
}

// Filter condition definition
export interface FilterConditionDefinition {
  field: string;
  operator: FilterOperator[];
  dataType: string;
  description: string;
  value: string;
}

// Webhook filter definition
export interface WebhookFilterDefinition {
  action: string;
  actionDisplayName: string;
  description: string;
  conditions: FilterConditionDefinition[];
}

// Webhook payload
export interface WebhookPayload {
  accountId: string;
  url: string;
  webhookId: string;
  sentAt: string;
  webhookTopic: WebhookTopic;
  payloadData?: Record<string, unknown>;
}

// Topic definition
export interface TopicDefinition {
  topic: string;
  name: string;
  description: string;
  availableFilters: WebhookFilterDefinition[];
  samplePayload: WebhookPayload;
}

// Webhook test result
export interface WebhookTest {
  url: string;
  webhook: Webhook;
  samplePayload?: Record<string, unknown>;
}

// Webhook call (log entry)
export interface WebhookCall {
  id: string;
  timestamp: string;
  status: WebhookDeliveryStatus;
  errorMessage?: string;
  httpStatusCode?: number;
  payload?: Record<string, unknown>;
}

// Webhook log
export interface WebhookLog {
  id: string;
  webhookId: string;
  webhookName: string;
  finalStatus: WebhookDeliveryStatus;
  callHistory: WebhookCall[];
  createdAt: string;
}

// Page metadata
export interface Page {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Paged results
export interface WebhookPagedResult {
  content: Webhook[];
  page: Page;
}

export interface TopicDefinitionPagedResult {
  content: TopicDefinition[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface WebhookLogPagedResult {
  content: WebhookLog[];
  page: Page;
}

// List options
export interface ListWebhooksOptions {
  query?: string;
  page?: number;
  size?: number;
  active?: boolean;
  topic?: string;
  sort?: string;
  status?: string;
  accountId?: string;
}

export interface ListTopicDefinitionsOptions {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  topic?: string;
}

export interface ListWebhookLogsOptions {
  topicName?: string;
  page?: number;
  size?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  query: Record<string, unknown>;
}

// Type guards
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
const isOptionalString = (value: unknown): value is string | undefined => value === undefined || isString(value);

export const isFilterOperator = (value: unknown): value is FilterOperator =>
  isString(value) && (FILTER_OPERATORS as readonly string[]).includes(value);

export const isWebhookDeliveryStatus = (value: unknown): value is WebhookDeliveryStatus =>
  isString(value) && (WEBHOOK_DELIVERY_STATUSES as readonly string[]).includes(value);

export const isFilterCondition = (value: unknown): value is FilterCondition => {
  if (!isObject(value)) return false;
  const { field, operator, value: condValue } = value;
  return isString(field) && isFilterOperator(operator) && isArray(condValue) && condValue.every(isString);
};

export const isWebhookFilter = (value: unknown): value is WebhookFilter => {
  if (!isObject(value)) return false;
  const { action, conditions } = value;
  return isString(action) && isArray(conditions) && conditions.every(isFilterCondition);
};

export const isWebhookTopic = (value: unknown): value is WebhookTopic => {
  if (!isObject(value)) return false;
  const { id, topic, filters } = value;
  return isString(id) && isString(topic) && isArray(filters) && filters.every(isWebhookFilter);
};

export const isWebhook = (value: unknown): value is Webhook => {
  if (!isObject(value)) return false;
  const {
    id,
    accountId,
    displayName,
    url,
    authorization,
    active,
    contactEmail,
    errorThreshold,
    integrationId,
    webhookTopics,
    lastDeliveryStatus,
    createdAt,
    updatedAt,
  } = value;

  return (
    isString(id) &&
    isString(accountId) &&
    isString(displayName) &&
    isOptionalString(url) &&
    isOptionalString(authorization) &&
    isBoolean(active) &&
    isOptionalString(contactEmail) &&
    isNumber(errorThreshold) &&
    isOptionalString(integrationId) &&
    isArray(webhookTopics) &&
    webhookTopics.every(isWebhookTopic) &&
    (lastDeliveryStatus === undefined || isWebhookDeliveryStatus(lastDeliveryStatus)) &&
    isString(createdAt) &&
    isString(updatedAt)
  );
};

export const isPage = (value: unknown): value is Page => {
  if (!isObject(value)) return false;
  const { number, size, totalElements, totalPages } = value;
  return isInteger(number) && isInteger(size) && isInteger(totalElements) && isInteger(totalPages);
};

export const isWebhookPagedResult = (value: unknown): value is WebhookPagedResult => {
  if (!isObject(value)) return false;
  const { content, page } = value;
  return isArray(content) && content.every(isWebhook) && isPage(page);
};

export const isWebhookLog = (value: unknown): value is WebhookLog => {
  if (!isObject(value)) return false;
  const { id, webhookId, webhookName, finalStatus, callHistory, createdAt } = value;
  return (
    isString(id) &&
    isString(webhookId) &&
    isString(webhookName) &&
    isWebhookDeliveryStatus(finalStatus) &&
    isArray(callHistory) &&
    isString(createdAt)
  );
};

export const isWebhookLogPagedResult = (value: unknown): value is WebhookLogPagedResult => {
  if (!isObject(value)) return false;
  const { content, page } = value;
  return isArray(content) && content.every(isWebhookLog) && isPage(page);
};

export const isTopicDefinition = (value: unknown): value is TopicDefinition => {
  if (!isObject(value)) return false;
  const { topic, name, description, availableFilters, samplePayload } = value;
  return (
    isString(topic) &&
    isString(name) &&
    isString(description) &&
    isArray(availableFilters) &&
    isObject(samplePayload)
  );
};

export const isTopicDefinitionPagedResult = (value: unknown): value is TopicDefinitionPagedResult => {
  if (!isObject(value)) return false;
  const { content, number, size, totalElements, totalPages } = value;
  return (
    isArray(content) &&
    content.every(isTopicDefinition) &&
    isInteger(number) &&
    isInteger(size) &&
    isInteger(totalElements) &&
    isInteger(totalPages)
  );
};

// Assert functions for runtime validation
export function assertWebhook(value: unknown): asserts value is Webhook {
  if (!isWebhook(value)) {
    throw new TypeError('Invalid webhook object');
  }
}

export function assertWebhookPagedResult(value: unknown): asserts value is WebhookPagedResult {
  if (!isWebhookPagedResult(value)) {
    throw new TypeError('Invalid webhook paged result');
  }
}

export function assertWebhookLog(value: unknown): asserts value is WebhookLog {
  if (!isWebhookLog(value)) {
    throw new TypeError('Invalid webhook log object');
  }
}

export function assertWebhookLogPagedResult(value: unknown): asserts value is WebhookLogPagedResult {
  if (!isWebhookLogPagedResult(value)) {
    throw new TypeError('Invalid webhook log paged result');
  }
}

export function assertTopicDefinition(value: unknown): asserts value is TopicDefinition {
  if (!isTopicDefinition(value)) {
    throw new TypeError('Invalid topic definition object');
  }
}

export function assertTopicDefinitionPagedResult(value: unknown): asserts value is TopicDefinitionPagedResult {
  if (!isTopicDefinitionPagedResult(value)) {
    throw new TypeError('Invalid topic definition paged result');
  }
}
