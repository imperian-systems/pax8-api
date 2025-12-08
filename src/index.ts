export { Pax8Client } from './client/pax8-client';
export type { Pax8ClientConfig, ResolvedPax8ClientConfig } from './client/config';

export { Pax8Error } from './errors/pax8-error';
export type { Pax8ErrorOptions } from './errors/pax8-error';
export { Pax8AuthenticationError } from './errors/auth-error';

export type {
  AccessToken,
  GrantType,
  TokenErrorResponse,
  TokenRequest,
  TokenResponse,
  TokenType,
} from './auth/types';

// Companies API
export {
  getCompany,
  listCompanies,
  searchCompanies,
  type CompaniesApiClient,
  type CompaniesSort,
  type ListCompaniesParams,
  type SearchCompaniesParams,
} from './api';

// Company models and types
export type {
  Company,
  CompanyListResponse,
  CompanySearchResponse,
  CompanyStatus,
  ErrorResponse,
  ExternalReference,
  PaginationMetadata,
  PrimaryContact,
} from './models/companies';

export {
  COMPANY_STATUSES,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  MIN_PAGE_LIMIT,
  assertCompany,
  assertCompanyListResponse,
  assertCompanySearchResponse,
  assertErrorResponse,
  assertPaginationMetadata,
  isCompany,
  isCompanyListResponse,
  isCompanySearchResponse,
  isCompanyStatus,
  isErrorResponse,
  isPaginationMetadata,
} from './models/companies';

// Pagination utilities
export type { CursorParams, NormalizedCursorParams } from './pagination/cursor';
export { appendCursorParams, hasMorePages, normalizeCursorParams, normalizeLimit } from './pagination/cursor';
