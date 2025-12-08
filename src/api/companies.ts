import { Company, CompanyListResponse, CompanySearchResponse, CompanyStatus } from '../models/companies';
import { CursorParams, normalizeCursorParams } from '../pagination/cursor';

export type CompaniesSort = 'name' | 'updatedAt';

export interface CompaniesApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

export interface ListCompaniesParams extends CursorParams {
  status?: CompanyStatus;
  region?: string;
  updatedSince?: string;
  sort?: CompaniesSort;
}

export interface SearchCompaniesParams extends CursorParams {
  query: string;
}

const notImplemented = (method: string): never => {
  throw new Error(`${method} not implemented yet`);
};

export const listCompanies = async (
  _client: CompaniesApiClient,
  params: ListCompaniesParams = {},
): Promise<CompanyListResponse> => {
  normalizeCursorParams(params);
  return notImplemented('listCompanies');
};

export const getCompany = async (_client: CompaniesApiClient, companyId: string): Promise<Company> => {
  if (!companyId || typeof companyId !== 'string') {
    throw new TypeError('companyId is required');
  }

  return notImplemented('getCompany');
};

export const searchCompanies = async (
  _client: CompaniesApiClient,
  params: SearchCompaniesParams,
): Promise<CompanySearchResponse> => {
  normalizeCursorParams(params);

  if (!params?.query || typeof params.query !== 'string') {
    throw new TypeError('query is required');
  }

  return notImplemented('searchCompanies');
};
