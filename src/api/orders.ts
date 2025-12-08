import type {
  Order,
  OrderListResponse,
  ListOrdersOptions,
  CreateOrderRequest,
} from '../models/orders.js';

export interface OrdersApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Orders API namespace for the Pax8Client.
 * Provides methods for listing orders, retrieving order details, and creating orders.
 */
export class OrdersApi {
  constructor(private readonly client: OrdersApiClient) {}

  /**
   * List orders with page-based pagination.
   *
   * Supports filtering by companyId. Results are ordered by creation date
   * (most recent first) per API default behavior.
   *
   * @param options - Optional filtering and pagination parameters
   * @returns Promise resolving to a paginated list of orders
   *
   * @example
   * ```typescript
   * // List all orders with default pagination (page 0, size 10)
   * const result = await client.orders.list();
   *
   * // Filter by company with custom page size
   * const companyOrders = await client.orders.list({
   *   companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
   *   size: 25
   * });
   *
   * // Paginate through results
   * const page2 = await client.orders.list({
   *   page: 2,
   *   size: 50
   * });
   * ```
   */
  async list(options?: ListOrdersOptions): Promise<OrderListResponse> {
    return listOrders(this.client, options);
  }

  /**
   * Get detailed information about a specific order by ID.
   *
   * @param orderId - The unique identifier of the order (UUID format)
   * @returns Promise resolving to the order details
   *
   * @example
   * ```typescript
   * const order = await client.orders.get('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
   * console.log(order.companyId);
   * console.log(order.lineItems[0]?.subscriptionId); // may be null until provisioned
   * ```
   */
  async get(orderId: string): Promise<Order> {
    return getOrder(this.client, orderId);
  }

  /**
   * Create a new order for a company.
   *
   * Each line item requires productId, quantity, billingTerm, and lineItemNumber.
   * Include commitmentTermId when the product requires a commitment.
   * Optionally pass provisioning details as key-value pairs.
   *
   * Use the isMock option to validate the order without actually creating it.
   *
   * @param request - Order creation request with company and line items
   * @param options - Optional parameters including isMock for validation-only
   * @returns Promise resolving to the created order
   *
   * @example
   * ```typescript
   * // Create an order with billing term and provisioning details
   * const created = await client.orders.create({
   *   companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
   *   orderedBy: 'Pax8 Partner',
   *   orderedByUserEmail: 'agent@example.com',
   *   lineItems: [
   *     {
   *       productId: 'prod-id',
   *       quantity: 5,
   *       billingTerm: 'Monthly',
   *       lineItemNumber: 1,
   *       provisioningDetails: [
   *         { key: 'tenantDomain', values: ['contoso.onmicrosoft.com'] }
   *       ]
   *     }
   *   ]
   * });
   *
   * // Validate order without creating (mock mode)
   * await client.orders.create(
   *   {
   *     companyId: 'company-id',
   *     lineItems: [
   *       { productId: 'prod-id', quantity: 1, billingTerm: 'Annual', lineItemNumber: 1 }
   *     ]
   *   },
   *   { isMock: true }
   * );
   * ```
   */
  async create(request: CreateOrderRequest, options?: { isMock?: boolean }): Promise<Order> {
    return createOrder(this.client, request, options);
  }
}

const handleErrorResponse = async (response: Response): Promise<never> => {
  const contentType = response.headers.get('content-type');
  let errorData: unknown;

  if (contentType?.includes('application/json')) {
    try {
      errorData = await response.json();
    } catch {
      errorData = { code: 'unknown_error', message: response.statusText || 'Unknown error' };
    }
  } else {
    errorData = { code: 'unknown_error', message: response.statusText || 'Unknown error' };
  }

  const errorMessage =
    typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string'
      ? errorData.message
      : response.statusText || 'Unknown error';

  throw new Error(errorMessage);
};

/**
 * List orders with page-based pagination.
 *
 * @param client - API client with request method
 * @param options - Optional filtering and pagination parameters
 * @returns Promise resolving to a paginated list of orders
 */
export const listOrders = async (client: OrdersApiClient, options?: ListOrdersOptions): Promise<OrderListResponse> => {
  const MIN_PAGE_SIZE = 1;
  const DEFAULT_PAGE_SIZE = 10;
  const MAX_PAGE_SIZE = 200;

  // Validate and normalize page parameter
  let page = 0;
  if (options?.page !== undefined) {
    if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 0) {
      throw new TypeError('page must be a non-negative integer');
    }
    page = options.page;
  }

  // Validate and normalize size parameter
  let size = DEFAULT_PAGE_SIZE;
  if (options?.size !== undefined) {
    if (typeof options.size !== 'number' || !Number.isInteger(options.size)) {
      throw new TypeError('size must be an integer');
    }
    if (options.size < MIN_PAGE_SIZE || options.size > MAX_PAGE_SIZE) {
      throw new TypeError(`size must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`);
    }
    size = options.size;
  }

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  if (options?.companyId) {
    searchParams.set('companyId', options.companyId);
  }

  const path = `/orders?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as OrderListResponse;
};

/**
 * Get detailed information about a specific order by ID.
 *
 * @param client - API client with request method
 * @param orderId - The unique identifier of the order
 * @returns Promise resolving to the order details
 */
export const getOrder = async (client: OrdersApiClient, orderId: string): Promise<Order> => {
  if (typeof orderId !== 'string' || orderId.trim().length === 0) {
    throw new TypeError('orderId must be a non-empty string');
  }

  const path = `/orders/${orderId}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as Order;
};

/**
 * Create a new order for a company.
 *
 * @param client - API client with request method
 * @param request - Order creation request with company and line items
 * @param options - Optional parameters including isMock for validation-only
 * @returns Promise resolving to the created order
 */
export const createOrder = async (
  client: OrdersApiClient,
  request: CreateOrderRequest,
  options?: { isMock?: boolean },
): Promise<Order> => {
  // Validate required fields
  if (!request.companyId || typeof request.companyId !== 'string' || request.companyId.trim().length === 0) {
    throw new TypeError('companyId is required and must be a non-empty string');
  }

  if (!Array.isArray(request.lineItems) || request.lineItems.length === 0) {
    throw new TypeError('lineItems is required and must be a non-empty array');
  }

  // Validate each line item
  for (const item of request.lineItems) {
    if (!item.productId || typeof item.productId !== 'string') {
      throw new TypeError('productId is required for each line item');
    }

    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new TypeError('quantity must be a positive number for each line item');
    }

    if (!item.billingTerm || typeof item.billingTerm !== 'string') {
      throw new TypeError('billingTerm is required for each line item');
    }

    if (typeof item.lineItemNumber !== 'number' || item.lineItemNumber < 1) {
      throw new TypeError('lineItemNumber is required and must be a positive number for each line item');
    }
  }

  // Build path with optional query parameters
  let path = '/orders';
  if (options?.isMock) {
    path += '?isMock=true';
  }

  const response = await client.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as Order;
};
