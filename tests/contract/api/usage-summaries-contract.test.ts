import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SubscriptionsApiClient } from '../../../src/api/subscriptions';
import type { UsageSummariesApiClient } from '../../../src/api/usage-summaries';
import type {
  UsageSummary,
  UsageSummaryListResponse,
  UsageLineListResponse,
} from '../../../src/models/usage-summaries';

/**
 * Contract tests for Usage Summaries API endpoints.
 * These tests verify request/response structures match the OpenAPI specification.
 */

describe('Usage Summaries API Contract Tests', () => {
  describe('User Story 1: List usage summaries for a subscription', () => {
    let mockClient: SubscriptionsApiClient;

    beforeEach(() => {
      mockClient = {
        request: vi.fn(),
      };
    });

    it('T010: should return 200 with valid usage summary list response structure', async () => {
      const mockResponse: UsageSummaryListResponse = {
        content: [
          {
            id: 'usage-summary-123',
            companyId: 'company-456',
            productId: 'product-789',
            resourceGroup: 'Office 365 E3',
            vendorName: 'Microsoft',
            currentCharges: 150.5,
            currencyCode: 'USD',
            partnerTotal: 120.0,
            isTrial: false,
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
        }),
      );

      // This will be implemented in T015
      const { listUsageSummaries } = await import('../../../src/api/subscriptions');
      const result = await listUsageSummaries(mockClient, 'subscription-123');

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        id: expect.any(String),
        companyId: expect.any(String),
        productId: expect.any(String),
        resourceGroup: expect.any(String),
        vendorName: expect.any(String),
        currentCharges: expect.any(Number),
        currencyCode: expect.any(String),
        partnerTotal: expect.any(Number),
        isTrial: expect.any(Boolean),
      });
    });

    it('T011: should handle pagination parameters (page, size)', async () => {
      const mockResponse: UsageSummaryListResponse = {
        content: [],
        page: { size: 20, totalElements: 50, totalPages: 3, number: 1 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const { listUsageSummaries } = await import('../../../src/api/subscriptions');
      const result = await listUsageSummaries(mockClient, 'subscription-123', { page: 1, size: 20 });

      expect(mockClient.request).toHaveBeenCalledWith('/subscriptions/subscription-123/usage-summaries?page=1&size=20', {
        method: 'GET',
      });
      expect(result.page.number).toBe(1);
      expect(result.page.size).toBe(20);
    });

    it('T012: should handle sort parameter', async () => {
      const mockResponse: UsageSummaryListResponse = {
        content: [],
        page: { size: 10, totalElements: 0, totalPages: 0, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const { listUsageSummaries } = await import('../../../src/api/subscriptions');
      await listUsageSummaries(mockClient, 'subscription-123', { sort: 'resourceGroup,asc' });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/subscriptions/subscription-123/usage-summaries?page=0&size=10&sort=resourceGroup%2Casc',
        { method: 'GET' },
      );
    });

    it('T013: should handle error responses (404, 401)', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Subscription not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const { listUsageSummaries } = await import('../../../src/api/subscriptions');
      await expect(listUsageSummaries(mockClient, 'invalid-id')).rejects.toThrow();
    });
  });

  describe('User Story 2: View usage summary details', () => {
    let mockClient: UsageSummariesApiClient;

    beforeEach(() => {
      mockClient = {
        request: vi.fn(),
      };
    });

    it('T018: should return 200 with valid usage summary structure', async () => {
      const mockResponse: UsageSummary = {
        id: 'usage-summary-123',
        companyId: 'company-456',
        productId: 'product-789',
        resourceGroup: 'Office 365 E3',
        vendorName: 'Microsoft',
        currentCharges: 150.5,
        currencyCode: 'USD',
        partnerTotal: 120.0,
        isTrial: false,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // This will be implemented in T020
      const { getUsageSummary } = await import('../../../src/api/usage-summaries');
      const result = await getUsageSummary(mockClient, 'usage-summary-123');

      expect(result).toEqual(mockResponse);
      expect(result).toMatchObject({
        id: expect.any(String),
        companyId: expect.any(String),
        productId: expect.any(String),
        resourceGroup: expect.any(String),
        vendorName: expect.any(String),
        currentCharges: expect.any(Number),
        currencyCode: expect.any(String),
        partnerTotal: expect.any(Number),
        isTrial: expect.any(Boolean),
      });
    });

    it('T019: should handle 404 error when usage summary not found', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Usage summary not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const { getUsageSummary } = await import('../../../src/api/usage-summaries');
      await expect(getUsageSummary(mockClient, 'invalid-id')).rejects.toThrow();
    });
  });

  describe('User Story 3: List usage summary lines', () => {
    let mockClient: UsageSummariesApiClient;

    beforeEach(() => {
      mockClient = {
        request: vi.fn(),
      };
    });

    it('T023: should return 200 with valid usage lines response when usageDate provided', async () => {
      const mockResponse: UsageLineListResponse = {
        content: [
          {
            usageSummaryId: 'usage-summary-123',
            usageDate: '2024-01-15',
            productName: 'Microsoft 365 E3',
            productId: 'product-789',
            unitOfMeasure: 'User',
            quantity: 10,
            currentCharges: 150.0,
            currentProfit: 30.0,
            partnerTotal: 120.0,
            unitPrice: 15.0,
            currencyCode: 'USD',
            isTrial: false,
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
        }),
      );

      // This will be implemented in T029
      const { listUsageLines } = await import('../../../src/api/usage-summaries');
      const result = await listUsageLines(mockClient, 'usage-summary-123', { usageDate: '2024-01-15' });

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        usageSummaryId: expect.any(String),
        usageDate: expect.any(String),
        productName: expect.any(String),
        productId: expect.any(String),
        unitOfMeasure: expect.any(String),
        quantity: expect.any(Number),
        currentCharges: expect.any(Number),
        currentProfit: expect.any(Number),
        partnerTotal: expect.any(Number),
        unitPrice: expect.any(Number),
        currencyCode: expect.any(String),
        isTrial: expect.any(Boolean),
      });
    });

    it('T024: should handle pagination parameters for usage lines', async () => {
      const mockResponse: UsageLineListResponse = {
        content: [],
        page: { size: 50, totalElements: 100, totalPages: 2, number: 1 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const { listUsageLines } = await import('../../../src/api/usage-summaries');
      const result = await listUsageLines(mockClient, 'usage-summary-123', {
        usageDate: '2024-01-15',
        page: 1,
        size: 50,
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/usage-summaries/usage-summary-123/usage-lines?page=1&size=50&usageDate=2024-01-15',
        { method: 'GET' },
      );
      expect(result.page.number).toBe(1);
      expect(result.page.size).toBe(50);
    });

    it('T025: should handle sort parameter for usage lines', async () => {
      const mockResponse: UsageLineListResponse = {
        content: [],
        page: { size: 10, totalElements: 0, totalPages: 0, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const { listUsageLines } = await import('../../../src/api/usage-summaries');
      await listUsageLines(mockClient, 'usage-summary-123', {
        usageDate: '2024-01-15',
        sort: 'productName,asc',
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/usage-summaries/usage-summary-123/usage-lines?page=0&size=10&usageDate=2024-01-15&sort=productName%2Casc',
        { method: 'GET' },
      );
    });

    it('T026: should require usageDate parameter', async () => {
      const { listUsageLines } = await import('../../../src/api/usage-summaries');
      
      // TypeScript should enforce this at compile time, but we test runtime validation
      // @ts-expect-error - Testing runtime validation
      await expect(listUsageLines(mockClient, 'usage-summary-123', {})).rejects.toThrow();
    });

    it('T027: should handle 404 error when usage summary not found', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Usage summary not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const { listUsageLines } = await import('../../../src/api/usage-summaries');
      await expect(listUsageLines(mockClient, 'invalid-id', { usageDate: '2024-01-15' })).rejects.toThrow();
    });
  });
});
