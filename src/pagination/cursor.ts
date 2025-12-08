import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT, MIN_PAGE_LIMIT, PaginationMetadata } from '../models/companies';

export interface CursorParams {
  limit?: number;
  pageToken?: string;
}

export interface NormalizedCursorParams {
  limit: number;
  pageToken?: string;
}

export const normalizeLimit = (limit?: number): number => {
  if (limit === undefined || limit === null) {
    return DEFAULT_PAGE_LIMIT;
  }

  if (!Number.isInteger(limit)) {
    throw new TypeError('limit must be an integer');
  }

  if (limit < MIN_PAGE_LIMIT || limit > MAX_PAGE_LIMIT) {
    throw new TypeError(`limit must be between ${MIN_PAGE_LIMIT} and ${MAX_PAGE_LIMIT}`);
  }

  return limit;
};

export const normalizeCursorParams = (params: CursorParams = {}): NormalizedCursorParams => {
  const limit = normalizeLimit(params.limit);
  const pageToken = params.pageToken?.trim();

  return {
    limit,
    pageToken: pageToken || undefined,
  };
};

export const appendCursorParams = (params: CursorParams, search: URLSearchParams): URLSearchParams => {
  const normalized = normalizeCursorParams(params);

  search.set('limit', normalized.limit.toString());

  if (normalized.pageToken) {
    search.set('pageToken', normalized.pageToken);
  }

  return search;
};

export const hasMorePages = (page?: PaginationMetadata): boolean =>
  Boolean(page?.nextPageToken || page?.hasMore);
