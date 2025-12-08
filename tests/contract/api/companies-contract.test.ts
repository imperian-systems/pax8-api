import { describe, it, expect, beforeEach, vi } from 'vitest';

import { listCompanies, getCompany, searchCompanies } from '../../../src/api/companies';
import type { CompaniesApiClient } from '../../../src/api/companies';
import type { CompanyListResponse, Company, ErrorResponse } from '../../../src/models/companies';

/**
 * Contract tests for Companies API endpoints.
 * These tests verify request/response structures match the OpenAPI specification.
 */

describe('Companies API Contract Tests', () => {
  let mockClient: CompaniesApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('GET /companies - listCompanies', () => {
    it('should return 200 with valid company list response structure', async () => {
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-123',
            legalName: 'Test Company LLC',
            displayName: 'Test Company',
            status: 'active',
            primaryDomains: ['test.com'],
            primaryContact: {
              name: 'John Doe',
              email: 'john@test.com',
            },
            region: 'US',
            externalReferences: [{ system: 'crm', id: 'ext-123' }],
            tags: ['partner', 'premium'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
        page: {
          nextPageToken: 'token-abc',
          limit: 50,
          hasMore: true,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient);

      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('companyId');
      expect(result.items[0]).toHaveProperty('legalName');
      expect(result.items[0]).toHaveProperty('displayName');
      expect(result.items[0]).toHaveProperty('status');
      expect(result.items[0]).toHaveProperty('createdAt');
      expect(result.items[0]).toHaveProperty('updatedAt');
      expect(result.page).toHaveProperty('limit');
    });

    it('should return 400 for invalid limit parameter', async () => {
      const mockError: ErrorResponse = {
        code: 'validation_error',
        message: 'Limit must be between 1 and 100',
        details: { field: 'limit', value: 200 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(listCompanies(mockClient, { limit: 200 })).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      const mockError: ErrorResponse = {
        code: 'unauthorized',
        message: 'Invalid or expired token',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(listCompanies(mockClient)).rejects.toThrow();
    });

    it('should handle filters (status, region, updatedSince)', async () => {
      const mockResponse: CompanyListResponse = {
        items: [],
        page: { limit: 50 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await listCompanies(mockClient, {
        status: 'active',
        region: 'US',
        updatedSince: '2024-01-01T00:00:00Z',
        sort: 'updatedAt',
      });

      expect(mockClient.request).toHaveBeenCalled();
    });

    it('should handle cursor pagination with pageToken', async () => {
      const mockResponse: CompanyListResponse = {
        items: [],
        page: {
          prevPageToken: 'prev-token',
          limit: 25,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await listCompanies(mockClient, {
        limit: 25,
        pageToken: 'next-token-xyz',
      });

      expect(mockClient.request).toHaveBeenCalled();
    });
  });

  describe('GET /companies/{companyId} - getCompany', () => {
    it('should return 200 with valid company structure', async () => {
      const mockCompany: Company = {
        companyId: 'comp-456',
        legalName: 'Another Company LLC',
        displayName: 'Another Company',
        status: 'active',
        primaryDomains: ['another.com'],
        primaryContact: {
          email: 'contact@another.com',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCompany), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getCompany(mockClient, 'comp-456');

      expect(result).toEqual(mockCompany);
      expect(result).toHaveProperty('companyId', 'comp-456');
      expect(result).toHaveProperty('legalName');
      expect(result).toHaveProperty('displayName');
      expect(result).toHaveProperty('status');
    });

    it('should return 404 for non-existent company', async () => {
      const mockError: ErrorResponse = {
        code: 'not_found',
        message: 'Company not found',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getCompany(mockClient, 'comp-nonexistent')).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      const mockError: ErrorResponse = {
        code: 'unauthorized',
        message: 'Invalid or expired token',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getCompany(mockClient, 'comp-123')).rejects.toThrow();
    });
  });

  describe('GET /companies/search - searchCompanies', () => {
    it('should return 200 with valid search results structure', async () => {
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-789',
            legalName: 'Search Result Company',
            displayName: 'Search Result',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        page: {
          limit: 50,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'Search' });

      expect(result).toEqual(mockResponse);
      expect(result.items).toBeDefined();
      expect(result.page).toBeDefined();
    });

    it('should return 400 for query length validation error (too short)', async () => {
      const mockError: ErrorResponse = {
        code: 'validation_error',
        message: 'Query must be between 2 and 256 characters',
        details: { field: 'query', minLength: 2, maxLength: 256 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(searchCompanies(mockClient, { query: 'a' })).rejects.toThrow();
    });

    it('should return 400 for query length validation error (too long)', async () => {
      const longQuery = 'a'.repeat(257);
      const mockError: ErrorResponse = {
        code: 'validation_error',
        message: 'Query must be between 2 and 256 characters',
        details: { field: 'query', minLength: 2, maxLength: 256 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(searchCompanies(mockClient, { query: longQuery })).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      const mockError: ErrorResponse = {
        code: 'unauthorized',
        message: 'Invalid or expired token',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(searchCompanies(mockClient, { query: 'test' })).rejects.toThrow();
    });

    it('should handle cursor pagination in search', async () => {
      const mockResponse: CompanyListResponse = {
        items: [],
        page: {
          nextPageToken: 'search-next-token',
          limit: 25,
          hasMore: true,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await searchCompanies(mockClient, {
        query: 'test',
        limit: 25,
        pageToken: 'current-page-token',
      });

      expect(mockClient.request).toHaveBeenCalled();
    });
  });
});
