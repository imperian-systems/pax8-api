/**
 * Quotes API models and types.
 * Based on Pax8 Quoting Endpoints v2 OpenAPI specification.
 */

// ============================================================================
// Constants
// ============================================================================

/** Default items per page for v2 pagination */
export const DEFAULT_LIMIT = 10;

/** Minimum items per page for v2 pagination */
export const MIN_LIMIT = 1;

/** Maximum items per page for v2 pagination */
export const MAX_LIMIT = 50;

/** Maximum line items per quote */
export const MAX_LINE_ITEMS_PER_QUOTE = 30;

/** Maximum note length for line items */
export const MAX_NOTE_LENGTH = 2000;

/** Maximum custom product name length */
export const MAX_PRODUCT_NAME_LENGTH = 255;

/** Maximum custom product SKU length */
export const MAX_PRODUCT_SKU_LENGTH = 100;

// ============================================================================
// Quote Status
// ============================================================================

/**
 * Quote status values.
 * Workflow: draft → assigned → sent → (accepted|declined|expired|closed|changes_requested)
 */
export type QuoteStatus =
  | 'draft'
  | 'assigned'
  | 'sent'
  | 'closed'
  | 'declined'
  | 'accepted'
  | 'changes_requested'
  | 'expired';

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Billing term options for line items.
 */
export type BillingTerm =
  | 'Monthly'
  | 'Annual'
  | '1 Year'
  | '2 Year'
  | '3 Year'
  | 'Trial'
  | 'Activation'
  | 'One-Time';

/**
 * Product type classification.
 */
export type ProductType = 'Standalone' | 'Solution' | 'Custom';

/**
 * Usage-based line item type.
 */
export type UsageBasedType = 'PRICE_FLAT' | 'PRICE_VARIES' | 'QTY_VARIES';

/**
 * Amount with currency.
 */
export interface AmountCurrency {
  /** Numeric amount */
  amount: number;

  /** ISO 4217 currency code (e.g., "USD") */
  currency: string;
}

/**
 * Financial totals for quotes and line items.
 */
export interface InvoiceTotals {
  /** Initial cost */
  initialCost: AmountCurrency;

  /** Initial profit */
  initialProfit: AmountCurrency;

  /** Initial total */
  initialTotal: AmountCurrency;

  /** Recurring cost */
  recurringCost: AmountCurrency;

  /** Recurring profit */
  recurringProfit: AmountCurrency;

  /** Recurring total */
  recurringTotal: AmountCurrency;
}

/**
 * Product details within a line item.
 */
export interface Product {
  /** Product ID */
  id: string;

  /** Product name */
  name: string;

  /** Product SKU */
  sku: string;

  /** Product type */
  type: ProductType;

  /** Whether this is MSP-only product */
  isMspOnly: boolean;
}

/**
 * Client details on a quote.
 */
export interface ClientDetails {
  /** Client/company ID */
  id: string;

  /** Client name */
  name: string;
}

/**
 * Partner details on a quote.
 */
export interface PartnerDetails {
  /** Partner ID */
  id: string;

  /** Partner name */
  name: string;
}

/**
 * Accepted by details when quote is accepted.
 */
export interface AcceptedBy {
  /** User ID who accepted */
  userId: string;

  /** Email of acceptor */
  email: string;

  /** Name of acceptor */
  name: string;
}

/**
 * Attachment on a quote.
 */
export interface Attachment {
  /** Attachment ID */
  id: string;

  /** File name */
  name: string;

  /** File URL */
  url: string;
}

/**
 * Usage-based line item configuration.
 */
export interface UsageBased {
  /** Usage type */
  type: UsageBasedType;

  /** Whether to display usage note */
  displayNote: boolean;
}

/**
 * Configuration for adding usage-based line items.
 */
export interface UsageBasedConfig {
  /** Usage type */
  type: UsageBasedType;

  /** Whether to display usage note */
  displayNote?: boolean;
}

/**
 * Commitment term for line items.
 */
export interface CommitmentTerm {
  /** Term in months */
  termInMonths: number;

  /** Auto-renewal setting */
  autoRenewal: boolean;
}

