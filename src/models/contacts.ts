export const CONTACT_TYPES = ['Admin', 'Billing', 'Technical'] as const;
export type ContactTypeEnum = (typeof CONTACT_TYPES)[number];

export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export interface ContactType {
  type: ContactTypeEnum;
  primary: boolean;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  types?: ContactType[];
  createdDate: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  types?: ContactType[];
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  types?: ContactType[];
}

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ContactListResponse {
  content: Contact[];
  page: PageMetadata;
}

export interface ListContactsParams {
  companyId: string;
  page?: number;
  size?: number;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Type guard utilities
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim().length > 0;
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isIsoDateString = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const isOptionalString = (value: unknown): value is string | undefined => value === undefined || isString(value);

export const isContactTypeEnum = (value: unknown): value is ContactTypeEnum =>
  isString(value) && (CONTACT_TYPES as readonly string[]).includes(value);

export const isContactType = (value: unknown): value is ContactType => {
  if (!isObject(value)) {
    return false;
  }

  const { type, primary } = value;

  if (!isContactTypeEnum(type)) {
    return false;
  }

  if (!isBoolean(primary)) {
    return false;
  }

  return true;
};

const isOptionalContactTypeArray = (value: unknown): value is ContactType[] | undefined =>
  value === undefined || (Array.isArray(value) && value.every(isContactType));

export const isContact = (value: unknown): value is Contact => {
  if (!isObject(value)) {
    return false;
  }

  const { id, firstName, lastName, email, phone, types, createdDate } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    return false;
  }

  if (!isNonEmptyString(email) || !isEmail(email)) {
    return false;
  }

  if (!isOptionalString(phone)) {
    return false;
  }

  if (!isOptionalContactTypeArray(types)) {
    return false;
  }

  if (!isIsoDateString(createdDate)) {
    return false;
  }

  return true;
};

export const isCreateContactRequest = (value: unknown): value is CreateContactRequest => {
  if (!isObject(value)) {
    return false;
  }

  const { firstName, lastName, email, phone, types } = value;

  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    return false;
  }

  if (!isNonEmptyString(email) || !isEmail(email)) {
    return false;
  }

  if (!isOptionalString(phone)) {
    return false;
  }

  if (!isOptionalContactTypeArray(types)) {
    return false;
  }

  return true;
};

export const isUpdateContactRequest = (value: unknown): value is UpdateContactRequest => {
  if (!isObject(value)) {
    return false;
  }

  const { firstName, lastName, email, phone, types } = value;

  if (firstName !== undefined && !isNonEmptyString(firstName)) {
    return false;
  }

  if (lastName !== undefined && !isNonEmptyString(lastName)) {
    return false;
  }

  if (email !== undefined) {
    if (!isNonEmptyString(email) || !isEmail(email)) {
      return false;
    }
  }

  if (!isOptionalString(phone)) {
    return false;
  }

  if (!isOptionalContactTypeArray(types)) {
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

export const isContactListResponse = (value: unknown): value is ContactListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isContact)) {
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
export const assertContact: (value: unknown, message?: string) => asserts value is Contact = (
  value: unknown,
  message = 'Invalid contact payload',
): asserts value is Contact => {
  if (!isContact(value)) {
    throw new TypeError(message);
  }
};

export const assertContactListResponse: (value: unknown, message?: string) => asserts value is ContactListResponse = (
  value: unknown,
  message = 'Invalid contact list response',
): asserts value is ContactListResponse => {
  if (!isContactListResponse(value)) {
    throw new TypeError(message);
  }
};

export const assertPageMetadata: (value: unknown, message?: string) => asserts value is PageMetadata = (
  value: unknown,
  message = 'Invalid page metadata',
): asserts value is PageMetadata => {
  if (!isPageMetadata(value)) {
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

export const assertCreateContactRequest: (value: unknown, message?: string) => asserts value is CreateContactRequest = (
  value: unknown,
  message = 'Invalid create contact request',
): asserts value is CreateContactRequest => {
  if (!isCreateContactRequest(value)) {
    throw new TypeError(message);
  }
};

export const assertUpdateContactRequest: (value: unknown, message?: string) => asserts value is UpdateContactRequest = (
  value: unknown,
  message = 'Invalid update contact request',
): asserts value is UpdateContactRequest => {
  if (!isUpdateContactRequest(value)) {
    throw new TypeError(message);
  }
};
