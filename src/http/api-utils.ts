/**
 * Shared utilities for API request/response handling.
 */

/**
 * Handle error responses from API requests.
 * Extracts error message from JSON response or falls back to status text.
 *
 * @param response - The HTTP response object
 * @throws Error with extracted error message
 */
export const handleErrorResponse = async (response: Response): Promise<never> => {
  const contentType = response.headers.get('content-type');
  let errorData: unknown;

  if (contentType?.includes('application/json')) {
    try {
      errorData = await response.json();
    } catch {
      errorData = { code: 'unknown_error', message: response.statusText || 'Unknown error' };
    }
  } else {
    errorData = { code: 'unknown_error', message: response.statusText || 'Unknown error' };
  }

  const errorMessage =
    typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string'
      ? errorData.message
      : response.statusText || 'Unknown error';

  throw new Error(errorMessage);
};

/**
 * Validate and normalize a page number parameter.
 *
 * @param page - The page number to validate (0-indexed)
 * @returns The validated page number, or 0 if undefined
 * @throws TypeError if page is not a non-negative integer
 */
export const validatePage = (page?: number): number => {
  if (page === undefined) {
    return 0;
  }

  if (typeof page !== 'number' || !Number.isInteger(page) || page < 0) {
    throw new TypeError('page must be a non-negative integer');
  }

  return page;
};

/**
 * Validate and normalize a page size parameter.
 *
 * @param size - The page size to validate
 * @param defaultSize - The default size to use if undefined
 * @param minSize - The minimum allowed size
 * @param maxSize - The maximum allowed size
 * @returns The validated page size, or defaultSize if undefined
 * @throws TypeError if size is invalid
 */
export const validateSize = (size: number | undefined, defaultSize: number, minSize: number, maxSize: number): number => {
  if (size === undefined) {
    return defaultSize;
  }

  if (typeof size !== 'number' || !Number.isInteger(size)) {
    throw new TypeError('size must be an integer');
  }

  if (size < minSize || size > maxSize) {
    throw new TypeError(`size must be between ${minSize} and ${maxSize}`);
  }

  return size;
};

/**
 * Validate that a string ID is non-empty.
 *
 * @param id - The ID to validate
 * @param paramName - The name of the parameter (for error messages)
 * @throws TypeError if the ID is not a non-empty string
 */
export function validateNonEmptyString(id: unknown, paramName: string): asserts id is string {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new TypeError(`${paramName} is required and must be a non-empty string`);
  }
}