/**
 * Relationship between line items.
 */
export interface LineItemRelationship {
  /** Required line item ID */
  requiredLineItemId?: string;

  /** Required subscription ID */
  requiredSubscriptionId?: string;
}

// ============================================================================
// Line Item Types
// ============================================================================

/**
 * Line item within a quote.
 * Represents a product, custom item, or usage-based service.
 */
export interface LineItem {
  /** Unique identifier for the line item */
  id: string;

  /** Billing term for this line item */
  billingTerm: BillingTerm;

  /** Product details (null for custom items) */
  product: Product | null;

  /** Quantity ordered */
  quantity: number;

  /** Price per unit */
  price: AmountCurrency;

  /** Cost per unit */
  cost: AmountCurrency;

  /** Financial totals for this line item */
  totals: InvoiceTotals;

  /** Effective date for the line item (ISO 8601) */
  effectiveDate: string | null;

  /** Note for this line item (max 2000 chars) */
  note: string | null;

  /** Linked subscription ID if applicable */
  subscriptionId: string | null;

  /** Commitment term if applicable */
  commitmentTerm: CommitmentTerm | null;

  /** Relationship to other line items */
  relationship: LineItemRelationship | null;

  /** Usage-based configuration if applicable */
  usageBased: UsageBased | null;
}

// ============================================================================
// Quote Entity
// ============================================================================

/**
 * Quote entity representing a sales proposal.
 * @see https://devx.pax8.com/openapi/6761fd80721228003dd0af1a - Quote schema
 */
export interface Quote {
  /** Unique identifier for the quote */
  id: string;

  /** Current status of the quote */
  status: QuoteStatus;

  /** Client/customer details */
  client: ClientDetails;

  /** Partner details */
  partner: PartnerDetails;

  /** Line items in the quote */
  lineItems: LineItem[];

  /** Financial totals for the quote */
  totals: InvoiceTotals;

  /** Attachments on the quote */
  attachments: Attachment[];

  /** Auto-generated reference code */
  referenceCode: string;

  /** Introduction message for the quote */
  introMessage: string;

  /** Terms and disclaimers text */
  termsAndDisclaimers: string;

  /** Expiration date (ISO 8601) */
  expiresOn: string;

  /** Whether the quote has been shared/published */
  published: boolean;

  /** When the quote was published (ISO 8601), null if not published */
  publishedOn: string | null;

  /** User ID who created the quote */
  createdBy: string;

  /** Creation timestamp (ISO 8601) */
  createdOn: string;

  /** When the client responded (ISO 8601), null if no response */
  respondedOn: string | null;

  /** When the quote was revoked (ISO 8601), null if not revoked */
  revokedOn: string | null;

  /** Details of who accepted the quote, null if not accepted */
  acceptedBy: AcceptedBy | null;

  /** Optional quote request ID this quote was created from */
  quoteRequestId: string | null;
}

// ============================================================================
// Quote Response Types
// ============================================================================

/**
 * v2 API pagination info.
 * Note: page is 1-indexed (not 0-indexed like v1).
 */
export interface V2PageInfo {
  /** Items per page */
  limit: number;

  /** Current page (1-indexed) */
  page: number;

  /** Total number of items */
  totalElements: number;

  /** Total number of pages */
  totalPages: number;
}

/**
 * Quote counts by status.
 */
export interface QuoteStatusCounts {
  draft: number;
  assigned: number;
  sent: number;
  closed: number;
  declined: number;
  accepted: number;
  changes_requested: number;
  expired: number;
}

/**
 * Response for listing quotes.
 * Includes status counts unique to v2 API.
 */
export interface QuoteListResponse {
  /** Quotes in this page */
  content: Quote[];

  /** Counts per status */
  statusCounts: QuoteStatusCounts;

  /** Pagination info */
  page: V2PageInfo;
}

// ============================================================================
// Quote Payload Types
// ============================================================================

/**
 * Payload for creating a new quote.
 */
export interface CreateQuotePayload {
  /** Client/company ID (required) */
  clientId: string;

  /** Optional quote request ID to link */
  quoteRequestId?: string;
}

/**
 * Payload for updating a quote.
 */
