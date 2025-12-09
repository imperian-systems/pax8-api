import { handleErrorResponse, validatePage, validateSize, validateNonEmptyString } from '../http/api-utils.js';
import {
  AddWebhookTopic,
  CreateWebhook,
  DEFAULT_PAGE_SIZE,
  ListTopicDefinitionsOptions,
  ListWebhookLogsOptions,
  ListWebhooksOptions,
  MAX_PAGE_SIZE,
  MAX_ERROR_THRESHOLD,
  MIN_PAGE_SIZE,
  ReplaceWebhookTopics,
  TopicDefinitionPagedResult,
  UpdateWebhookConfiguration,
  UpdateWebhookStatus,
  UpdateWebhookTopicConfiguration,
  Webhook,
  WebhookLog,
  WebhookLogPagedResult,
  WebhookPagedResult,
  WebhookTest,
  assertTopicDefinitionPagedResult,
  assertWebhook,
  assertWebhookLogPagedResult,
  assertWebhookPagedResult,
  assertWebhookLog,
} from '../models/webhooks';

/**
 * Client interface for webhooks API requests
 */
export interface WebhooksApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Webhooks API namespace for the Pax8Client.
 * Provides methods for managing webhooks, topics, logs, and testing.
 * Uses API v2 base URL (/api/v2) distinct from v1 endpoints.
 */
export class WebhooksApi {
  private readonly baseUrl = '/api/v2';

  constructor(private readonly client: WebhooksApiClient) {}

  /**
   * List webhooks with optional filters and pagination.
   *
   * @param options - Optional filters and pagination parameters
   * @returns Promise resolving to a paginated list of webhooks
   */
  async list(options: ListWebhooksOptions = {}): Promise<WebhookPagedResult> {
    return listWebhooks(this.client, this.baseUrl, options);
  }

  /**
   * Create a new webhook.
   *
   * @param webhook - Webhook creation parameters
   * @returns Promise resolving to the created webhook
   */
  async create(webhook: CreateWebhook): Promise<Webhook> {
    return createWebhook(this.client, this.baseUrl, webhook);
  }

  /**
   * Get a specific webhook by ID.
   *
   * @param webhookId - The unique identifier of the webhook
   * @returns Promise resolving to the webhook details
   */
  async get(webhookId: string): Promise<Webhook> {
    return getWebhook(this.client, this.baseUrl, webhookId);
  }

  /**
   * Update webhook configuration.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param config - Configuration update parameters
   * @returns Promise resolving to the updated webhook
   */
  async updateConfiguration(webhookId: string, config: UpdateWebhookConfiguration): Promise<Webhook> {
    return updateWebhookConfiguration(this.client, this.baseUrl, webhookId, config);
  }

  /**
   * Update webhook status (enable/disable).
   *
   * @param webhookId - The unique identifier of the webhook
   * @param status - Status update parameters
   * @returns Promise resolving to the updated webhook
   */
  async updateStatus(webhookId: string, status: UpdateWebhookStatus): Promise<Webhook> {
    return updateWebhookStatus(this.client, this.baseUrl, webhookId, status);
  }

  /**
   * Delete a webhook.
   *
   * @param webhookId - The unique identifier of the webhook
   * @returns Promise resolving when deletion is complete
   */
  async delete(webhookId: string): Promise<void> {
    return deleteWebhook(this.client, this.baseUrl, webhookId);
  }

  /**
   * Add a topic to a webhook.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param topic - Topic to add with filters
   * @returns Promise resolving to the updated webhook
   */
  async addTopic(webhookId: string, topic: AddWebhookTopic): Promise<Webhook> {
    return addWebhookTopic(this.client, this.baseUrl, webhookId, topic);
  }

  /**
   * Replace all topics for a webhook.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param topics - New topics to replace existing ones
   * @returns Promise resolving to the updated webhook
   */
  async replaceTopics(webhookId: string, topics: ReplaceWebhookTopics): Promise<Webhook> {
    return replaceWebhookTopics(this.client, this.baseUrl, webhookId, topics);
  }

  /**
   * Remove a topic from a webhook.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param topicId - The unique identifier of the topic to remove
   * @returns Promise resolving when removal is complete
   */
  async removeTopic(webhookId: string, topicId: string): Promise<void> {
    return removeWebhookTopic(this.client, this.baseUrl, webhookId, topicId);
  }

