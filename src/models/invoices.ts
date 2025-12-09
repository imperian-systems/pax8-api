export const INVOICE_STATUSES = ['Unpaid', 'Paid', 'Void', 'Pending', 'Overdue'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const CHARGE_TYPES = ['NewCharge', 'Renewal', 'ProRata', 'Adjustment', 'Credit'] as const;
export type ChargeType = (typeof CHARGE_TYPES)[number];

export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export interface Invoice {
  id: string;
  companyId: string;
  invoiceDate: string;
  dueDate: string;
  paidDate?: string;
  total: number;
  balance: number;
  status: InvoiceStatus;
  carriedBalance?: number;
  partnerName?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId?: string;
  companyId: string;
  subscriptionId?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  startDate: string;
  endDate: string;
  chargeType: ChargeType;
}

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface InvoiceListResponse {
  content: Invoice[];
  page: PageMetadata;
}

export interface InvoiceItemListResponse {
  content: InvoiceItem[];
  page: PageMetadata;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isIsoDateString = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const isOptionalString = (value: unknown): value is string | undefined => value === undefined || isString(value);
const isOptionalNumber = (value: unknown): value is number | undefined =>
  value === undefined || (isNumber(value) && Number.isFinite(value));

export const isInvoiceStatus = (value: unknown): value is InvoiceStatus =>
  isString(value) && (INVOICE_STATUSES as readonly string[]).includes(value);

export const isChargeType = (value: unknown): value is ChargeType =>
  isString(value) && (CHARGE_TYPES as readonly string[]).includes(value);

export const isInvoice = (value: unknown): value is Invoice => {
  if (!isObject(value)) {
    return false;
  }

  const { id, companyId, invoiceDate, dueDate, paidDate, total, balance, status, carriedBalance, partnerName } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(companyId)) {
    return false;
  }

  if (!isIsoDateString(invoiceDate) || !isIsoDateString(dueDate)) {
    return false;
  }

  if (paidDate !== undefined && !isIsoDateString(paidDate)) {
    return false;
  }

  if (!isNumber(total) || !isNumber(balance)) {
    return false;
  }

  if (!isInvoiceStatus(status)) {
    return false;
  }

  if (!isOptionalNumber(carriedBalance)) {
    return false;
  }

  if (!isOptionalString(partnerName)) {
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

  if (!isNonEmptyString(id) || !isNonEmptyString(companyId)) {
    return false;
  }

  if (!isOptionalString(invoiceId)) {
    return false;
  }

  if (!isOptionalString(subscriptionId)) {
    return false;
  }

  if (!isNonEmptyString(productId) || !isNonEmptyString(productName)) {
    return false;
  }

  if (!isNumber(quantity) || !isNumber(unitPrice) || !isNumber(total)) {
    return false;
  }

  if (!isIsoDateString(startDate) || !isIsoDateString(endDate)) {
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

export const isInvoiceItemListResponse = (value: unknown): value is InvoiceItemListResponse => {
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

export const assertInvoice: (value: unknown, message?: string) => asserts value is Invoice = (
  value: unknown,
  message = 'Invalid invoice payload',
): asserts value is Invoice => {
  if (!isInvoice(value)) {
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

export const assertPageMetadata: (value: unknown, message?: string) => asserts value is PageMetadata = (
  value: unknown,
  message = 'Invalid pagination metadata',
): asserts value is PageMetadata => {
  if (!isPageMetadata(value)) {
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

export const assertInvoiceItemListResponse: (
  value: unknown,
  message?: string,
) => asserts value is InvoiceItemListResponse = (
  value: unknown,
  message = 'Invalid invoice item list response',
): asserts value is InvoiceItemListResponse => {
  if (!isInvoiceItemListResponse(value)) {
    throw new TypeError(message);
  }
};
