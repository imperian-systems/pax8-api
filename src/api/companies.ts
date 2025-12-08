import {
  COMPANY_STATUSES,
  Company,
  CompanyListResponse,
  CompanySearchResponse,
  CompanyStatus,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  assertCompanyListResponse,
  assertCompany,
  isCompanyStatus,
  assertCompanySearchResponse,
} from '../models/companies';

export type CompaniesSortField = 'name' | 'city' | 'country' | 'stateOrProvince' | 'postalCode';
export type CompaniesSortDirection = 'asc' | 'desc';
export type CompaniesSort = `${CompaniesSortField}` | `${CompaniesSortField},${CompaniesSortDirection}`;

export interface CompaniesApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

export interface ListCompaniesParams {
  page?: number;
  size?: number;
  sort?: CompaniesSort;
  city?: string;
  country?: string;
  stateOrProvince?: string;
  postalCode?: string;
  selfServiceAllowed?: boolean;
  billOnBehalfOfEnabled?: boolean;
  orderApprovalRequired?: boolean;
  status?: CompanyStatus;
  updatedSince?: string;
}

export interface SearchCompaniesParams {
  query: string;
  page?: number;
  size?: number;
}

/**
 * Companies API namespace for the Pax8Client.
 * Provides methods for listing, retrieving, and searching companies.
 */
export class CompaniesApi {
  constructor(private readonly client: CompaniesApiClient) {}

  /**
   * List companies with optional filters and page-based pagination.
   *
   * @param params - Optional filters and pagination parameters
   * @returns Promise resolving to a paginated list of companies
   */
  async list(params: ListCompaniesParams = {}): Promise<CompanyListResponse> {
    return listCompanies(this.client, params);
  }

  /**
   * Get a specific company by ID.
   *
   * @param companyId - The unique identifier of the company
   * @returns Promise resolving to the company details
   */
  async get(companyId: string): Promise<Company> {
    return getCompany(this.client, companyId);
  }

  /**
   * Search companies by name or domain.
   *
   * @param params - Search query and pagination parameters
   * @returns Promise resolving to search results with pagination
   */
  async search(params: SearchCompaniesParams): Promise<CompanySearchResponse> {
    return searchCompanies(this.client, params);
  }
}

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 256;

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

export const listCompanies = async (
  client: CompaniesApiClient,
  params: ListCompaniesParams = {},
): Promise<CompanyListResponse> => {
  // Validate pagination
  const page = validatePage(params.page);
  const size = validateSize(params.size);

  // Validate optional parameters
  if (params.status !== undefined && !isCompanyStatus(params.status)) {
    throw new TypeError(`Invalid status: must be one of ${COMPANY_STATUS_VALUES.join(', ')}`);
  }

  if (params.sort !== undefined) {
    validateSort(params.sort);
  }

  if (params.city !== undefined && typeof params.city !== 'string') {
    throw new TypeError('city must be a string when provided');
  }

  if (params.country !== undefined && typeof params.country !== 'string') {
    throw new TypeError('country must be a string when provided');
  }

  if (params.stateOrProvince !== undefined && typeof params.stateOrProvince !== 'string') {
    throw new TypeError('stateOrProvince must be a string when provided');
  }

  if (params.postalCode !== undefined && typeof params.postalCode !== 'string') {
    throw new TypeError('postalCode must be a string when provided');
  }

  if (params.selfServiceAllowed !== undefined && typeof params.selfServiceAllowed !== 'boolean') {
    throw new TypeError('selfServiceAllowed must be a boolean when provided');
  }

  if (params.billOnBehalfOfEnabled !== undefined && typeof params.billOnBehalfOfEnabled !== 'boolean') {
    throw new TypeError('billOnBehalfOfEnabled must be a boolean when provided');
  }

  if (params.orderApprovalRequired !== undefined && typeof params.orderApprovalRequired !== 'boolean') {
    throw new TypeError('orderApprovalRequired must be a boolean when provided');
  }

  if (params.updatedSince !== undefined) {
    if (typeof params.updatedSince !== 'string') {
      throw new TypeError('updatedSince must be an ISO date-time string when provided');
    }

    if (Number.isNaN(Date.parse(params.updatedSince))) {
      throw new TypeError('updatedSince must be a valid ISO date-time string');
    }
  }

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  if (params.city) {
    searchParams.set('city', params.city);
  }

  if (params.country) {
    searchParams.set('country', params.country);
  }

  if (params.stateOrProvince) {
    searchParams.set('stateOrProvince', params.stateOrProvince);
  }

  if (params.postalCode) {
    searchParams.set('postalCode', params.postalCode);
  }

  if (params.selfServiceAllowed !== undefined) {
    searchParams.set('selfServiceAllowed', String(params.selfServiceAllowed));
  }

  if (params.billOnBehalfOfEnabled !== undefined) {
    searchParams.set('billOnBehalfOfEnabled', String(params.billOnBehalfOfEnabled));
  }

  if (params.orderApprovalRequired !== undefined) {
    searchParams.set('orderApprovalRequired', String(params.orderApprovalRequired));
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.updatedSince) {
    searchParams.set('updatedSince', params.updatedSince);
  }

  const path = `/companies?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertCompanyListResponse(data);

  return data;
};

export const getCompany = async (client: CompaniesApiClient, companyId: string): Promise<Company> => {
  if (!companyId || typeof companyId !== 'string' || companyId.trim().length === 0) {
    throw new TypeError('companyId is required and must be a non-empty string');
  }

  const path = `/companies/${encodeURIComponent(companyId)}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertCompany(data);

  return data;
};

export const searchCompanies = async (
  client: CompaniesApiClient,
  params: SearchCompaniesParams,
): Promise<CompanySearchResponse> => {
  if (!params?.query || typeof params.query !== 'string') {
    throw new TypeError('query is required and must be a string');
  }

  const trimmedQuery = params.query.trim();

  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    throw new TypeError(`query must be at least ${MIN_QUERY_LENGTH} characters`);
  }

  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    throw new TypeError(`query must be no more than ${MAX_QUERY_LENGTH} characters`);
  }

  const page = validatePage(params.page);
  const size = validateSize(params.size);

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('query', trimmedQuery);
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  const path = `/companies/search?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertCompanySearchResponse(data);

  return data;
};

const COMPANY_STATUS_VALUES = [...COMPANY_STATUSES];

const SORT_FIELDS: CompaniesSortField[] = ['name', 'city', 'country', 'stateOrProvince', 'postalCode'];

const validatePage = (page?: number): number => {
  if (page === undefined) {
    return 0;
  }

  if (typeof page !== 'number' || !Number.isInteger(page) || page < 0) {
    throw new TypeError('page must be a non-negative integer');
  }

  return page;
};

const validateSize = (size?: number): number => {
  if (size === undefined) {
    return DEFAULT_PAGE_SIZE;
  }

  if (typeof size !== 'number' || !Number.isInteger(size)) {
    throw new TypeError('size must be an integer');
  }

  if (size < MIN_PAGE_SIZE || size > MAX_PAGE_SIZE) {
    throw new TypeError(`size must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`);
  }

  return size;
};

const validateSort = (sort: string): void => {
  const [field, direction] = sort.split(',');

  if (!SORT_FIELDS.includes(field as CompaniesSortField)) {
    throw new TypeError(`sort field must be one of ${SORT_FIELDS.join(', ')}`);
  }

  if (direction && direction !== 'asc' && direction !== 'desc') {
    throw new TypeError("sort direction must be 'asc' or 'desc'");
  }
};
