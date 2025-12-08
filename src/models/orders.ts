import type { BillingTerm, ProvisioningValueType } from './products.js';

export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export const ORDERED_BY_VALUES = ['Pax8 Partner', 'Customer', 'Pax8'] as const;
export type OrderedBy = (typeof ORDERED_BY_VALUES)[number];

// Provisioning detail for order line items
export interface ProvisioningDetail {
  label?: string; // read-only
  key: string;
  values?: string[]; // write-only
  description?: string; // read-only
  valueType?: ProvisioningValueType; // read-only
  possibleValues?: string[]; // read-only
}

// Order line item
export interface OrderLineItem {
  id: string;
  productId: string;
  subscriptionId: string | null; // nullable until created
  commitmentTermId?: string;
  provisionStartDate?: string; // ISO 8601 date-time
  lineItemNumber?: number; // write-only reference in order
  billingTerm: BillingTerm;
  parentSubscriptionId?: string; // write-only
  parentLineItemNumber?: number; // write-only
  quantity: number;
  provisioningDetails?: ProvisioningDetail[]; // write-only
}

// Order
export interface Order {
  id: string;
  companyId: string;
  createdDate: string; // ISO 8601
  orderedBy: OrderedBy;
  orderedByUserId?: string; // read-only
  orderedByUserEmail?: string;
  isScheduled?: boolean; // read-only
  lineItems: OrderLineItem[];
}

// Create line item (for order creation)
export interface CreateLineItem {
  productId: string;
  quantity: number;
  billingTerm: BillingTerm;
  lineItemNumber: number; // required reference within order
  commitmentTermId?: string; // required when product requires commitment
  provisionStartDate?: string; // ISO 8601 date-time
  parentSubscriptionId?: string;
  parentLineItemNumber?: number;
  provisioningDetails?: ProvisioningDetail[]; // optional, write-only values
}

// Create order request
export interface CreateOrderRequest {
  companyId: string;
  lineItems: CreateLineItem[];
  orderedBy?: OrderedBy;
  orderedByUserEmail?: string;
}

// List orders request parameters
export interface ListOrdersOptions {
  page?: number;
  size?: number;
  companyId?: string; // optional filter
}

// Page metadata for pagination
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

// Order list response
export interface OrderListResponse {
  content: Order[];
  page: PageMetadata;
}

// Error response
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Type guards
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim().length > 0;
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isIsoDateString = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));

export const isOrderedBy = (value: unknown): value is OrderedBy =>
  isString(value) && (ORDERED_BY_VALUES as readonly string[]).includes(value);

const isProvisioningDetail = (value: unknown): value is ProvisioningDetail => {
  if (!isObject(value)) {
    return false;
  }

  const { key, label, values, description, valueType, possibleValues } = value;

  if (!isNonEmptyString(key)) {
    return false;
  }

  if (label !== undefined && !isString(label)) {
    return false;
  }

  if (values !== undefined && (!Array.isArray(values) || !values.every(isString))) {
    return false;
  }

  if (description !== undefined && !isString(description)) {
    return false;
  }

  if (valueType !== undefined && !isString(valueType)) {
    return false;
  }

  if (possibleValues !== undefined && (!Array.isArray(possibleValues) || !possibleValues.every(isString))) {
    return false;
  }

  return true;
};

export const isOrderLineItem = (value: unknown): value is OrderLineItem => {
  if (!isObject(value)) {
    return false;
  }

  const {
    id,
    productId,
    subscriptionId,
    commitmentTermId,
    provisionStartDate,
    lineItemNumber,
    billingTerm,
    parentSubscriptionId,
    parentLineItemNumber,
    quantity,
    provisioningDetails,
  } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(productId)) {
    return false;
  }

  if (subscriptionId !== null && !isNonEmptyString(subscriptionId)) {
    return false;
  }

  if (commitmentTermId !== undefined && !isNonEmptyString(commitmentTermId)) {
    return false;
  }

  if (provisionStartDate !== undefined && !isIsoDateString(provisionStartDate)) {
    return false;
  }

  if (lineItemNumber !== undefined && !isInteger(lineItemNumber)) {
    return false;
  }

  if (!isString(billingTerm)) {
    return false;
  }

  if (parentSubscriptionId !== undefined && !isNonEmptyString(parentSubscriptionId)) {
    return false;
  }

  if (parentLineItemNumber !== undefined && !isInteger(parentLineItemNumber)) {
    return false;
  }

  if (!isNumber(quantity) || quantity <= 0) {
    return false;
  }

  if (provisioningDetails !== undefined && (!Array.isArray(provisioningDetails) || !provisioningDetails.every(isProvisioningDetail))) {
    return false;
  }

  return true;
};

export const isOrder = (value: unknown): value is Order => {
  if (!isObject(value)) {
    return false;
  }

  const { id, companyId, createdDate, orderedBy, orderedByUserId, orderedByUserEmail, isScheduled, lineItems } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(companyId)) {
    return false;
  }

  if (!isIsoDateString(createdDate)) {
    return false;
  }

  if (!isOrderedBy(orderedBy)) {
    return false;
  }

  if (orderedByUserId !== undefined && !isNonEmptyString(orderedByUserId)) {
    return false;
  }

  if (orderedByUserEmail !== undefined && !isString(orderedByUserEmail)) {
    return false;
  }

  if (isScheduled !== undefined && !isBoolean(isScheduled)) {
    return false;
  }

  if (!Array.isArray(lineItems) || !lineItems.every(isOrderLineItem)) {
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

export const isOrderListResponse = (value: unknown): value is OrderListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isOrder)) {
    return false;
  }

  if (!isPageMetadata(page)) {
    return false;
  }

  return true;
};

export const isErrorResponse = (value: unknown): value is ErrorResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { code, message, details } = value;

  if (!isNonEmptyString(code) || !isNonEmptyString(message)) {
    return false;
  }

  if (details !== undefined && !isObject(details)) {
    return false;
  }

  return true;
};

// Assertion functions
export const assertOrder: (value: unknown, message?: string) => asserts value is Order = (
  value: unknown,
  message = 'Invalid order payload',
): asserts value is Order => {
  if (!isOrder(value)) {
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

export const assertOrderListResponse: (value: unknown, message?: string) => asserts value is OrderListResponse = (
  value: unknown,
  message = 'Invalid order list response',
): asserts value is OrderListResponse => {
  if (!isOrderListResponse(value)) {
    throw new TypeError(message);
  }
};

export const assertErrorResponse: (value: unknown, message?: string) => asserts value is ErrorResponse = (
  value: unknown,
  message = 'Invalid error response',
): asserts value is ErrorResponse => {
  if (!isErrorResponse(value)) {
    throw new TypeError(message);
  }
};
