import { handleErrorResponse, validateLimit, validateV2Page, validateNonEmptyString } from '../http/api-utils.js';
import {
  Quote,
  QuoteListResponse,
  CreateQuotePayload,
  UpdateQuotePayload,
  ListQuotesOptions,
  AddLineItemPayload,
  UpdateLineItemPayload,
  BulkDeleteLineItemsPayload,
  Section,
  CreateSectionPayload,
  UpdateSectionsPayload,
  AccessListEntry,
  AddAccessListPayload,
  DEFAULT_LIMIT,
  MIN_LIMIT,
  MAX_LIMIT,
  assertQuote,
  assertQuoteListResponse,
} from '../models/quotes.js';

export interface QuotesApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Quotes API namespace for the Pax8Client.
 * Provides methods for managing quotes, line items, sections, and access lists.
 */
export class QuotesApi {
  private readonly client: QuotesApiClient;

  /**
   * Create a new QuotesApi instance.
   *
   * @param client - The API client instance with request method
   */
  constructor(client: QuotesApiClient) {
    this.client = client;
  }

  /**
   * Create a new quote for a client.
   *
   * @param payload - The quote creation payload
   * @returns Promise resolving to the created Quote
   * @throws {TypeError} If clientId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const quote = await pax8Client.quotes.create({
   *   clientId: 'company-123',
   *   quoteRequestId: 'request-456'
   * });
   * console.log(`Created quote ${quote.id}`);
   * ```
   */
  async create(payload: CreateQuotePayload): Promise<Quote> {
    validateNonEmptyString(payload.clientId, 'clientId');

    const response = await this.client.request('/v2/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    assertQuote(data);
    return data;
  }

  /**
   * List quotes with optional filtering and pagination.
   *
   * @param options - Optional filtering and pagination parameters
   * @returns Promise resolving to QuoteListResponse with quotes and pagination info
   * @throws {TypeError} If pagination parameters are invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const response = await pax8Client.quotes.list({
   *   status: 'draft',
   *   limit: 20,
   *   page: 1
   * });
   * console.log(`Found ${response.content.length} quotes`);
   * ```
   */
  async list(options?: ListQuotesOptions): Promise<QuoteListResponse> {
    const params = new URLSearchParams();

    if (options) {
      const limit = validateLimit(options.limit, DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT);
      const page = validateV2Page(options.page);

      params.set('limit', String(limit));
      params.set('page', String(page));

      if (options.sort) params.set('sort', options.sort);
      if (options.search) params.set('search', options.search);
      if (options.status) params.set('status', options.status);
      if (options.account) params.set('account', options.account);
    } else {
      params.set('limit', String(DEFAULT_LIMIT));
      params.set('page', '1');
    }

    const response = await this.client.request(`/v2/quotes?${params.toString()}`);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    assertQuoteListResponse(data);
    return data;
  }

  /**
   * Get a specific quote by ID.
   *
   * @param quoteId - The quote ID
   * @returns Promise resolving to the Quote
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const quote = await pax8Client.quotes.get('quote-123');
   * console.log(`Quote status: ${quote.status}`);
   * ```
   */
  async get(quoteId: string): Promise<Quote> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}`);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    assertQuote(data);
    return data;
  }

  /**
   * Update a quote's properties.
   *
   * @param quoteId - The quote ID
   * @param payload - The update payload
   * @returns Promise resolving to the updated Quote
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const updated = await pax8Client.quotes.update('quote-123', {
   *   status: 'sent',
   *   introMessage: 'Updated message'
   * });
   * ```
   */
  async update(quoteId: string, payload: UpdateQuotePayload): Promise<Quote> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    assertQuote(data);
    return data;
  }

  /**
   * Delete a quote.
   *
   * @param quoteId - The quote ID
   * @returns Promise resolving when the quote is deleted
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * await pax8Client.quotes.delete('quote-123');
   * console.log('Quote deleted');
   * ```
   */
  async delete(quoteId: string): Promise<void> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }
  }

  /**
   * Add line items to a quote.
   * Supports Standard, Custom, and UsageBased line item types via discriminated union.
   *
   * @param quoteId - The quote ID
   * @param lineItems - Array of line items to add (with discriminated type field)
   * @returns Promise resolving to the updated Quote with recalculated totals
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const updated = await pax8Client.quotes.addLineItems('quote-123', [
   *   {
   *     type: 'Standard',
   *     productId: 'prod-456',
   *     billingTerm: 'Monthly',
   *     quantity: 5
   *   }
   * ]);
   * ```
   */
  async addLineItems(quoteId: string, lineItems: AddLineItemPayload[]): Promise<Quote> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItems }),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    assertQuote(data);
    return data;
  }

  /**
   * Update existing line items in a quote.
   *
   * @param quoteId - The quote ID
   * @param lineItems - Array of line item updates
   * @returns Promise resolving to the updated Quote with recalculated totals
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const updated = await pax8Client.quotes.updateLineItems('quote-123', [
   *   {
   *     id: 'line-item-789',
   *     quantity: 10
   *   }
   * ]);
   * ```
   */
  async updateLineItems(quoteId: string, lineItems: UpdateLineItemPayload[]): Promise<Quote> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/line-items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItems }),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    assertQuote(data);
    return data;
  }

  /**
   * Delete a single line item from a quote.
   *
   * @param quoteId - The quote ID
   * @param lineItemId - The line item ID to delete
   * @returns Promise resolving when the line item is deleted
   * @throws {TypeError} If quoteId or lineItemId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * await pax8Client.quotes.deleteLineItem('quote-123', 'line-item-789');
   * console.log('Line item deleted');
   * ```
   */
  async deleteLineItem(quoteId: string, lineItemId: string): Promise<void> {
    validateNonEmptyString(quoteId, 'quoteId');
    validateNonEmptyString(lineItemId, 'lineItemId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/line-items/${lineItemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }
  }

  /**
   * Bulk delete multiple line items from a quote.
   *
   * @param quoteId - The quote ID
   * @param payload - Array of line item IDs to delete
   * @returns Promise resolving when the line items are deleted
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * await pax8Client.quotes.bulkDeleteLineItems('quote-123', {
   *   lineItemIds: ['line-item-789', 'line-item-790']
   * });
   * console.log('Line items deleted');
   * ```
   */
  async bulkDeleteLineItems(quoteId: string, payload: BulkDeleteLineItemsPayload): Promise<void> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/line-items/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }
  }

  /**
   * Get sections for a quote.
   *
   * @param quoteId - The quote ID
   * @returns Promise resolving to array of sections
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const sections = await pax8Client.quotes.getSections('quote-123');
   * console.log(`Found ${sections.length} sections`);
   * ```
   */
  async getSections(quoteId: string): Promise<Section[]> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/sections`);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError('Expected array of sections');
    }
    return data as Section[];
  }

  /**
   * Create a new section in a quote.
   *
   * @param quoteId - The quote ID
   * @param payload - Section creation payload
   * @returns Promise resolving to array of all sections (including the new one)
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const sections = await pax8Client.quotes.createSection('quote-123', {
   *   name: 'Microsoft Products'
   * });
   * ```
   */
  async createSection(quoteId: string, payload: CreateSectionPayload): Promise<Section[]> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError('Expected array of sections');
    }
    return data as Section[];
  }

  /**
   * Update sections in a quote (batch operation).
   *
   * @param quoteId - The quote ID
   * @param payload - Sections update payload
   * @returns Promise resolving to array of all updated sections
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const sections = await pax8Client.quotes.updateSections('quote-123', {
   *   sections: [
   *     { id: 'section-1', name: 'Updated Name', order: 1 }
   *   ]
   * });
   * ```
   */
  async updateSections(quoteId: string, payload: UpdateSectionsPayload): Promise<Section[]> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/sections`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError('Expected array of sections');
    }
    return data as Section[];
  }

  /**
   * Get the access list for a quote (who can view it).
   *
   * @param quoteId - The quote ID
   * @returns Promise resolving to array of access list entries
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const accessList = await pax8Client.quotes.getAccessList('quote-123');
   * console.log(`Quote shared with ${accessList.length} recipients`);
   * ```
   */
  async getAccessList(quoteId: string): Promise<AccessListEntry[]> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/access-list`);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError('Expected array of access list entries');
    }
    return data as AccessListEntry[];
  }

  /**
   * Add email recipients to a quote's access list.
   *
   * @param quoteId - The quote ID
   * @param payload - Email addresses to add
   * @returns Promise resolving to the updated access list
   * @throws {TypeError} If quoteId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const accessList = await pax8Client.quotes.addAccessListEntries('quote-123', {
   *   emails: ['customer@example.com', 'stakeholder@example.com']
   * });
   * ```
   */
  async addAccessListEntries(quoteId: string, payload: AddAccessListPayload): Promise<AccessListEntry[]> {
    validateNonEmptyString(quoteId, 'quoteId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/access-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError('Expected array of access list entries');
    }
    return data as AccessListEntry[];
  }

  /**
   * Remove an email recipient from a quote's access list.
   *
   * @param quoteId - The quote ID
   * @param accessListEntryId - The access list entry ID to remove
   * @returns Promise resolving when the entry is removed
   * @throws {TypeError} If quoteId or accessListEntryId is missing or invalid
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * await pax8Client.quotes.deleteAccessListEntry('quote-123', 'entry-456');
   * console.log('Access removed');
   * ```
   */
  async deleteAccessListEntry(quoteId: string, accessListEntryId: string): Promise<void> {
    validateNonEmptyString(quoteId, 'quoteId');
    validateNonEmptyString(accessListEntryId, 'accessListEntryId');

    const response = await this.client.request(`/v2/quotes/${quoteId}/access-list/${accessListEntryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }
  }
}
