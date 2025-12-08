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

  describe('User Story 1: List Companies with Pagination', () => {
    it('should retrieve first page with default pagination', async () => {
      const mockResponse: CompanyListResponse = {
        items: Array.from({ length: 50 }, (_, i) => ({
          companyId: `comp-${i + 1}`,
          legalName: `Company ${i + 1} LLC`,
          displayName: `Company ${i + 1}`,
          status: 'active' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })),
        page: {
          nextPageToken: 'next-page-token-1',
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

      expect(result.items).toHaveLength(50);
      expect(result.page.limit).toBe(50);
      expect(result.page.nextPageToken).toBe('next-page-token-1');
      expect(result.page.hasMore).toBe(true);
    });

    it('should paginate through multiple pages', async () => {
      // First page
      const firstPage: CompanyListResponse = {
        items: Array.from({ length: 50 }, (_, i) => ({
          companyId: `comp-page1-${i + 1}`,
          legalName: `Page 1 Company ${i + 1}`,
          displayName: `Page 1 Company ${i + 1}`,
          status: 'active' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })),
        page: {
          nextPageToken: 'page-2-token',
          limit: 50,
          hasMore: true,
        },
      };

      // Second page
      const secondPage: CompanyListResponse = {
        items: Array.from({ length: 30 }, (_, i) => ({
          companyId: `comp-page2-${i + 1}`,
          legalName: `Page 2 Company ${i + 1}`,
          displayName: `Page 2 Company ${i + 1}`,
          status: 'active' as const,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        })),
        page: {
          prevPageToken: 'page-1-token',
          limit: 50,
          hasMore: false,
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
      expect(page1.items).toHaveLength(50);
      expect(page1.page.hasMore).toBe(true);

      // Fetch second page using token
      const page2 = await listCompanies(mockClient, { pageToken: page1.page.nextPageToken });
      expect(page2.items).toHaveLength(30);
      expect(page2.page.hasMore).toBe(false);
    });

    it('should filter companies by status', async () => {
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-active-1',
            legalName: 'Active Company',
            displayName: 'Active Company',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        page: { limit: 50 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { status: 'active' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('active');
    });

    it('should filter companies by region', async () => {
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-us-1',
            legalName: 'US Company',
            displayName: 'US Company',
            status: 'active',
            region: 'US',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        page: { limit: 50 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { region: 'US' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].region).toBe('US');
    });

    it('should filter companies by updatedSince', async () => {
      const cutoffDate = '2024-06-01T00:00:00Z';
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-recent-1',
            legalName: 'Recently Updated Company',
            displayName: 'Recently Updated',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-06-15T00:00:00Z',
          },
        ],
        page: { limit: 50 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { updatedSince: cutoffDate });

      expect(result.items).toHaveLength(1);
      expect(new Date(result.items[0].updatedAt).getTime()).toBeGreaterThan(new Date(cutoffDate).getTime());
    });

    it('should sort companies by name', async () => {
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-a',
            legalName: 'Alpha Company',
            displayName: 'Alpha',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            companyId: 'comp-b',
            legalName: 'Beta Company',
            displayName: 'Beta',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        page: { limit: 50 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient, { sort: 'name' });

      expect(result.items[0].displayName).toBe('Alpha');
      expect(result.items[1].displayName).toBe('Beta');
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
        items: [],
        page: {
          limit: 50,
          hasMore: false,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listCompanies(mockClient);

      expect(result.items).toHaveLength(0);
      expect(result.page.hasMore).toBe(false);
    });
  });

  describe('User Story 2: View Company Detail', () => {
    it('should retrieve company by ID with all attributes', async () => {
      const mockCompany: Company = {
        companyId: 'comp-detail-123',
        legalName: 'Detailed Company LLC',
        displayName: 'Detailed Company',
        status: 'active',
        primaryDomains: ['detailed.com', 'detail.net'],
        primaryContact: {
          name: 'Jane Smith',
          email: 'jane@detailed.com',
        },
        region: 'EU',
        externalReferences: [
          { system: 'crm', id: 'crm-456' },
          { system: 'erp', id: 'erp-789' },
        ],
        tags: ['partner', 'enterprise', 'verified'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-15T10:30:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCompany), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getCompany(mockClient, 'comp-detail-123');

      expect(result).toEqual(mockCompany);
      expect(result.primaryDomains).toHaveLength(2);
      expect(result.primaryContact?.name).toBe('Jane Smith');
      expect(result.externalReferences).toHaveLength(2);
      expect(result.tags).toHaveLength(3);
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
        companyId: 'comp-minimal',
        legalName: 'Minimal Company',
        displayName: 'Minimal',
        status: 'prospect',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCompany), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getCompany(mockClient, 'comp-minimal');

      expect(result.companyId).toBe('comp-minimal');
      expect(result.primaryDomains).toBeUndefined();
      expect(result.primaryContact).toBeUndefined();
      expect(result.region).toBeUndefined();
    });
  });

  describe('User Story 3: Search Companies', () => {
    it('should search by partial company name with relevance ordering', async () => {
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-acme-1',
            legalName: 'Acme Corporation',
            displayName: 'Acme Corp',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            companyId: 'comp-acme-2',
            legalName: 'Acme Industries LLC',
            displayName: 'Acme Industries',
            status: 'active',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
        page: { limit: 50 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'Acme' });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].displayName).toContain('Acme');
      expect(result.items[1].displayName).toContain('Acme');
    });

    it('should search by domain', async () => {
      const mockResponse: CompanyListResponse = {
        items: [
          {
            companyId: 'comp-example',
            legalName: 'Example Company',
            displayName: 'Example',
            status: 'active',
            primaryDomains: ['example.com'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        page: { limit: 50 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'example.com' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].primaryDomains).toContain('example.com');
    });

    it('should return empty results when no matches found', async () => {
      const mockResponse: CompanyListResponse = {
        items: [],
        page: {
          limit: 50,
          hasMore: false,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'nonexistent-xyz-company' });

      expect(result.items).toHaveLength(0);
      expect(result.page.hasMore).toBe(false);
    });

    it('should handle search pagination', async () => {
      const firstPage: CompanyListResponse = {
        items: Array.from({ length: 25 }, (_, i) => ({
          companyId: `search-result-${i + 1}`,
          legalName: `Result ${i + 1}`,
          displayName: `Result ${i + 1}`,
          status: 'active' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })),
        page: {
          nextPageToken: 'search-page-2',
          limit: 25,
          hasMore: true,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(firstPage), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await searchCompanies(mockClient, { query: 'test', limit: 25 });

      expect(result.items).toHaveLength(25);
      expect(result.page.nextPageToken).toBe('search-page-2');
      expect(result.page.hasMore).toBe(true);
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