export interface UpdateQuotePayload {
  /** Update expiration date */
  expiresOn?: string;

  /** Update introduction message */
  introMessage?: string;

  /** Update published status */
  published?: boolean;

  /** Update quote status */
  status?: QuoteStatus;

  /** Update terms and disclaimers */
  termsAndDisclaimers?: string;
}

/**
 * Options for listing quotes with v2 pagination.
 * Note: Uses limit/page (1-indexed), not page/size (0-indexed) like v1 APIs.
 */
export interface ListQuotesOptions {
  /** Items per page (1-50, default 10) */
  limit?: number;

  /** Page number (1-indexed, default 1) */
  page?: number;

  /** Sort field and direction (e.g., "status,desc") */
  sort?: string;

  /** Search term */
  search?: string;

  /** Filter by status */
  status?: QuoteStatus;

  /** Account scope: 'user' (default) or 'partner' */
  account?: 'user' | 'partner';
}

// ============================================================================
// Line Item Payload Types (Discriminated Union)
// ============================================================================

/**
 * Base fields shared by all add line item payloads.
 */
interface BaseAddLineItemPayload {
  /** Billing term for the line item */
  billingTerm: BillingTerm;

  /** Quantity (defaults to 1) */
  quantity?: number;

  /** Effective date (ISO 8601) */
  effectiveDate?: string;

  /** Note for the line item (max 2000 chars) */
  note?: string;

  /** Section ID to place the line item in */
  sectionId?: string;

  /** Commitment term if applicable */
  commitmentTerm?: CommitmentTerm;

  /** Relationships to other line items */
  relationships?: LineItemRelationship[];
}

/**
 * Payload for adding a standard product line item.
 */
export interface AddStandardLineItemPayload extends BaseAddLineItemPayload {
  /** Discriminator: Standard product */
  type: 'Standard';

  /** Product ID (required for standard items) */
  productId: string;

  /** Override price (optional) */
  price?: AmountCurrency;
}

/**
 * Payload for adding a custom line item.
 */
export interface AddCustomLineItemPayload extends BaseAddLineItemPayload {
  /** Discriminator: Custom line item */
  type: 'Custom';

  /** Custom product name (max 255 chars, required) */
  productName: string;

  /** Custom product SKU (max 100 chars, optional) */
  productSku?: string;

  /** Cost (required for custom items) */
  cost: AmountCurrency;

  /** Price (required for custom items) */
  price: AmountCurrency;
}

/**
 * Payload for adding a usage-based line item.
 */
export interface AddUsageBasedLineItemPayload extends BaseAddLineItemPayload {
  /** Discriminator: Usage-based line item */
  type: 'UsageBased';

  /** Product ID (required for usage-based items) */
  productId: string;

  /** Cost (required for usage-based items) */
  cost: AmountCurrency;

  /** Usage-based configuration (required) */
  usageBased: UsageBasedConfig;
}

/**
 * Combined type for adding line items.
 * Use `type` field to discriminate between variants.
 */
export type AddLineItemPayload =
  | AddStandardLineItemPayload
  | AddCustomLineItemPayload
  | AddUsageBasedLineItemPayload;

/**
 * Payload for updating existing line items.
 */
export interface UpdateLineItemPayload {
  /** Line item ID to update */
  id: string;

  /** Updated quantity */
  quantity?: number;

  /** Updated price */
  price?: AmountCurrency;

  /** Updated effective date */
  effectiveDate?: string;

  /** Updated note */
  note?: string;

  /** Updated section assignment */
  sectionId?: string;
}

/**
 * Payload for bulk deleting line items.
 */
export interface BulkDeleteLineItemsPayload {
  /** Line item IDs to delete */
  lineItemIds: string[];
}

// ============================================================================
// Section Types
// ============================================================================

/**
 * Line item reference within a section.
 */
export interface SectionLineItem {
  /** Line item ID */
  lineItemId: string;

  /** Display order within section */
  order: number;
}

/**
 * Section for organizing line items.
 */
export interface Section {
  /** Section ID */
  id: string;

  /** Section name */
  name: string;

  /** Display order */
  order: number;

