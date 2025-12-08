import { describe, it, expect, beforeEach, vi } from 'vitest';

import { listCompanies, getCompany, searchCompanies } from '../../../src/api/companies';
import type { CompaniesApiClient } from '../../../src/api/companies';
import type { CompanyListResponse, Company } from '../../../src/models/companies';

/**
 * Integration tests for Companies API flows.
 * These tests verify complete user journeys with realistic data flows.
 */

describe('Companies API Integration Tests', () => {
  let mockClient: CompaniesApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  const makeCompany = (id: string, nameSuffix = '', updatedDate = '2024-01-01T00:00:00Z'): Company => ({
    id,
    name: `Company ${nameSuffix || id}`,
    address: {},
    phone: '+1-555-0000',
    website: 'https://example.com',
    billOnBehalfOfEnabled: true,
    selfServiceAllowed: true,
    orderApprovalRequired: false,
    status: 'Active',
    updatedDate,
  });

  describe('User Story 1: List Companies with Pagination', () => {
    it('should retrieve first page with default pagination', async () => {
      const mockResponse: CompanyListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeCompany(`comp-${i + 1}`)),
        page: {
          size: 10,
          totalElements: 20,
          totalPages: 2,
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

      expect(result.content).toHaveLength(10);
      expect(result.page.size).toBe(10);
      expect(result.page.totalPages).toBe(2);
    });

    it('should paginate through multiple pages', async () => {
      // First page
      const firstPage: CompanyListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeCompany(`comp-page1-${i + 1}`)),
        page: {
          size: 10,
          totalElements: 20,
          totalPages: 2,
          number: 0,
        },
      };

      // Second page
      const secondPage: CompanyListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeCompany(`comp-page2-${i + 1}`)),
        page: {
          size: 10,
          totalElements: 20,
          totalPages: 2,
          number: 1,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(firstPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(secondPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      // Fetch first page
      const page1 = await listCompanies(mockClient);
      expect(page1.content).toHaveLength(10);
      expect(page1.page.number).toBe(0);

      // Fetch second page using page number
      const page2 = await listCompanies(mockClient, { page: 1, size: 10 });
      expect(page2.content).toHaveLength(10);
      expect(page2.page.number).toBe(1);
    });

    it('should filter companies by status', async () => {
      const mockResponse: CompanyListResponse = {
        content: [makeCompany('comp-active-1', 'Active Company')],
        page: { size: 10, totalElements: 1, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { status: 'Active' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].status).toBe('Active');
    });

    it('should filter companies by region', async () => {
      const mockResponse: CompanyListResponse = {
        content: [makeCompany('comp-us-1', 'US Company')],
        page: { size: 10, totalElements: 1, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { country: 'US' });

      expect(result.content).toHaveLength(1);
    });

    it('should filter companies by updatedSince', async () => {
      const cutoffDate = '2024-06-01T00:00:00Z';
      const mockResponse: CompanyListResponse = {
        content: [makeCompany('comp-recent-1', 'Recently Updated', '2024-07-01T00:00:00Z')],
        page: { size: 10, totalElements: 1, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { page: 0, size: 10, updatedSince: cutoffDate });

      expect(result.content).toHaveLength(1);
      expect(new Date(result.content[0].updatedDate).getTime()).toBeGreaterThan(new Date(cutoffDate).getTime());
    });

    it('should sort companies by name', async () => {
      const mockResponse: CompanyListResponse = {
        content: [makeCompany('comp-a', 'Alpha'), makeCompany('comp-b', 'Beta')],
        page: { size: 10, totalElements: 2, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { sort: 'name' });

      expect(result.content[0].name).toContain('Alpha');
      expect(result.content[1].name).toContain('Beta');
    });

    it('should handle unauthorized error gracefully', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(listCompanies(mockClient)).rejects.toThrow();
    });

    it('should handle empty results with correct pagination metadata', async () => {
      const mockResponse: CompanyListResponse = {
        content: [],
        page: {
          size: 10,
          totalElements: 0,
          totalPages: 0,
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

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });
  });

  describe('User Story 2: View Company Detail', () => {
    it('should retrieve company by ID with all attributes', async () => {
      const mockCompany: Company = {
        id: 'comp-detail-123',
        name: 'Detailed Company LLC',
        address: {
          addressLine1: '123 Main St',
          city: 'Denver',
          stateOrProvince: 'CO',
          postalCode: '80202',
          country: 'US',
        },
        phone: '+1-555-1111',
        website: 'https://detailed.example.com',
        externalId: 'crm-456',
        billOnBehalfOfEnabled: true,
        selfServiceAllowed: true,
        orderApprovalRequired: false,
        status: 'Active',
        updatedDate: '2024-06-15T10:30:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCompany), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getCompany(mockClient, 'comp-detail-123');

      expect(result).toEqual(mockCompany);
      expect(result.address.city).toBe('Denver');
      expect(result.externalId).toBe('crm-456');
    });

    it('should handle not-found error for invalid company ID', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Company not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getCompany(mockClient, 'comp-nonexistent')).rejects.toThrow();
    });

    it('should handle company with minimal optional fields', async () => {
      const mockCompany: Company = {
        id: 'comp-minimal',
        name: 'Minimal Company',
        address: {},
        phone: '+1-555-2222',
        website: 'https://minimal.example.com',
        billOnBehalfOfEnabled: false,
        selfServiceAllowed: false,
        orderApprovalRequired: false,
        status: 'Inactive',
        updatedDate: '2024-01-01T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCompany), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getCompany(mockClient, 'comp-minimal');

      expect(result.id).toBe('comp-minimal');
      expect(result.address).toBeDefined();
    });
  });

  describe('User Story 3: Search Companies', () => {
    it('should search by partial company name with relevance ordering', async () => {
      const mockResponse: CompanyListResponse = {
        content: [makeCompany('comp-acme-1', 'Acme Corp'), makeCompany('comp-acme-2', 'Acme Industries')],
        page: { size: 10, totalElements: 2, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'Acme' });

      expect(result.content).toHaveLength(2);
      expect(result.content[0].name).toContain('Acme');
      expect(result.content[1].name).toContain('Acme');
    });

    it('should search by domain', async () => {
      const mockResponse: CompanyListResponse = {
        content: [makeCompany('comp-example', 'Example Company')],
        page: { size: 10, totalElements: 1, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'example.com' });

      expect(result.content).toHaveLength(1);
    });

    it('should return empty results when no matches found', async () => {
      const mockResponse: CompanyListResponse = {
        content: [],
        page: {
          size: 10,
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'nonexistent-xyz-company' });

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });

    it('should handle search pagination', async () => {
      const firstPage: CompanyListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeCompany(`search-result-${i + 1}`)),
        page: {
          size: 10,
          totalElements: 20,
          totalPages: 2,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(firstPage), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'test', size: 10, page: 0 });

      expect(result.content).toHaveLength(10);
      expect(result.page.totalPages).toBe(2);
    });

    it('should reject query that is too short', async () => {
      await expect(searchCompanies(mockClient, { query: 'a' })).rejects.toThrow();
    });

    it('should reject query that is too long', async () => {
      const longQuery = 'a'.repeat(257);
      await expect(searchCompanies(mockClient, { query: longQuery })).rejects.toThrow();
    });
  });
});
