import { handleErrorResponse, validatePage, validateSize, validateNonEmptyString } from '../http/api-utils.js';
import type {
  Subscription,
  SubscriptionListResponse,
  ListSubscriptionsOptions,
  UpdateSubscriptionRequest,
  CancelOptions,
  SubscriptionHistory,
} from '../models/subscriptions.js';
import { MIN_PAGE_SIZE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../models/subscriptions.js';

export interface SubscriptionsApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Subscriptions API namespace for the Pax8Client.
 * Provides methods for listing, retrieving, updating, canceling subscriptions and viewing history.
 *
 * References:
 * - https://docs.pax8.com/api/v1#tag/Subscriptions
 */
export class SubscriptionsApi {
  constructor(private readonly client: SubscriptionsApiClient) {}

  /**
   * List subscriptions with page-based pagination and optional filters.
   *
   * Supports filtering by companyId, productId, and status. Results can be
   * sorted using server-supported field names.
   *
   * OpenAPI: GET /subscriptions
   * @see https://docs.pax8.com/api/v1#tag/Subscriptions/operation/listSubscriptions
   *
   * @param options - Optional filtering, pagination, and sorting parameters
   * @returns Promise resolving to a paginated list of subscriptions
   *
   * @example
   * ```typescript
   * // List all subscriptions with default pagination (page 0, size 10)
   * const result = await client.subscriptions.list();
   *
   * // Filter by company and status with custom page size
   * const activeSubscriptions = await client.subscriptions.list({
   *   companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
   *   status: 'Active',
   *   size: 25
   * });
   *
   * // Paginate with sorting
   * const page2 = await client.subscriptions.list({
   *   page: 2,
   *   size: 50,
   *   sort: 'productId,asc'
   * });
   * ```
   */
  async list(options?: ListSubscriptionsOptions): Promise<SubscriptionListResponse> {
    return listSubscriptions(this.client, options);
  }

  /**
   * Get detailed information about a specific subscription by ID.
   *
   * OpenAPI: GET /subscriptions/{subscriptionId}
   * @see https://docs.pax8.com/api/v1#tag/Subscriptions/operation/getSubscription
   *
   * @param subscriptionId - The unique identifier of the subscription (UUID format)
   * @returns Promise resolving to the subscription details
   * @throws {Pax8Error} When subscription is not found (404)
   *
   * @example
   * ```typescript
   * const subscription = await client.subscriptions.get('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
   * console.log(subscription.quantity);
   * console.log(subscription.billingTerm);
   * ```
   */
  async get(subscriptionId: string): Promise<Subscription> {
    return getSubscription(this.client, subscriptionId);
  }

  /**
   * Update a subscription's quantity.
   *
   * Only quantity modifications are supported. Other changes require
   * cancellation and reordering.
   *
   * OpenAPI: PUT /subscriptions/{subscriptionId}
   * @see https://docs.pax8.com/api/v1#tag/Subscriptions/operation/updateSubscription
   *
   * @param subscriptionId - The unique identifier of the subscription (UUID format)
   * @param request - Update request containing the new quantity
   * @returns Promise resolving to the updated subscription
   * @throws {Pax8Error} When subscription is not found (404) or validation fails (422)
   *
   * @example
   * ```typescript
   * const updated = await client.subscriptions.update('subscription-id', {
   *   quantity: 15
   * });
   * console.log(updated.quantity); // 15
   * ```
   */
  async update(subscriptionId: string, request: UpdateSubscriptionRequest): Promise<Subscription> {
    return updateSubscription(this.client, subscriptionId, request);
  }

  /**
   * Cancel a subscription immediately or schedule cancellation for a future billing date.
   *
   * Returns no content (HTTP 204) on success. Pass billingDate in CancelOptions
   * to schedule cancellation for a specific future date.
   *
   * OpenAPI: POST /subscriptions/{subscriptionId}/cancel
   * @see https://docs.pax8.com/api/v1#tag/Subscriptions/operation/cancelSubscription
   *
   * @param subscriptionId - The unique identifier of the subscription (UUID format)
   * @param options - Optional cancellation options including billingDate
   * @returns Promise resolving when cancellation is complete (void)
   * @throws {Pax8Error} When subscription is not found (404) or validation fails (422)
   *
   * @example
   * ```typescript
   * // Immediate cancellation
   * await client.subscriptions.cancel('subscription-id');
   *
   * // Schedule cancellation on a billing date
   * await client.subscriptions.cancel('subscription-id', {
   *   billingDate: '2025-12-31'
   * });
   * ```
   */
  async cancel(subscriptionId: string, options?: CancelOptions): Promise<void> {
    return cancelSubscription(this.client, subscriptionId, options);
  }

  /**
   * Retrieve the change history for a subscription.
   *
   * Returns an array of history entries ordered by date, including actions
   * such as quantity updates, status changes, and creation events.
   *
   * OpenAPI: GET /subscriptions/{subscriptionId}/history
   * @see https://docs.pax8.com/api/v1#tag/Subscriptions/operation/getSubscriptionHistory
   *
   * @param subscriptionId - The unique identifier of the subscription (UUID format)
   * @returns Promise resolving to an array of subscription history entries
   * @throws {Pax8Error} When subscription is not found (404)
   *
   * @example
   * ```typescript
   * const history = await client.subscriptions.getHistory('subscription-id');
   * console.log(history[0]?.action); // e.g., 'QuantityUpdate'
   * console.log(history[0]?.date);
   * console.log(history[0]?.previousQuantity);
   * ```
   */
  async getHistory(subscriptionId: string): Promise<SubscriptionHistory[]> {
    return getSubscriptionHistory(this.client, subscriptionId);
  }
}

/**
 * List subscriptions with page-based pagination and optional filters.
 *
 * @param client - API client with request method
 * @param options - Optional filtering, pagination, and sorting parameters
 * @returns Promise resolving to a paginated list of subscriptions
 */
export const listSubscriptions = async (
  client: SubscriptionsApiClient,
  options?: ListSubscriptionsOptions,
): Promise<SubscriptionListResponse> => {
  // Validate and normalize pagination parameters
  const page = validatePage(options?.page);
  const size = validateSize(options?.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  if (options?.companyId) {
    searchParams.set('companyId', options.companyId);
  }

  if (options?.productId) {
    searchParams.set('productId', options.productId);
  }

  if (options?.status) {
    searchParams.set('status', options.status);
  }

  if (options?.sort) {
    searchParams.set('sort', options.sort);
  }

  const path = `/subscriptions?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as SubscriptionListResponse;
};

/**
 * Get detailed information about a specific subscription by ID.
 *
 * @param client - API client with request method
 * @param subscriptionId - The unique identifier of the subscription
 * @returns Promise resolving to the subscription details
 */
export const getSubscription = async (client: SubscriptionsApiClient, subscriptionId: string): Promise<Subscription> => {
  validateNonEmptyString(subscriptionId, 'subscriptionId');

  const path = `/subscriptions/${subscriptionId}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as Subscription;
};

/**
 * Update a subscription's quantity.
 *
 * @param client - API client with request method
 * @param subscriptionId - The unique identifier of the subscription
 * @param request - Update request containing the new quantity
 * @returns Promise resolving to the updated subscription
 */
export const updateSubscription = async (
  client: SubscriptionsApiClient,
  subscriptionId: string,
  request: UpdateSubscriptionRequest,
): Promise<Subscription> => {
  validateNonEmptyString(subscriptionId, 'subscriptionId');

  if (typeof request.quantity !== 'number' || request.quantity <= 0) {
    throw new TypeError('quantity must be a positive number');
  }

  const path = `/subscriptions/${subscriptionId}`;
  const response = await client.request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as Subscription;
};

/**
 * Cancel a subscription immediately or schedule cancellation for a future billing date.
 *
 * @param client - API client with request method
 * @param subscriptionId - The unique identifier of the subscription
 * @param options - Optional cancellation options including billingDate
 * @returns Promise resolving when cancellation is complete
 */
export const cancelSubscription = async (
  client: SubscriptionsApiClient,
  subscriptionId: string,
  options?: CancelOptions,
): Promise<void> => {
  validateNonEmptyString(subscriptionId, 'subscriptionId');

  const path = `/subscriptions/${subscriptionId}/cancel`;
  const response = await client.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: options ? JSON.stringify(options) : undefined,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  // 204 No Content - no body to parse
};

/**
 * Retrieve the change history for a subscription.
 *
 * @param client - API client with request method
 * @param subscriptionId - The unique identifier of the subscription
 * @returns Promise resolving to an array of subscription history entries
 */
export const getSubscriptionHistory = async (
  client: SubscriptionsApiClient,
  subscriptionId: string,
): Promise<SubscriptionHistory[]> => {
  validateNonEmptyString(subscriptionId, 'subscriptionId');

  const path = `/subscriptions/${subscriptionId}/history`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as SubscriptionHistory[];
};
