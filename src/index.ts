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
  CompanyAddress,
  CompanyListResponse,
  CompanySearchResponse,
  CompanyStatus,
  ErrorResponse,
  PageMetadata as CompaniesPageMetadata,
} from './models/companies';

export {
  COMPANY_STATUSES,
  DEFAULT_PAGE_SIZE as COMPANIES_DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE as COMPANIES_MAX_PAGE_SIZE,
  MIN_PAGE_SIZE as COMPANIES_MIN_PAGE_SIZE,
  assertCompany,
  assertCompanyListResponse,
  assertCompanySearchResponse,
  assertErrorResponse,
  assertPageMetadata as assertCompaniesPageMetadata,
  isCompany,
  isCompanyListResponse,
  isCompanySearchResponse,
  isCompanyStatus,
  isErrorResponse,
  isPageMetadata as isCompaniesPageMetadata,
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

// Orders API
export {
  OrdersApi,
  createOrder,
  getOrder,
  listOrders,
  type OrdersApiClient,
} from './api';

// Order models and types
export type {
  CreateLineItem,
  CreateOrderRequest,
  ListOrdersOptions,
  Order,
  OrderedBy,
  OrderLineItem,
  OrderListResponse,
  ProvisioningDetail as OrderProvisioningDetail,
} from './models/orders';

export {
  ORDERED_BY_VALUES,
  DEFAULT_PAGE_SIZE as ORDERS_DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE as ORDERS_MAX_PAGE_SIZE,
  MIN_PAGE_SIZE as ORDERS_MIN_PAGE_SIZE,
  assertOrder,
  assertOrderListResponse,
  isOrder,
  isOrderedBy,
  isOrderLineItem,
  isOrderListResponse,
} from './models/orders';

// Subscriptions API
export {
  SubscriptionsApi,
  getSubscription,
  listSubscriptions,
  updateSubscription,
  cancelSubscription,
  getSubscriptionHistory,
  type SubscriptionsApiClient,
} from './api';

// Subscription models and types
export type {
  CancelOptions,
  ListSubscriptionsOptions,
  Subscription,
  SubscriptionHistory,
  SubscriptionListResponse,
  SubscriptionStatus,
  UpdateSubscriptionRequest,
  PageMetadata as SubscriptionsPageMetadata,
} from './models/subscriptions';

export {
  DEFAULT_PAGE_SIZE as SUBSCRIPTIONS_DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE as SUBSCRIPTIONS_MAX_PAGE_SIZE,
  MIN_PAGE_SIZE as SUBSCRIPTIONS_MIN_PAGE_SIZE,
  SUBSCRIPTION_STATUSES,
} from './models/subscriptions';

// Pagination utilities (none exported for companies; contacts use page/size helpers internally)
