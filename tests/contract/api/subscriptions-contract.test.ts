import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  listSubscriptions,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionHistory,
} from '../../../src/api/subscriptions';
import type { SubscriptionsApiClient } from '../../../src/api/subscriptions';
import type {
  SubscriptionListResponse,
  Subscription,
  SubscriptionHistory,
} from '../../../src/models/subscriptions';

/**
 * Contract tests for Subscriptions API endpoints.
 * These tests verify request/response structures match the OpenAPI specification.
 */

describe('Subscriptions API Contract Tests', () => {
  let mockClient: SubscriptionsApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('GET /subscriptions - listSubscriptions', () => {
    it('should return 200 with valid subscription list response structure', async () => {
      const mockResponse: SubscriptionListResponse = {
        content: [
          {
            id: 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
            productId: 'prod-123',
            quantity: 5,
            status: 'Active',
            price: 99.99,
            billingTerm: 'Monthly',
            billingStart: '2024-01-01T00:00:00Z',
            startDate: '2024-01-01T00:00:00Z',
            endDate: null,
            createdDate: '2023-12-15T10:30:00Z',
            commitmentTermId: null,
            commitmentTermMonths: null,
            commitmentEndDate: null,
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

      const result = await listSubscriptions(mockClient);

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('id');
      expect(result.content[0]).toHaveProperty('companyId');
      expect(result.content[0]).toHaveProperty('productId');
      expect(result.content[0]).toHaveProperty('quantity');
      expect(result.content[0]).toHaveProperty('status');
      expect(result.content[0]).toHaveProperty('billingTerm');
      expect(result.page).toHaveProperty('size');
      expect(result.page).toHaveProperty('totalElements');
      expect(result.page).toHaveProperty('totalPages');
      expect(result.page).toHaveProperty('number');
    });

    it('should handle custom pagination parameters', async () => {
      const mockResponse: SubscriptionListResponse = {
        content: [],
        page: {
          size: 50,
          totalElements: 0,
          totalPages: 0,
          number: 2,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await listSubscriptions(mockClient, { page: 2, size: 50 });

      expect(mockClient.request).toHaveBeenCalledWith('/subscriptions?page=2&size=50', { method: 'GET' });
      expect(result.page.size).toBe(50);
      expect(result.page.number).toBe(2);
    });

    it('should handle companyId filter parameter', async () => {
      const companyId = 'f9e8d7c6-b5a4-3210-fedc-ba9876543210';
      const mockResponse: SubscriptionListResponse = {
        content: [
          {
            id: 'sub-1',
            companyId,
            productId: 'prod-123',
            quantity: 3,
            status: 'Active',
            price: 29.99,
            billingTerm: 'Monthly',
            billingStart: '2024-01-01T00:00:00Z',
            startDate: '2024-01-01T00:00:00Z',
            endDate: null,
            createdDate: '2023-12-15T10:30:00Z',
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

      const result = await listSubscriptions(mockClient, { companyId });

      expect(mockClient.request).toHaveBeenCalledWith(
        `/subscriptions?page=0&size=10&companyId=${companyId}`,
        { method: 'GET' },
      );
      expect(result.content[0]?.companyId).toBe(companyId);
    });

    it('should handle productId filter parameter', async () => {
      const productId = 'prod-456';
      const mockResponse: SubscriptionListResponse = {
        content: [
          {
            id: 'sub-2',
            companyId: 'company-123',
            productId,
            quantity: 10,
            status: 'Active',
            price: 199.99,
            billingTerm: 'Annual',
            billingStart: '2024-01-01T00:00:00Z',
            startDate: '2024-01-01T00:00:00Z',
            endDate: null,
            createdDate: '2023-12-15T10:30:00Z',
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

      const result = await listSubscriptions(mockClient, { productId });

      expect(mockClient.request).toHaveBeenCalledWith(
        `/subscriptions?page=0&size=10&productId=${productId}`,
        { method: 'GET' },
      );
      expect(result.content[0]?.productId).toBe(productId);
    });

    it('should handle status filter parameter', async () => {
      const status = 'Active';
      const mockResponse: SubscriptionListResponse = {
        content: [
          {
            id: 'sub-3',
            companyId: 'company-123',
            productId: 'prod-789',
            quantity: 2,
            status: 'Active',
            price: 49.99,
            billingTerm: 'Monthly',
            billingStart: '2024-01-01T00:00:00Z',
            startDate: '2024-01-01T00:00:00Z',
            endDate: null,
            createdDate: '2023-12-15T10:30:00Z',
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

      const result = await listSubscriptions(mockClient, { status });

      expect(mockClient.request).toHaveBeenCalledWith(`/subscriptions?page=0&size=10&status=${status}`, {
        method: 'GET',
      });
      expect(result.content[0]?.status).toBe(status);
    });

    it('should handle sort parameter', async () => {
      const mockResponse: SubscriptionListResponse = {
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
        }),
      );

      const result = await listSubscriptions(mockClient, { sort: 'productId,asc' });

      expect(mockClient.request).toHaveBeenCalledWith('/subscriptions?page=0&size=10&sort=productId%2Casc', {
        method: 'GET',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle 422 validation error when size exceeds 200', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'validation_error', message: 'Size must not exceed 200' }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(listSubscriptions(mockClient, { size: 300 })).rejects.toThrow();
    });
  });

  describe('GET /subscriptions/{subscriptionId} - getSubscription', () => {
    it('should return 200 with valid subscription structure', async () => {
      const subscriptionId = 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const mockResponse: Subscription = {
        id: subscriptionId,
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
        productId: 'prod-123',
        quantity: 5,
        status: 'Active',
        price: 99.99,
        billingTerm: 'Monthly',
        billingStart: '2024-01-01T00:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: null,
        createdDate: '2023-12-15T10:30:00Z',
        commitmentTermId: 'commit-789',
        commitmentTermMonths: 12,
        commitmentEndDate: '2024-12-31T23:59:59Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getSubscription(mockClient, subscriptionId);

      expect(mockClient.request).toHaveBeenCalledWith(`/subscriptions/${subscriptionId}`, { method: 'GET' });
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe(subscriptionId);
      expect(result).toHaveProperty('quantity');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('billingTerm');
    });

    it('should handle 404 not found error', async () => {
      const subscriptionId = 'nonexistent-id';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Subscription not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getSubscription(mockClient, subscriptionId)).rejects.toThrow('Subscription not found');
    });
  });

  describe('PUT /subscriptions/{subscriptionId} - updateSubscription', () => {
    it('should return 200 with updated subscription structure', async () => {
      const subscriptionId = 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const updateRequest = {
        quantity: 15,
      };

      const mockResponse: Subscription = {
        id: subscriptionId,
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
        productId: 'prod-123',
        quantity: 15,
        status: 'Active',
        price: 99.99,
        billingTerm: 'Monthly',
        billingStart: '2024-01-01T00:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: null,
        createdDate: '2023-12-15T10:30:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await updateSubscription(mockClient, subscriptionId, updateRequest);

      expect(mockClient.request).toHaveBeenCalledWith(`/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateRequest),
      });
      expect(result).toEqual(mockResponse);
      expect(result.quantity).toBe(15);
    });

    it('should handle 422 validation error for invalid quantity', async () => {
      const subscriptionId = 'sub-123';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 'validation_error',
            message: 'Quantity must be positive',
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      await expect(
        updateSubscription(mockClient, subscriptionId, {
          quantity: -5,
        }),
      ).rejects.toThrow();
    });

    it('should handle 404 not found error for unknown subscription', async () => {
      const subscriptionId = 'nonexistent-id';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Subscription not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(updateSubscription(mockClient, subscriptionId, { quantity: 10 })).rejects.toThrow(
        'Subscription not found',
      );
    });
  });

  describe('POST /subscriptions/{subscriptionId}/cancel - cancelSubscription', () => {
    it('should return 204 for immediate cancellation', async () => {
      const subscriptionId = 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        }),
      );

      await cancelSubscription(mockClient, subscriptionId);

      expect(mockClient.request).toHaveBeenCalledWith(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });

    it('should return 204 for scheduled cancellation with billingDate', async () => {
      const subscriptionId = 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const cancelOptions = {
        billingDate: '2025-12-31',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        }),
      );

      await cancelSubscription(mockClient, subscriptionId, cancelOptions);

      expect(mockClient.request).toHaveBeenCalledWith(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelOptions),
      });
    });

    it('should handle 422 validation error for invalid billingDate', async () => {
      const subscriptionId = 'sub-123';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 'validation_error',
            message: 'Invalid billing date format',
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      await expect(
        cancelSubscription(mockClient, subscriptionId, {
          billingDate: 'invalid-date',
        }),
      ).rejects.toThrow();
    });

    it('should handle 404 not found error', async () => {
      const subscriptionId = 'nonexistent-id';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Subscription not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(cancelSubscription(mockClient, subscriptionId)).rejects.toThrow('Subscription not found');
    });
  });

  describe('GET /subscriptions/{subscriptionId}/history - getSubscriptionHistory', () => {
    it('should return 200 with subscription history array', async () => {
      const subscriptionId = 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const mockResponse: SubscriptionHistory[] = [
        {
          id: 'hist-1',
          subscriptionId,
          action: 'QuantityUpdate',
          date: '2024-12-01T10:00:00Z',
          userId: 'user-123',
          previousQuantity: 5,
          newQuantity: 10,
        },
        {
          id: 'hist-2',
          subscriptionId,
          action: 'StatusChange',
          date: '2024-11-01T09:00:00Z',
          userId: 'user-456',
          previousQuantity: null,
          newQuantity: null,
        },
        {
          id: 'hist-3',
          subscriptionId,
          action: 'Created',
          date: '2024-10-01T08:00:00Z',
          userId: null,
          previousQuantity: null,
          newQuantity: 5,
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getSubscriptionHistory(mockClient, subscriptionId);

      expect(mockClient.request).toHaveBeenCalledWith(`/subscriptions/${subscriptionId}/history`, {
        method: 'GET',
      });
      expect(result).toEqual(mockResponse);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('action');
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('subscriptionId');
    });

    it('should return 200 with empty array when no history exists', async () => {
      const subscriptionId = 'sub-new';
      const mockResponse: SubscriptionHistory[] = [];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getSubscriptionHistory(mockClient, subscriptionId);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle 404 not found error for unknown subscription', async () => {
      const subscriptionId = 'nonexistent-id';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Subscription not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getSubscriptionHistory(mockClient, subscriptionId)).rejects.toThrow('Subscription not found');
    });
  });
});
