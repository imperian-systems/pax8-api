import { handleErrorResponse, validateNonEmptyString, validatePage, validateSize } from '../http/api-utils.js';
import type { UsageSummary, UsageLineListResponse, ListUsageLinesOptions } from '../models/usage-summaries.js';
import {
  MIN_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  assertUsageSummary,
  assertUsageLineListResponse,
} from '../models/usage-summaries.js';

export interface UsageSummariesApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Usage Summaries API namespace for the Pax8Client.
 * Provides methods for retrieving usage summaries and usage lines.
 *
 * References:
 * - https://docs.pax8.com/api/v1#tag/Usage-Summaries
 */
export class UsageSummariesApi {
  constructor(private readonly client: UsageSummariesApiClient) {}

  /**
   * Get a specific usage summary by ID.
   *
   * Retrieves detailed information about a single usage summary including
   * charges, product details, and trial status.
   *
   * OpenAPI: GET /usage-summaries/{usageSummaryId}
   * @see https://docs.pax8.com/api/v1#tag/Usage-Summaries/operation/getUsageSummary
   *
   * @param usageSummaryId - The unique identifier of the usage summary (UUID format)
   * @returns Promise resolving to the usage summary details
   * @throws {Pax8Error} When usage summary is not found (404)
   *
   * @example
   * ```typescript
   * const summary = await client.usageSummaries.get('usage-summary-id');
   * console.log(summary.resourceGroup);
   * console.log(summary.currentCharges);
   * console.log(summary.vendorName);
   * ```
   */
  async get(usageSummaryId: string): Promise<UsageSummary> {
    return getUsageSummary(this.client, usageSummaryId);
  }

  /**
   * List usage lines for a usage summary.
   *
   * Retrieves detailed usage line items for a specific date within a usage summary.
   * Each line item shows product-level usage details including quantity, pricing,
   * and charges.
   *
   * **IMPORTANT**: The `usageDate` parameter is required by the Pax8 API.
   *
   * OpenAPI: GET /usage-summaries/{usageSummaryId}/usage-lines
   * @see https://docs.pax8.com/api/v1#tag/Usage-Summaries/operation/listUsageLines
   *
   * @param usageSummaryId - The unique identifier of the usage summary (UUID format)
   * @param options - Options including required usageDate, optional pagination and sorting
   * @returns Promise resolving to a paginated list of usage lines
   * @throws {Pax8Error} When usage summary is not found (404) or usageDate is missing (400)
   *
   * @example
   * ```typescript
   * // List usage lines for a specific date
   * const lines = await client.usageSummaries.listLines('usage-summary-id', {
   *   usageDate: '2024-01-15'
   * });
   *
   * for (const line of lines.content) {
   *   console.log(`${line.productName}: ${line.quantity} ${line.unitOfMeasure}`);
   *   console.log(`Charges: ${line.currentCharges} ${line.currencyCode}`);
   * }
   *
   * // With pagination
   * const page2 = await client.usageSummaries.listLines('usage-summary-id', {
   *   usageDate: '2024-01-15',
   *   page: 1,
   *   size: 50
   * });
   * ```
   */
  async listLines(usageSummaryId: string, options: ListUsageLinesOptions): Promise<UsageLineListResponse> {
    return listUsageLines(this.client, usageSummaryId, options);
  }
}

/**
 * Get a specific usage summary by ID.
 *
 * @param client - API client with request method
 * @param usageSummaryId - The unique identifier of the usage summary
 * @returns Promise resolving to the usage summary details
 */
export const getUsageSummary = async (
  client: UsageSummariesApiClient,
  usageSummaryId: string,
): Promise<UsageSummary> => {
  validateNonEmptyString(usageSummaryId, 'usageSummaryId');

  const path = `/usage-summaries/${usageSummaryId}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertUsageSummary(data);
  return data;
};

/**
 * List usage lines for a usage summary.
 *
 * @param client - API client with request method
 * @param usageSummaryId - The unique identifier of the usage summary
 * @param options - Options including required usageDate, optional pagination and sorting
 * @returns Promise resolving to a paginated list of usage lines
 */
export const listUsageLines = async (
  client: UsageSummariesApiClient,
  usageSummaryId: string,
  options: ListUsageLinesOptions,
): Promise<UsageLineListResponse> => {
  validateNonEmptyString(usageSummaryId, 'usageSummaryId');

  // usageDate is required
  if (!options.usageDate || typeof options.usageDate !== 'string' || options.usageDate.trim().length === 0) {
    throw new TypeError('usageDate is required and must be a non-empty string (ISO 8601 format)');
  }

  const page = options?.page ?? 0;
  const size = options?.size ?? DEFAULT_PAGE_SIZE;

  validatePage(page);
  validateSize(size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());
  searchParams.set('usageDate', options.usageDate);

  if (options?.sort) {
    searchParams.set('sort', options.sort);
  }

  const path = `/usage-summaries/${usageSummaryId}/usage-lines?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertUsageLineListResponse(data);
  return data;
};
