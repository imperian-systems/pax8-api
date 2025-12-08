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
        content: [
          {
            id: 'comp-123',
            name: 'Test Company LLC',
            address: { city: 'Denver', country: 'US' },
            phone: '+1-555-1234',
            website: 'https://test.com',
            externalId: 'ext-123',
            billOnBehalfOfEnabled: true,
            selfServiceAllowed: false,
            orderApprovalRequired: true,
            status: 'Active',
            updatedDate: '2024-01-02T00:00:00Z',
          },
        ],
        page: {
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0,
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
      expect(result.content).toHaveLength(1);
      expect(result.page.size).toBe(10);
    });

    it('should return 400 for invalid size parameter', async () => {
      const mockError: ErrorResponse = {
        code: 'validation_error',
        message: 'size must be between 1 and 200',
        details: { field: 'size', value: 500 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockError), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(listCompanies(mockClient, { size: 500 })).rejects.toThrow();
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
        content: [],
        page: { size: 10, totalElements: 0, totalPages: 0, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await listCompanies(mockClient, {
        status: 'Active',
        city: 'Denver',
        country: 'US',
        stateOrProvince: 'CO',
        postalCode: '80202',
        sort: 'name,desc',
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
        content: [
          {
            id: 'comp-789',
            name: 'Search Result Company',
            address: {},
            phone: '+1-555-0000',
            website: 'https://example.com',
            billOnBehalfOfEnabled: true,
            selfServiceAllowed: true,
            orderApprovalRequired: false,
            status: 'Active',
            updatedDate: '2024-01-01T00:00:00Z',
          },
        ],
        page: {
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0,
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
      expect(result.content).toBeDefined();
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

    it('should handle page-based pagination in search', async () => {
      const mockResponse: CompanyListResponse = {
        content: [],
        page: {
          size: 25,
          totalElements: 50,
          totalPages: 2,
          number: 1,
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
        size: 25,
        page: 1,
      });

      expect(mockClient.request).toHaveBeenCalled();
    });
  });
});
