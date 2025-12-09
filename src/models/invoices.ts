export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

// Invoice status enum - matches OpenAPI spec
export const INVOICE_STATUSES = ['Unpaid', 'Paid', 'Void', 'Pending', 'Overdue'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// Charge type enum from OpenAPI spec
export const CHARGE_TYPES = ['NewCharge', 'Renewal', 'ProRata', 'Adjustment', 'Credit'] as const;
export type ChargeType = (typeof CHARGE_TYPES)[number];

// Invoice item - matches OpenAPI spec
export interface InvoiceItem {
  id: string;
  invoiceId?: string | null;
  companyId: string;
  subscriptionId?: string | null;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  chargeType: ChargeType;
}

// Invoice entity - matches OpenAPI spec
export interface Invoice {
  id: string;
  companyId: string;
  invoiceDate: string; // ISO 8601
  dueDate: string; // ISO 8601
  paidDate?: string | null; // ISO 8601
  total: number;
  balance: number;
  status: InvoiceStatus;
  carriedBalance?: number | null;
  partnerName?: string;
}

// List invoices options
export interface ListInvoicesOptions {
  page?: number;
  size?: number;
  companyId?: string;
}

// List invoice items options
export interface ListInvoiceItemsOptions {
  page?: number;
  size?: number;
}

// Page metadata
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

// Invoice list response
export interface InvoiceListResponse {
  content: Invoice[];
  page: PageMetadata;
}

// Invoice items list response
export interface InvoiceItemsResponse {
  content: InvoiceItem[];
  page: PageMetadata;
}

// Type guards
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isIsoDateString = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));

export const isInvoiceStatus = (value: unknown): value is InvoiceStatus =>
  isString(value) && (INVOICE_STATUSES as readonly string[]).includes(value);

export const isChargeType = (value: unknown): value is ChargeType =>
  isString(value) && (CHARGE_TYPES as readonly string[]).includes(value);

export const isInvoice = (value: unknown): value is Invoice => {
  if (!isObject(value)) {
    return false;
  }

  const { id, companyId, invoiceDate, dueDate, paidDate, total, balance, status, carriedBalance, partnerName } = value;

  if (!isNonEmptyString(id)) {
    return false;
  }

  if (!isNonEmptyString(companyId)) {
    return false;
  }

  if (!isIsoDateString(invoiceDate)) {
    return false;
  }

  if (!isIsoDateString(dueDate)) {
    return false;
  }

  if (paidDate !== undefined && paidDate !== null && !isIsoDateString(paidDate)) {
    return false;
  }

  if (!isNumber(total)) {
    return false;
  }

  if (!isNumber(balance)) {
    return false;
  }

  if (!isInvoiceStatus(status)) {
    return false;
  }

  if (carriedBalance !== undefined && carriedBalance !== null && !isNumber(carriedBalance)) {
    return false;
  }

  if (partnerName !== undefined && !isString(partnerName)) {
    return false;
  }

  return true;
};

export const isInvoiceItem = (value: unknown): value is InvoiceItem => {
  if (!isObject(value)) {
    return false;
  }

  const {
    id,
    invoiceId,
    companyId,
    subscriptionId,
    productId,
    productName,
    quantity,
    unitPrice,
    total,
    startDate,
    endDate,
    chargeType,
  } = value;

  if (!isNonEmptyString(id)) {
    return false;
  }

  if (invoiceId !== undefined && invoiceId !== null && !isNonEmptyString(invoiceId)) {
    return false;
  }

  if (!isNonEmptyString(companyId)) {
    return false;
  }

  if (subscriptionId !== undefined && subscriptionId !== null && !isNonEmptyString(subscriptionId)) {
    return false;
  }

  if (!isNonEmptyString(productId)) {
    return false;
  }

  if (!isNonEmptyString(productName)) {
    return false;
  }

  if (!isNumber(quantity)) {
    return false;
  }

  if (!isNumber(unitPrice)) {
    return false;
  }

  if (!isNumber(total)) {
    return false;
  }

  if (!isIsoDateString(startDate)) {
    return false;
  }

  if (!isIsoDateString(endDate)) {
    return false;
  }

  if (!isChargeType(chargeType)) {
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

export const isInvoiceListResponse = (value: unknown): value is InvoiceListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isInvoice)) {
    return false;
  }

  if (!isPageMetadata(page)) {
    return false;
  }

  return true;
};

export const isInvoiceItemsResponse = (value: unknown): value is InvoiceItemsResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isInvoiceItem)) {
    return false;
  }

  if (!isPageMetadata(page)) {
    return false;
  }

  return true;
};

// Assertion functions
export const assertInvoice: (value: unknown, message?: string) => asserts value is Invoice = (
  value: unknown,
  message = 'Invalid invoice payload',
): asserts value is Invoice => {
  if (!isInvoice(value)) {
    throw new TypeError(message);
  }
};

export const assertInvoiceListResponse: (value: unknown, message?: string) => asserts value is InvoiceListResponse = (
  value: unknown,
  message = 'Invalid invoice list response',
): asserts value is InvoiceListResponse => {
  if (!isInvoiceListResponse(value)) {
    throw new TypeError(message);
  }
};

export const assertInvoiceItem: (value: unknown, message?: string) => asserts value is InvoiceItem = (
  value: unknown,
  message = 'Invalid invoice item payload',
): asserts value is InvoiceItem => {
  if (!isInvoiceItem(value)) {
    throw new TypeError(message);
  }
};

export const assertInvoiceItemsResponse: (
  value: unknown,
  message?: string,
) => asserts value is InvoiceItemsResponse = (
  value: unknown,
  message = 'Invalid invoice items response',
): asserts value is InvoiceItemsResponse => {
  if (!isInvoiceItemsResponse(value)) {
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
