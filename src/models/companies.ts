export const COMPANY_STATUSES = ['active', 'inactive', 'prospect', 'suspended'] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const MIN_PAGE_LIMIT = 1;
export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;

export interface ExternalReference {
  system: string;
  id: string;
}

export interface PrimaryContact {
  name?: string;
  email?: string;
}

export interface Company {
  companyId: string;
  legalName: string;
  displayName: string;
  status: CompanyStatus;
  primaryDomains?: string[];
  primaryContact?: PrimaryContact;
  region?: string;
  externalReferences?: ExternalReference[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMetadata {
  nextPageToken?: string;
  prevPageToken?: string;
  limit: number;
  hasMore?: boolean;
}

export interface CompanyListResponse {
  items: Company[];
  page: PaginationMetadata;
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
const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isDomain = (value: string): boolean => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);

const isOptionalString = (value: unknown): value is string | undefined => value === undefined || isString(value);
const isOptionalStringArray = (value: unknown, itemCheck: (item: string) => boolean = () => true): value is string[] | undefined =>
  value === undefined || (Array.isArray(value) && value.every((item) => isString(item) && itemCheck(item)));

const isPrimaryContact = (value: unknown): value is PrimaryContact => {
  if (value === undefined) {
    return true;
  }

  if (!isObject(value)) {
    return false;
  }

  const { name, email } = value;

  if (!isOptionalString(name)) {
    return false;
  }

  if (email !== undefined) {
    if (!isString(email) || !isEmail(email)) {
      return false;
    }
  }

  return true;
};

const isExternalReference = (value: unknown): value is ExternalReference => {
  if (!isObject(value)) {
    return false;
  }

  return isNonEmptyString(value.system) && isNonEmptyString(value.id);
};

export const isCompanyStatus = (value: unknown): value is CompanyStatus =>
  isString(value) && (COMPANY_STATUSES as readonly string[]).includes(value);

export const isCompany = (value: unknown): value is Company => {
  if (!isObject(value)) {
    return false;
  }

  const {
    companyId,
    legalName,
    displayName,
    status,
    primaryDomains,
    primaryContact,
    region,
    externalReferences,
    tags,
    createdAt,
    updatedAt,
  } = value;

  if (!isNonEmptyString(companyId) || !isNonEmptyString(legalName) || !isNonEmptyString(displayName)) {
    return false;
  }

  if (!isCompanyStatus(status)) {
    return false;
  }

  if (!isIsoDateString(createdAt) || !isIsoDateString(updatedAt)) {
    return false;
  }

  if (!isPrimaryContact(primaryContact)) {
    return false;
  }

  if (!isOptionalString(region)) {
    return false;
  }

  if (!isOptionalStringArray(primaryDomains, isDomain)) {
    return false;
  }

  if (externalReferences !== undefined) {
    if (!Array.isArray(externalReferences) || !externalReferences.every(isExternalReference)) {
      return false;
    }
  }

  if (!isOptionalStringArray(tags)) {
    return false;
  }

  return true;
};

export const isPaginationMetadata = (value: unknown): value is PaginationMetadata => {
  if (!isObject(value)) {
    return false;
  }

  const { nextPageToken, prevPageToken, limit, hasMore } = value;

  if (!isInteger(limit) || limit < MIN_PAGE_LIMIT || limit > MAX_PAGE_LIMIT) {
    return false;
  }

  if (nextPageToken !== undefined && !isString(nextPageToken)) {
    return false;
  }

  if (prevPageToken !== undefined && !isString(prevPageToken)) {
    return false;
  }

  if (hasMore !== undefined && !isBoolean(hasMore)) {
    return false;
  }

  return true;
};

export const isCompanyListResponse = (value: unknown): value is CompanyListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { items, page } = value;

  if (!Array.isArray(items) || !items.every(isCompany)) {
    return false;
  }

  if (!isPaginationMetadata(page)) {
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

export const assertPaginationMetadata: (value: unknown, message?: string) => asserts value is PaginationMetadata = (
  value: unknown,
  message = 'Invalid pagination metadata',
): asserts value is PaginationMetadata => {
  if (!isPaginationMetadata(value)) {
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
