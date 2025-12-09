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
  listUsageSummaries,
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

// Invoices API
export {
  InvoicesApi,
  listInvoices,
  getInvoice,
  listInvoiceItems,
  listDraftInvoiceItems,
  type InvoicesApiClient,
} from './api';

// Invoice models and types
export type {
  ChargeType as InvoiceChargeType,
  Invoice,
  InvoiceItem,
  InvoiceItemListResponse,
  InvoiceListResponse,
  InvoiceStatus,
  PageMetadata as InvoicesPageMetadata,
} from './models/invoices';

export {
  CHARGE_TYPES as INVOICE_CHARGE_TYPES,
  DEFAULT_PAGE_SIZE as INVOICES_DEFAULT_PAGE_SIZE,
  INVOICE_STATUSES,
  MAX_PAGE_SIZE as INVOICES_MAX_PAGE_SIZE,
  MIN_PAGE_SIZE as INVOICES_MIN_PAGE_SIZE,
  assertInvoice,
  assertInvoiceItem,
  assertInvoiceItemListResponse,
  assertInvoiceListResponse,
  assertPageMetadata as assertInvoicesPageMetadata,
  isChargeType as isInvoiceChargeType,
  isInvoice,
  isInvoiceItem,
  isInvoiceItemListResponse,
  isInvoiceListResponse,
  isInvoiceStatus,
  isPageMetadata as isInvoicesPageMetadata,
} from './models/invoices';

// Usage Summaries API
export { UsageSummariesApi, getUsageSummary, listUsageLines, type UsageSummariesApiClient } from './api';

// Usage Summary models and types
export type {
  ListUsageLinesOptions,
  ListUsageSummariesOptions,
  PageMetadata as UsageSummariesPageMetadata,
  UsageLine,
  UsageLineListResponse,
  UsageSummary,
  UsageSummaryListResponse,
} from './models/usage-summaries';

export {
  DEFAULT_PAGE_SIZE as USAGE_SUMMARIES_DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE as USAGE_SUMMARIES_MAX_PAGE_SIZE,
  MIN_PAGE_SIZE as USAGE_SUMMARIES_MIN_PAGE_SIZE,
  assertPageMetadata as assertUsageSummariesPageMetadata,
  assertUsageLine,
  assertUsageLineListResponse,
  assertUsageSummary,
  assertUsageSummaryListResponse,
  isPageMetadata as isUsageSummariesPageMetadata,
  isUsageLine,
  isUsageLineListResponse,
  isUsageSummary,
  isUsageSummaryListResponse,
} from './models/usage-summaries';

// Quotes API - Placeholder for API exports (will be added in Phase 2)
// export { QuotesApi, type QuotesApiClient } from './api';
// export { QuotePreferencesApi, type QuotePreferencesApiClient } from './api';

// Quotes API
export { QuotesApi, type QuotesApiClient } from './api';

// Quote Preferences API
export { QuotePreferencesApi, type QuotePreferencesApiClient } from './api';

// Quote models and types
export type {
  AccessListEntry,
  AcceptedBy,
  AddAccessListPayload,
  AddCustomLineItemPayload,
  AddLineItemPayload,
  AddStandardLineItemPayload,
  AddUsageBasedLineItemPayload,
  AmountCurrency,
  Attachment,
  BillingTerm as QuoteBillingTerm,
  BulkDeleteLineItemsPayload,
  ClientDetails,
  CommitmentTerm,
  CreateQuotePayload,
  CreateSectionPayload,
  LineItem,
  LineItemRelationship,
  ListQuotesOptions,
  PartnerDetails,
  Product as QuoteProduct,
  ProductType,
  Quote,
  QuoteApiError,
  QuoteErrorDetail,
  QuoteErrorType,
  QuoteListResponse,
  QuoteStatus,
  QuoteStatusCounts,
  Section,
  SectionLineItem,
  UpdateLineItemPayload,
  UpdateQuotePayload,
  UpdateSectionItem,
  UpdateSectionsPayload,
  UsageBased,
  UsageBasedConfig,
  UsageBasedType,
  V2PageInfo,
  InvoiceTotals as QuoteInvoiceTotals,
} from './models/quotes';

export {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_LINE_ITEMS_PER_QUOTE,
  MAX_NOTE_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_SKU_LENGTH,
  MIN_LIMIT,
  assertQuote,
  assertQuoteListResponse,
  isCustomLineItem,
  isQuote,
  isQuoteListResponse,
  isStandardLineItem,
  isUsageBasedLineItem,
} from './models/quotes';

// Quote Preferences models and types
export type { QuotePreferences, UpdateQuotePreferencesPayload } from './models/quote-preferences';

// Pagination utilities (none exported for companies; contacts use page/size helpers internally)
