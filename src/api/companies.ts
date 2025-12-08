import {
  Company,
  CompanyListResponse,
  CompanySearchResponse,
  CompanyStatus,
  assertCompanyListResponse,
  assertCompany,
  isCompanyStatus,
} from '../models/companies';
import { CursorParams, normalizeCursorParams } from '../pagination/cursor';

export type CompaniesSort = 'name' | 'updatedAt';

export interface CompaniesApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

export interface ListCompaniesParams extends CursorParams {
  status?: CompanyStatus;
  region?: string;
  updatedSince?: string;
  sort?: CompaniesSort;
}

export interface SearchCompaniesParams extends CursorParams {
  query: string;
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
  const normalized = normalizeCursorParams(params);

  // Validate optional parameters
  if (params.status !== undefined && !isCompanyStatus(params.status)) {
    throw new TypeError(`Invalid status: must be one of active, inactive, prospect, suspended`);
  }

  if (params.sort !== undefined && params.sort !== 'name' && params.sort !== 'updatedAt') {
    throw new TypeError(`Invalid sort: must be 'name' or 'updatedAt'`);
  }

  if (params.updatedSince !== undefined) {
    if (typeof params.updatedSince !== 'string' || Number.isNaN(Date.parse(params.updatedSince))) {
      throw new TypeError('updatedSince must be a valid ISO 8601 date string');
    }
  }

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('limit', normalized.limit.toString());

  if (normalized.pageToken) {
    searchParams.set('pageToken', normalized.pageToken);
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.region) {
    searchParams.set('region', params.region);
  }

  if (params.updatedSince) {
    searchParams.set('updatedSince', params.updatedSince);
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
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

  const normalized = normalizeCursorParams(params);

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('query', trimmedQuery);
  searchParams.set('limit', normalized.limit.toString());

  if (normalized.pageToken) {
    searchParams.set('pageToken', normalized.pageToken);
  }

  const path = `/companies/search?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertCompanyListResponse(data);

  return data;
};