  /**
   * Update filters for a webhook topic.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param topicId - The unique identifier of the topic
   * @param config - Filter configuration update
   * @returns Promise resolving to the updated webhook
   */
  async updateTopicConfiguration(
    webhookId: string,
    topicId: string,
    config: UpdateWebhookTopicConfiguration,
  ): Promise<Webhook> {
    return updateWebhookTopicConfiguration(this.client, this.baseUrl, webhookId, topicId, config);
  }

  /**
   * Get available topic definitions with filters and sample payloads.
   *
   * @param options - Optional search and pagination parameters
   * @returns Promise resolving to a paginated list of topic definitions
   */
  async getTopicDefinitions(options: ListTopicDefinitionsOptions = {}): Promise<TopicDefinitionPagedResult> {
    return getTopicDefinitions(this.client, this.baseUrl, options);
  }

  /**
   * Test a webhook topic by sending a sample event.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param topic - The topic name to test
   * @returns Promise resolving to test result with sample payload
   */
  async testTopic(webhookId: string, topic: string): Promise<WebhookTest> {
    return testWebhookTopic(this.client, this.baseUrl, webhookId, topic);
  }

  /**
   * List webhook delivery logs with optional filters.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param options - Optional filters and pagination parameters
   * @returns Promise resolving to a paginated list of webhook logs
   */
  async listLogs(webhookId: string, options: ListWebhookLogsOptions): Promise<WebhookLogPagedResult> {
    return listWebhookLogs(this.client, this.baseUrl, webhookId, options);
  }

  /**
   * Get a specific webhook log with call history.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param logId - The unique identifier of the log
   * @returns Promise resolving to the webhook log details
   */
  async getLog(webhookId: string, logId: string): Promise<WebhookLog> {
    return getWebhookLog(this.client, this.baseUrl, webhookId, logId);
  }

  /**
   * Retry a failed webhook delivery.
   *
   * @param webhookId - The unique identifier of the webhook
   * @param logId - The unique identifier of the log to retry
   * @returns Promise resolving when retry is accepted (202)
   */
  async retryDelivery(webhookId: string, logId: string): Promise<void> {
    return retryWebhookDelivery(this.client, this.baseUrl, webhookId, logId);
  }
}

// Implementation functions

export const listWebhooks = async (
  client: WebhooksApiClient,
  baseUrl: string,
  options: ListWebhooksOptions = {},
): Promise<WebhookPagedResult> => {
  const page = validatePage(options.page);
  const size = validateSize(options.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (options.query !== undefined) params.append('query', options.query);
  if (options.active !== undefined) params.append('active', options.active.toString());
  if (options.topic !== undefined) params.append('topic', options.topic);
  if (options.sort !== undefined) params.append('sort', options.sort);
  if (options.status !== undefined) params.append('status', options.status);
  if (options.accountId !== undefined) params.append('accountId', options.accountId);

  const response = await client.request(`${baseUrl}/webhooks?${params.toString()}`);

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhookPagedResult(data);
  return data;
};

export const createWebhook = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhook: CreateWebhook,
): Promise<Webhook> => {
  // Validate required fields
  validateNonEmptyString(webhook.displayName, 'displayName');

  // Validate errorThreshold if provided
  if (webhook.errorThreshold !== undefined) {
    if (
      typeof webhook.errorThreshold !== 'number' ||
      !Number.isInteger(webhook.errorThreshold) ||
      webhook.errorThreshold < 0 ||
      webhook.errorThreshold > MAX_ERROR_THRESHOLD
    ) {
      throw new TypeError(`errorThreshold must be an integer between 0 and ${MAX_ERROR_THRESHOLD}`);
    }
  }

  const response = await client.request(`${baseUrl}/webhooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhook),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhook(data);
  return data;
};

export const getWebhook = async (client: WebhooksApiClient, baseUrl: string, webhookId: string): Promise<Webhook> => {
  validateNonEmptyString(webhookId, 'webhookId');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}`);

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhook(data);
  return data;
};

