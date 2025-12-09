import { handleErrorResponse, validateNonEmptyString, validatePage, validateSize } from '../http/api-utils.js';
import {
  DEFAULT_PAGE_SIZE,
  Invoice,
  InvoiceItemsResponse,
  InvoiceListResponse,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  assertInvoice,
  assertInvoiceItemsResponse,
  assertInvoiceListResponse,
} from '../models/invoices';

export interface InvoicesApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

export interface ListInvoicesOptions {
  page?: number;
  size?: number;
  companyId?: string;
}

export interface ListItemsOptions {
  page?: number;
  size?: number;
}

/**
 * Invoices API namespace for the Pax8Client.
 * Provides methods for listing, retrieving invoices, and accessing invoice line items.
 */
export class InvoicesApi {
  constructor(private readonly client: InvoicesApiClient) {}

  /**
   * List invoices with optional filters and page-based pagination.
   *
   * @param options - Optional filters and pagination parameters
   * @returns Promise resolving to a paginated list of invoices
   */
  async list(options: ListInvoicesOptions = {}): Promise<InvoiceListResponse> {
    return listInvoices(this.client, options);
  }

  /**
   * Get a specific invoice by ID.
   *
   * @param invoiceId - The unique identifier of the invoice
   * @returns Promise resolving to the invoice details
   */
  async get(invoiceId: string): Promise<Invoice> {
    return getInvoice(this.client, invoiceId);
  }

  /**
   * List line items for a specific invoice with page-based pagination.
   *
   * @param invoiceId - The unique identifier of the invoice
   * @param options - Optional pagination parameters
   * @returns Promise resolving to a paginated list of invoice items
   */
  async listItems(invoiceId: string, options: ListItemsOptions = {}): Promise<InvoiceItemsResponse> {
    return listInvoiceItems(this.client, invoiceId, options);
  }

  /**
   * List draft invoice items for a specific company with page-based pagination.
   *
   * @param companyId - The unique identifier of the company
   * @param options - Optional pagination parameters
   * @returns Promise resolving to a paginated list of draft invoice items
   */
  async listDraftItems(companyId: string, options: ListItemsOptions = {}): Promise<InvoiceItemsResponse> {
    return listDraftInvoiceItems(this.client, companyId, options);
  }
}

export const listInvoices = async (
  client: InvoicesApiClient,
  options: ListInvoicesOptions = {},
): Promise<InvoiceListResponse> => {
  // Validate pagination
  const page = validatePage(options.page);
  const size = validateSize(options.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  // Validate optional companyId
  if (options.companyId !== undefined) {
    validateNonEmptyString(options.companyId, 'companyId');
  }

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  if (options.companyId) {
    searchParams.set('companyId', options.companyId);
  }

  const path = `/invoices?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertInvoiceListResponse(data);

  return data;
};

export const getInvoice = async (client: InvoicesApiClient, invoiceId: string): Promise<Invoice> => {
  validateNonEmptyString(invoiceId, 'invoiceId');

  const path = `/invoices/${encodeURIComponent(invoiceId)}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertInvoice(data);

  return data;
};

export const listInvoiceItems = async (
  client: InvoicesApiClient,
  invoiceId: string,
  options: ListItemsOptions = {},
): Promise<InvoiceItemsResponse> => {
  validateNonEmptyString(invoiceId, 'invoiceId');

  // Validate pagination
  const page = validatePage(options.page);
  const size = validateSize(options.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  const path = `/invoices/${encodeURIComponent(invoiceId)}/items?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertInvoiceItemsResponse(data);

  return data;
};

export const listDraftInvoiceItems = async (
  client: InvoicesApiClient,
  companyId: string,
  options: ListItemsOptions = {},
): Promise<InvoiceItemsResponse> => {
  validateNonEmptyString(companyId, 'companyId');

  // Validate pagination
  const page = validatePage(options.page);
  const size = validateSize(options.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  const path = `/companies/${encodeURIComponent(companyId)}/invoices/draft-items?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertInvoiceItemsResponse(data);

  return data;
};
