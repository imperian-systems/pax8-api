import type { BillingTerm } from './products.js';

export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export const SUBSCRIPTION_STATUSES = [
  'Active',
  'Cancelled',
  'PendingManual',
  'PendingAutomated',
  'PendingCancel',
  'WaitingForDetails',
  'Trial',
  'Converted',
  'PendingActivation',
  'Activated',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// Subscription commitment (nested object from API)
export interface SubscriptionCommitment {
  id: string;
  term: string;
  endDate?: string; // ISO 8601 date-time
}

// Subscription entity - matches OpenAPI spec
export interface Subscription {
  id: string;
  parentSubscriptionId?: string; // readOnly
  companyId: string;
  productId: string;
  vendorSubscriptionId?: string; // readOnly - vendor's unique identifier
  quantity: number;
  startDate: string; // ISO 8601
  endDate?: string | null; // ISO 8601, nullable
  createdDate: string; // ISO 8601, readOnly
  updatedDate?: string; // ISO 8601, readOnly
  billingStart: string; // ISO 8601, readOnly
  status: SubscriptionStatus;
  price: number;
  currencyCode?: string; // ISO 4217 code
  partnerCost?: number;
  billingTerm: BillingTerm;
  commitmentTerm?: SubscriptionCommitment; // readOnly, nested object
}

// Update subscription request - at least one field required
export interface UpdateSubscriptionRequest {
  price?: number;
  billingTerm?: BillingTerm;
  quantity?: number;
  startDate?: string; // ISO 8601
}

// Cancel options
export interface CancelOptions {
  cancelDate?: string; // ISO 8601 date-time string, optional
}

// Subscription history returns array of Subscription objects per OpenAPI spec
export interface SubscriptionHistoryResponse {
  content: Subscription[];
}

// List subscriptions options
export interface ListSubscriptionsOptions {
  page?: number;
  size?: number;
  sort?: string;
  companyId?: string;
  productId?: string;
  status?: SubscriptionStatus;
  billingTerm?: BillingTerm;
}

// Page metadata for pagination
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

// Subscription list response
export interface SubscriptionListResponse {
  content: Subscription[];
  page: PageMetadata;
}

// Type guards
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isIsoDateString = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const isOptionalString = (value: unknown): value is string | undefined => value === undefined || isString(value);
const isOptionalNumber = (value: unknown): value is number | undefined => value === undefined || isNumber(value);

export const isSubscriptionStatus = (value: unknown): value is SubscriptionStatus =>
  isString(value) && (SUBSCRIPTION_STATUSES as readonly string[]).includes(value);

export const isSubscriptionCommitment = (value: unknown): value is SubscriptionCommitment => {
  if (!isObject(value)) {
    return false;
  }

  const { id, term, endDate } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(term)) {
    return false;
  }

  if (endDate !== undefined && !isIsoDateString(endDate)) {
    return false;
  }

  return true;
};

export const isSubscription = (value: unknown): value is Subscription => {
  if (!isObject(value)) {
    return false;
  }

  const {
    id,
    parentSubscriptionId,
    companyId,
    productId,
    vendorSubscriptionId,
    quantity,
    startDate,
    endDate,
    createdDate,
    updatedDate,
    billingStart,
    status,
    price,
    currencyCode,
    partnerCost,
    billingTerm,
    commitmentTerm,
  } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(companyId) || !isNonEmptyString(productId)) {
    return false;
  }

  if (!isOptionalString(parentSubscriptionId)) {
    return false;
  }

  if (!isOptionalString(vendorSubscriptionId)) {
    return false;
  }

  if (!isNumber(quantity)) {
    return false;
  }

  if (!isIsoDateString(startDate)) {
    return false;
  }

  if (endDate !== undefined && endDate !== null && !isIsoDateString(endDate)) {
    return false;
  }

  if (!isIsoDateString(createdDate)) {
    return false;
  }

  if (updatedDate !== undefined && !isIsoDateString(updatedDate)) {
    return false;
  }

  if (!isString(billingStart)) {
    return false;
  }

  if (!isSubscriptionStatus(status)) {
    return false;
  }

  if (!isNumber(price)) {
    return false;
  }

  if (!isOptionalString(currencyCode)) {
    return false;
  }

  if (!isOptionalNumber(partnerCost)) {
    return false;
  }

  if (!isNonEmptyString(billingTerm)) {
    return false;
  }

  if (commitmentTerm !== undefined && !isSubscriptionCommitment(commitmentTerm)) {
    return false;
  }

  return true;
};

export const isPageMetadata = (value: unknown): value is PageMetadata => {
  if (!isObject(value)) {
    return false;
  }

  const { size, totalElements, totalPages, number } = value;

  if (!isInteger(size) || size < MIN_PAGE_SIZE || size > MAX_PAGE_SIZE) {
    return false;
  }

  if (!isInteger(totalElements) || totalElements < 0) {
    return false;
  }

  if (!isInteger(totalPages) || totalPages < 0) {
    return false;
  }

  if (!isInteger(number) || number < 0) {
    return false;
  }

  return true;
};

export const isSubscriptionListResponse = (value: unknown): value is SubscriptionListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isSubscription)) {
    return false;
  }

  if (!isPageMetadata(page)) {
    return false;
  }

  return true;
};

export const isSubscriptionHistoryResponse = (value: unknown): value is SubscriptionHistoryResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content } = value;

  if (!Array.isArray(content) || !content.every(isSubscription)) {
    return false;
  }

  return true;
};

// Assertion functions
export const assertSubscription: (value: unknown, message?: string) => asserts value is Subscription = (
  value: unknown,
  message = 'Invalid subscription payload',
): asserts value is Subscription => {
  if (!isSubscription(value)) {
    throw new TypeError(message);
  }
};

export const assertSubscriptionListResponse: (
  value: unknown,
  message?: string,
) => asserts value is SubscriptionListResponse = (
  value: unknown,
  message = 'Invalid subscription list response',
): asserts value is SubscriptionListResponse => {
  if (!isSubscriptionListResponse(value)) {
    throw new TypeError(message);
  }
};

export const assertSubscriptionHistoryResponse: (
  value: unknown,
  message?: string,
) => asserts value is SubscriptionHistoryResponse = (
  value: unknown,
  message = 'Invalid subscription history response',
): asserts value is SubscriptionHistoryResponse => {
  if (!isSubscriptionHistoryResponse(value)) {
    throw new TypeError(message);
  }
};

export const assertPageMetadata: (value: unknown, message?: string) => asserts value is PageMetadata = (
  value: unknown,
  message = 'Invalid pagination metadata',
): asserts value is PageMetadata => {
  if (!isPageMetadata(value)) {
    throw new TypeError(message);
  }
};