export const updateWebhookConfiguration = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  config: UpdateWebhookConfiguration,
): Promise<Webhook> => {
  validateNonEmptyString(webhookId, 'webhookId');

  // Validate errorThreshold if provided
  if (config.errorThreshold !== undefined) {
    if (
      typeof config.errorThreshold !== 'number' ||
      !Number.isInteger(config.errorThreshold) ||
      config.errorThreshold < 0 ||
      config.errorThreshold > MAX_ERROR_THRESHOLD
    ) {
      throw new TypeError(`errorThreshold must be an integer between 0 and ${MAX_ERROR_THRESHOLD}`);
    }
  }

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/configuration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhook(data);
  return data;
};

export const updateWebhookStatus = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  status: UpdateWebhookStatus,
): Promise<Webhook> => {
  validateNonEmptyString(webhookId, 'webhookId');

  if (typeof status.active !== 'boolean') {
    throw new TypeError('active must be a boolean');
  }

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhook(data);
  return data;
};

export const deleteWebhook = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
): Promise<void> => {
  validateNonEmptyString(webhookId, 'webhookId');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }
};

export const addWebhookTopic = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  topic: AddWebhookTopic,
): Promise<Webhook> => {
  validateNonEmptyString(webhookId, 'webhookId');
  validateNonEmptyString(topic.topic, 'topic.topic');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(topic),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhook(data);
  return data;
};

export const replaceWebhookTopics = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  topics: ReplaceWebhookTopics,
): Promise<Webhook> => {
  validateNonEmptyString(webhookId, 'webhookId');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/topics`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(topics),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhook(data);
  return data;
};

export const removeWebhookTopic = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  topicId: string,
): Promise<void> => {
  validateNonEmptyString(webhookId, 'webhookId');
  validateNonEmptyString(topicId, 'topicId');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/topics/${topicId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }
};

export const updateWebhookTopicConfiguration = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  topicId: string,
  config: UpdateWebhookTopicConfiguration,
): Promise<Webhook> => {
  validateNonEmptyString(webhookId, 'webhookId');
  validateNonEmptyString(topicId, 'topicId');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/topics/${topicId}/configuration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhook(data);
  return data;
};

export const getTopicDefinitions = async (
  client: WebhooksApiClient,
  baseUrl: string,
  options: ListTopicDefinitionsOptions = {},
): Promise<TopicDefinitionPagedResult> => {
  const page = validatePage(options.page);
  const size = validateSize(options.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (options.search !== undefined) params.append('search', options.search);
  if (options.sort !== undefined) params.append('sort', options.sort);
  if (options.topic !== undefined) params.append('topic', options.topic);

  const response = await client.request(`${baseUrl}/webhooks/topic-definitions?${params.toString()}`);

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertTopicDefinitionPagedResult(data);
  return data;
};

export const testWebhookTopic = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  topic: string,
): Promise<WebhookTest> => {
  validateNonEmptyString(webhookId, 'webhookId');
  validateNonEmptyString(topic, 'topic');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/topics/${topic}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as WebhookTest;
};

export const listWebhookLogs = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  options: ListWebhookLogsOptions,
): Promise<WebhookLogPagedResult> => {
  validateNonEmptyString(webhookId, 'webhookId');

  const page = validatePage(options.page);
  const size = validateSize(options.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    query: JSON.stringify(options.query || {}),
  });

  if (options.topicName !== undefined) params.append('topicName', options.topicName);
  if (options.status !== undefined) params.append('status', options.status);
  if (options.startDate !== undefined) params.append('startDate', options.startDate);
  if (options.endDate !== undefined) params.append('endDate', options.endDate);
  if (options.sort !== undefined) params.append('sort', options.sort);

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/logs?${params.toString()}`);

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhookLogPagedResult(data);
  return data;
};

export const getWebhookLog = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  logId: string,
): Promise<WebhookLog> => {
  validateNonEmptyString(webhookId, 'webhookId');
  validateNonEmptyString(logId, 'logId');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/logs/${logId}`);

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertWebhookLog(data);
  return data;
};

export const retryWebhookDelivery = async (
  client: WebhooksApiClient,
  baseUrl: string,
  webhookId: string,
  logId: string,
): Promise<void> => {
  validateNonEmptyString(webhookId, 'webhookId');
  validateNonEmptyString(logId, 'logId');

  const response = await client.request(`${baseUrl}/webhooks/${webhookId}/logs/${logId}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }
};
