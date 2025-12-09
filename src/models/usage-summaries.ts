export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

/**
 * Usage summary for a subscription.
 * Aggregates usage data for a specific product within a subscription.
 * @see https://devx.pax8.com/openapi/6463f53f2c9755000aaf50be - UsageSummary schema
 */
export interface UsageSummary {
  /** Unique identifier for the usage summary */
  id: string;

  /** Company ID associated with this usage */
  companyId: string;

  /** Product ID for the usage */
  productId: string;

  /** Resource group name (e.g., "Office 365 E3") */
  resourceGroup: string;

  /** Vendor name (e.g., "Microsoft") */
  vendorName: string;

  /** Current charges for this usage period */
  currentCharges: number;

  /** ISO 4217 currency code (e.g., "USD") */
  currencyCode: string;

  /** Partner's total amount */
  partnerTotal: number;

  /** Whether this is a trial subscription */
  isTrial: boolean;
}

/**
 * Individual usage line item within a usage summary.
 * Contains detailed usage data for a specific date.
 * @see https://devx.pax8.com/openapi/6463f53f2c9755000aaf50be - UsageLine schema
 */
export interface UsageLine {
  /** ID of the parent usage summary */
  usageSummaryId: string;

  /** Date of the usage (ISO 8601 format) */
  usageDate: string;

  /** Product name for this line item */
  productName: string;

  /** Product ID */
  productId: string;

  /** Unit of measure (e.g., "User", "GB") */
  unitOfMeasure: string;

  /** Quantity consumed */
  quantity: number;

  /** Current charges for this line */
  currentCharges: number;

  /** Current profit for partner */
  currentProfit: number;

  /** Partner's total for this line */
  partnerTotal: number;

  /** Unit price */
  unitPrice: number;

  /** ISO 4217 currency code */
  currencyCode: string;

  /** Whether this is from a trial subscription */
  isTrial: boolean;
}

/**
 * Options for listing usage summaries.
 * Extends standard pagination options.
 */
export interface ListUsageSummariesOptions {
  /** Page number (0-indexed) */
  page?: number;

  /** Page size (1-200, default varies by endpoint) */
  size?: number;

  /** Sort field */
  sort?: string;
}

/**
 * Options for listing usage lines.
 * Note: usageDate is REQUIRED by the Pax8 API.
 */
export interface ListUsageLinesOptions {
  /**
   * Date for which to retrieve usage lines (ISO 8601 format).
   * REQUIRED - API returns 400 without this parameter.
   */
  usageDate: string;

  /** Page number (0-indexed) */
  page?: number;

  /** Page size (1-200) */
  size?: number;

  /** Sort field */
  sort?: string;
}

/** Page metadata for pagination */
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

/** Response type for listing usage summaries */
export interface UsageSummaryListResponse {
  content: UsageSummary[];
  page: PageMetadata;
}

/** Response type for listing usage lines */
export interface UsageLineListResponse {
  content: UsageLine[];
  page: PageMetadata;
}

// Type guard helper functions
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isIsoDateString = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));

/**
 * Type guard for UsageSummary
 */
export const isUsageSummary = (value: unknown): value is UsageSummary => {
  if (!isObject(value)) {
    return false;
  }

  const { id, companyId, productId, resourceGroup, vendorName, currentCharges, currencyCode, partnerTotal, isTrial } =
    value;

  if (!isNonEmptyString(id) || !isNonEmptyString(companyId) || !isNonEmptyString(productId)) {
    return false;
  }

  if (!isNonEmptyString(resourceGroup) || !isNonEmptyString(vendorName)) {
    return false;
  }

  if (!isNumber(currentCharges) || !isNumber(partnerTotal)) {
    return false;
  }

  if (!isNonEmptyString(currencyCode)) {
    return false;
  }

  if (!isBoolean(isTrial)) {
    return false;
  }

  return true;
};

/**
 * Assertion function for UsageSummary
 */
export const assertUsageSummary: (value: unknown, message?: string) => asserts value is UsageSummary = (
  value: unknown,
  message = 'Invalid usage summary payload',
): asserts value is UsageSummary => {
  if (!isUsageSummary(value)) {
    throw new TypeError(message);
  }
};

/**
 * Type guard for UsageLine
 */
export const isUsageLine = (value: unknown): value is UsageLine => {
  if (!isObject(value)) {
    return false;
  }

  const {
    usageSummaryId,
    usageDate,
    productName,
    productId,
    unitOfMeasure,
    quantity,
    currentCharges,
    currentProfit,
    partnerTotal,
    unitPrice,
    currencyCode,
    isTrial,
  } = value;

  if (!isNonEmptyString(usageSummaryId) || !isNonEmptyString(productId) || !isNonEmptyString(productName)) {
    return false;
  }

  if (!isIsoDateString(usageDate)) {
    return false;
  }

  if (!isNonEmptyString(unitOfMeasure)) {
    return false;
  }

  if (
    !isNumber(quantity) ||
    !isNumber(currentCharges) ||
    !isNumber(currentProfit) ||
    !isNumber(partnerTotal) ||
    !isNumber(unitPrice)
  ) {
    return false;
  }

  if (!isNonEmptyString(currencyCode)) {
    return false;
  }

  if (!isBoolean(isTrial)) {
    return false;
  }

  return true;
};

/**
 * Assertion function for UsageLine
 */
export const assertUsageLine: (value: unknown, message?: string) => asserts value is UsageLine = (
  value: unknown,
  message = 'Invalid usage line payload',
): asserts value is UsageLine => {
  if (!isUsageLine(value)) {
    throw new TypeError(message);
  }
};

/**
 * Type guard for PageMetadata
 */
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

/**
 * Assertion function for PageMetadata
 */
export const assertPageMetadata: (value: unknown, message?: string) => asserts value is PageMetadata = (
  value: unknown,
  message = 'Invalid pagination metadata',
): asserts value is PageMetadata => {
  if (!isPageMetadata(value)) {
    throw new TypeError(message);
  }
};

/**
 * Type guard for UsageSummaryListResponse
 */
export const isUsageSummaryListResponse = (value: unknown): value is UsageSummaryListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isUsageSummary)) {
    return false;
  }

  if (!isPageMetadata(page)) {
    return false;
  }

  return true;
};

/**
 * Assertion function for UsageSummaryListResponse
 */
export const assertUsageSummaryListResponse: (
  value: unknown,
  message?: string,
) => asserts value is UsageSummaryListResponse = (
  value: unknown,
  message = 'Invalid usage summary list response',
): asserts value is UsageSummaryListResponse => {
  if (!isUsageSummaryListResponse(value)) {
    throw new TypeError(message);
  }
};

/**
 * Type guard for UsageLineListResponse
 */
export const isUsageLineListResponse = (value: unknown): value is UsageLineListResponse => {
  if (!isObject(value)) {
    return false;
  }

  const { content, page } = value;

  if (!Array.isArray(content) || !content.every(isUsageLine)) {
    return false;
  }

  if (!isPageMetadata(page)) {
    return false;
  }

  return true;
};

/**
 * Assertion function for UsageLineListResponse
 */
export const assertUsageLineListResponse: (
  value: unknown,
  message?: string,
) => asserts value is UsageLineListResponse = (
  value: unknown,
  message = 'Invalid usage line list response',
): asserts value is UsageLineListResponse => {
  if (!isUsageLineListResponse(value)) {
    throw new TypeError(message);
  }
};
