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
  CompaniesApi,
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

// Contacts API
export {
  ContactsApi,
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
  type ContactsApiClient,
} from './api';

// Contact models and types
export type {
  Contact,
  ContactListResponse,
  ContactType,
  ContactTypeEnum,
  CreateContactRequest,
  ListContactsParams,
  PageMetadata,
  UpdateContactRequest,
} from './models/contacts';

export {
  CONTACT_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  assertContact,
  assertContactListResponse,
  assertCreateContactRequest,
  assertPageMetadata,
  assertUpdateContactRequest,
  isContact,
  isContactListResponse,
  isContactType,
  isContactTypeEnum,
  isCreateContactRequest,
  isPageMetadata,
  isUpdateContactRequest,
} from './models/contacts';

// Products API
export {
  ProductsApi,
  getDependencies,
  getPricing,
  getProduct,
  getProvisioningDetails,
  listProducts,
  type ProductsApiClient,
} from './api';

// Product models and types
export type {
  BillingTerm,
  ChargeType,
  Commitment,
  Dependencies,
  ListProductsOptions,
  Pricing,
  PricingOptions,
  PricingResponse,
  PricingType,
  Product,
  ProductDependency,
  ProductDetail,
  ProductListResponse,
  ProductSortField,
  ProvisioningDetail,
  ProvisioningDetailsResponse,
  ProvisioningValueType,
  Rate,
} from './models/products';

export {
  BILLING_TERMS,
  CHARGE_TYPES,
  PRICING_TYPES,
  PRODUCT_SORT_FIELDS,
  PROVISIONING_VALUE_TYPES,
} from './models/products';

// Pagination utilities
export type { CursorParams, NormalizedCursorParams } from './pagination/cursor';
export { appendCursorParams, hasMorePages, normalizeCursorParams, normalizeLimit } from './pagination/cursor';