  /** Line items in this section */
  lineItems: SectionLineItem[];
}

/**
 * Payload for creating a section.
 */
export interface CreateSectionPayload {
  /** Section name */
  name: string;
}

/**
 * Individual section update item.
 */
export interface UpdateSectionItem {
  /** Section ID */
  id: string;

  /** Updated name */
  name?: string;

  /** Updated order */
  order?: number;

  /** Updated line item assignments */
  lineItems?: SectionLineItem[];
}

/**
 * Payload for updating sections (batch).
 */
export interface UpdateSectionsPayload {
  /** Sections to update */
  sections: UpdateSectionItem[];
}

// ============================================================================
// Access List Types
// ============================================================================

/**
 * Access list entry for quote sharing.
 */
export interface AccessListEntry {
  /** Entry ID */
  id: string;

  /** Recipient email */
  email: string;

  /** Unique access link URL */
  link: string;

  /** Associated user ID if registered, null otherwise */
  userId: string | null;
}

/**
 * Payload for adding access list entries.
 */
export interface AddAccessListPayload {
  /** Email addresses to add (1 or more) */
  emails: string[];
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error types returned by the Quotes API.
 */
export type QuoteErrorType =
  | 'QUOTE_NOT_FOUND'
  | 'QUOTE_VALIDATION'
  | 'LINE_ITEM_LIMIT_EXCEEDED'
  | 'QUOTE_ACCESS_EMAIL_EXISTS'
  | 'ACCESS_DENIED'
  | 'INVALID_REQUEST_PARAMETER'
  | 'REQUEST_VALIDATION_FAILED'
  | 'PAYLOAD_VALIDATION'
  | 'SERVICE_UNAVAILABLE';

/**
 * Individual error detail.
 */
export interface QuoteErrorDetail {
  /** Field that caused the error (optional) */
  field?: string;

  /** Error message */
  message: string;
}

/**
 * Error response from Quotes API.
 */
export interface QuoteApiError {
  /** HTTP status code */
  status: number;

  /** Error message */
  message: string;

  /** Error type classification */
  type: QuoteErrorType;

  /** Request instance ID */
  instance: string;

  /** Detailed error information */
  details: QuoteErrorDetail[];
}

// ============================================================================
// Type Guards and Assertion Functions
// ============================================================================

/**
 * Type guard for Quote.
 */
export function isQuote(value: unknown): value is Quote {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Quote).id === 'string' &&
    typeof (value as Quote).status === 'string' &&
    typeof (value as Quote).referenceCode === 'string' &&
    Array.isArray((value as Quote).lineItems)
  );
}

/**
 * Assertion function for Quote.
 * @throws TypeError if value is not a valid Quote
 */
export function assertQuote(value: unknown): asserts value is Quote {
  if (!isQuote(value)) {
    throw new TypeError('Invalid Quote structure');
  }
}

/**
 * Type guard for QuoteListResponse.
 */
export function isQuoteListResponse(value: unknown): value is QuoteListResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as QuoteListResponse).content) &&
    typeof (value as QuoteListResponse).statusCounts === 'object' &&
    typeof (value as QuoteListResponse).page === 'object'
  );
}

/**
 * Assertion function for QuoteListResponse.
 * @throws TypeError if value is not a valid QuoteListResponse
 */
export function assertQuoteListResponse(value: unknown): asserts value is QuoteListResponse {
  if (!isQuoteListResponse(value)) {
    throw new TypeError('Invalid QuoteListResponse structure');
  }
}

/**
 * Type guard for AddStandardLineItemPayload.
 */
export function isStandardLineItem(
  payload: AddLineItemPayload
): payload is AddStandardLineItemPayload {
  return payload.type === 'Standard';
}

/**
 * Type guard for AddCustomLineItemPayload.
 */
export function isCustomLineItem(
  payload: AddLineItemPayload
): payload is AddCustomLineItemPayload {
  return payload.type === 'Custom';
}

/**
 * Type guard for AddUsageBasedLineItemPayload.
 */
export function isUsageBasedLineItem(
  payload: AddLineItemPayload
): payload is AddUsageBasedLineItemPayload {
  return payload.type === 'UsageBased';
}
