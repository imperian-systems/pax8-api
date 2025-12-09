export const COMPANY_STATUSES = ['Active', 'Inactive', 'Deleted'] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export interface CompanyAddress {
  street?: string;
  street2?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
}

export interface Company {
  id: string;
  name: string;
  address: CompanyAddress;
  phone?: string;
  website?: string;
  externalId?: string;
  billOnBehalfOfEnabled: boolean;
  selfServiceAllowed: boolean;
  orderApprovalRequired: boolean;
  status: CompanyStatus;
  updatedDate?: string;
}

export interface CreateCompanyRequest {
  name: string;
  address: CompanyAddress;
  phone?: string;
  website?: string;
  externalId?: string;
  billOnBehalfOfEnabled: boolean;
  selfServiceAllowed: boolean;
  orderApprovalRequired: boolean;
}

export interface UpdateCompanyRequest {
  name?: string;
  address?: CompanyAddress;
  phone?: string;
  website?: string;
  externalId?: string;
  billOnBehalfOfEnabled?: boolean;
  selfServiceAllowed?: boolean;
  orderApprovalRequired?: boolean;
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
const isOptionalBoolean = (value: unknown): value is boolean | undefined => value === undefined || isBoolean(value);

const hasAtLeastOneKey = (value: Record<string, unknown>): boolean => Object.keys(value).length > 0;

const isCompanyAddress = (value: unknown): value is CompanyAddress => {
  if (!isObject(value)) {
    return false;
  }

  const { street, street2, city, stateOrProvince, postalCode, country } = value;

  return (
    isOptionalString(street) &&
    isOptionalString(street2) &&
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

  if (phone !== undefined && !isString(phone)) {
    return false;
  }

  if (website !== undefined && !isString(website)) {
    return false;
  }

  if (externalId !== undefined && !isString(externalId)) {
    return false;
  }

  if (!isBoolean(billOnBehalfOfEnabled) || !isBoolean(selfServiceAllowed) || !isBoolean(orderApprovalRequired)) {
    return false;
  }

  if (!isCompanyStatus(status)) {
    return false;
  }

  if (updatedDate !== undefined && !isIsoDateString(updatedDate)) {
    return false;
  }

  return true;
};

export const isCreateCompanyRequest = (value: unknown): value is CreateCompanyRequest => {
  if (!isObject(value)) {
    return false;
  }

  const {
    name,
    address,
    phone,
    website,
    externalId,
    billOnBehalfOfEnabled,
    selfServiceAllowed,
    orderApprovalRequired,
  } = value;

  if (!isNonEmptyString(name)) return false;
  if (!isCompanyAddress(address)) return false;

  if (phone !== undefined && !isString(phone)) return false;
  if (website !== undefined && !isString(website)) return false;
  if (externalId !== undefined && !isString(externalId)) return false;

  if (!isBoolean(billOnBehalfOfEnabled)) return false;
  if (!isBoolean(selfServiceAllowed)) return false;
  if (!isBoolean(orderApprovalRequired)) return false;

  return true;
};

export const isUpdateCompanyRequest = (value: unknown): value is UpdateCompanyRequest => {
  if (!isObject(value)) {
    return false;
  }

  const allowedKeys: Array<keyof UpdateCompanyRequest> = [
    'name',
    'address',
    'phone',
    'website',
    'externalId',
    'billOnBehalfOfEnabled',
    'selfServiceAllowed',
    'orderApprovalRequired',
  ];

  // ensure no unexpected keys
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key as keyof UpdateCompanyRequest)) {
      return false;
    }
  }

  if (!hasAtLeastOneKey(value)) {
    return false;
  }

  const {
    name,
    address,
    phone,
    website,
    externalId,
    billOnBehalfOfEnabled,
    selfServiceAllowed,
    orderApprovalRequired,
  } = value as UpdateCompanyRequest;

  if (name !== undefined && !isNonEmptyString(name)) return false;
  if (address !== undefined && !isCompanyAddress(address)) return false;
  if (phone !== undefined && !isString(phone)) return false;
  if (website !== undefined && !isString(website)) return false;
  if (externalId !== undefined && !isString(externalId)) return false;

  if (!isOptionalBoolean(billOnBehalfOfEnabled)) return false;
  if (!isOptionalBoolean(selfServiceAllowed)) return false;
  if (!isOptionalBoolean(orderApprovalRequired)) return false;

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

export const assertCreateCompanyRequest: (value: unknown, message?: string) => asserts value is CreateCompanyRequest = (
  value: unknown,
  message = 'Invalid create company request',
): asserts value is CreateCompanyRequest => {
  if (!isCreateCompanyRequest(value)) {
    throw new TypeError(message);
  }
};

export const assertUpdateCompanyRequest: (value: unknown, message?: string) => asserts value is UpdateCompanyRequest = (
  value: unknown,
  message = 'Invalid update company request',
): asserts value is UpdateCompanyRequest => {
  if (!isUpdateCompanyRequest(value)) {
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
