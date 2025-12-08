export const COMPANY_STATUSES = ['Active', 'Inactive', 'Deleted'] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export interface CompanyAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
}

export interface Company {
  id: string;
  name: string;
  address: CompanyAddress;
  phone: string;
  website: string;
  externalId?: string;
  billOnBehalfOfEnabled: boolean;
  selfServiceAllowed: boolean;
  orderApprovalRequired: boolean;
  status: CompanyStatus;
  updatedDate: string;
}

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface CompanyListResponse {
  content: Company[];
  page: PageMetadata;
}

export type CompanySearchResponse = CompanyListResponse;

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim().length > 0;
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);

const isIsoDateString = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));

const isOptionalString = (value: unknown): value is string | undefined => value === undefined || isString(value);

const isCompanyAddress = (value: unknown): value is CompanyAddress => {
  if (!isObject(value)) {
    return false;
  }

  const { addressLine1, addressLine2, city, stateOrProvince, postalCode, country } = value;

  return (
    isOptionalString(addressLine1) &&
    isOptionalString(addressLine2) &&
    isOptionalString(city) &&
    isOptionalString(stateOrProvince) &&
    isOptionalString(postalCode) &&
    isOptionalString(country)
  );
};

export const isCompanyStatus = (value: unknown): value is CompanyStatus =>
  isString(value) && (COMPANY_STATUSES as readonly string[]).includes(value);

export const isCompany = (value: unknown): value is Company => {
  if (!isObject(value)) {
    return false;
  }

  const {
    id,
    name,
    address,
    phone,
    website,
    externalId,
    billOnBehalfOfEnabled,
    selfServiceAllowed,
    orderApprovalRequired,
    status,
    updatedDate,
  } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(name)) {
    return false;
  }

  if (!isCompanyAddress(address)) {
    return false;
  }

  if (!isNonEmptyString(phone) || !isNonEmptyString(website)) {
    return false;
  }

  if (externalId !== undefined && !isNonEmptyString(externalId)) {
    return false;
  }

  if (!isBoolean(billOnBehalfOfEnabled) || !isBoolean(selfServiceAllowed) || !isBoolean(orderApprovalRequired)) {
    return false;
  }

  if (!isCompanyStatus(status)) {
    return false;
  }

  if (!isIsoDateString(updatedDate)) {
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

export const isCompanyListResponse = (value: unknown): value is CompanyListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isCompany)) {
    return false;
  }

  if (!isPageMetadata(page)) {
    return false;
  }

  return true;
};

export const isCompanySearchResponse = (value: unknown): value is CompanySearchResponse => isCompanyListResponse(value);

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

export const assertCompany: (value: unknown, message?: string) => asserts value is Company = (
  value: unknown,
  message = 'Invalid company payload',
): asserts value is Company => {
  if (!isCompany(value)) {
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

export const assertCompanyListResponse: (value: unknown, message?: string) => asserts value is CompanyListResponse = (
  value: unknown,
  message = 'Invalid company list response',
): asserts value is CompanyListResponse => {
  if (!isCompanyListResponse(value)) {
    throw new TypeError(message);
  }
};

export const assertCompanySearchResponse: (value: unknown, message?: string) => asserts value is CompanySearchResponse = (
  value: unknown,
  message = 'Invalid company search response',
): asserts value is CompanySearchResponse => {
  if (!isCompanySearchResponse(value)) {
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
