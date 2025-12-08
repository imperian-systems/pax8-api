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
 * Integration tests for Subscriptions API flows.
 * These tests verify complete user journeys with realistic data flows.
 */

describe('Subscriptions API Integration Tests', () => {
  let mockClient: SubscriptionsApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('User Story 1: List Subscriptions with Pagination and Filters', () => {
    it('should retrieve first page with default pagination', async () => {
      const mockResponse: SubscriptionListResponse = {
        content: Array.from({ length: 10 }, (_, i) => ({
          id: `sub-${i + 1}`,
          companyId: `company-${i % 3 + 1}`,
          productId: `prod-${i % 5 + 1}`,
          quantity: i + 1,
          status: 'Active' as const,
          price: 29.99 + i * 10,
          billingTerm: i % 2 === 0 ? ('Monthly' as const) : ('Annual' as const),
          billingStart: `2024-0${(i % 9) + 1}-01T00:00:00Z`,
          startDate: `2024-0${(i % 9) + 1}-01T00:00:00Z`,
          endDate: null,
          createdDate: `2023-12-${String(i + 1).padStart(2, '0')}T10:30:00Z`,
        })),
        page: {
          size: 10,
          totalElements: 50,
          totalPages: 5,
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

      expect(result.content).toHaveLength(10);
      expect(result.page.size).toBe(10);
      expect(result.page.totalElements).toBe(50);
      expect(result.page.totalPages).toBe(5);
      expect(result.page.number).toBe(0);
    });

    it('should filter subscriptions by companyId', async () => {
      const companyId = 'target-company-id';
      const mockResponse: SubscriptionListResponse = {
        content: [
          {
            id: 'sub-1',
            companyId,
            productId: 'prod-1',
            quantity: 5,
            status: 'Active',
            price: 99.99,
            billingTerm: 'Monthly',
            billingStart: '2024-01-01T00:00:00Z',
            startDate: '2024-01-01T00:00:00Z',
            endDate: null,
            createdDate: '2023-12-15T10:30:00Z',
          },
          {
            id: 'sub-2',
            companyId,
            productId: 'prod-2',
            quantity: 10,
            status: 'Active',
            price: 199.99,
            billingTerm: 'Annual',
            billingStart: '2024-02-01T00:00:00Z',
            startDate: '2024-02-01T00:00:00Z',
            endDate: null,
            createdDate: '2024-01-20T14:00:00Z',
          },
        ],
        page: {
          size: 10,
          totalElements: 2,
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

      expect(result.content).toHaveLength(2);
      expect(result.content.every((s) => s.companyId === companyId)).toBe(true);
    });

    it('should filter subscriptions by productId and status', async () => {
      const productId = 'target-product-id';
      const status = 'Active';
      const mockResponse: SubscriptionListResponse = {
        content: [
          {
            id: 'sub-active-1',
            companyId: 'company-1',
            productId,
            quantity: 3,
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

      const result = await listSubscriptions(mockClient, { productId, status });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.productId).toBe(productId);
      expect(result.content[0]?.status).toBe(status);
    });

    it('should handle empty results when no subscriptions match filters', async () => {
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

      const result = await listSubscriptions(mockClient, {
        companyId: 'nonexistent-company',
        status: 'Active',
      });

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });
  });

  describe('User Story 2: View Subscription Details', () => {
    it('should retrieve complete subscription information', async () => {
      const subscriptionId = 'target-subscription-id';
      const mockResponse: Subscription = {
        id: subscriptionId,
        companyId: 'company-123',
        productId: 'prod-microsoft-365',
        quantity: 25,
        status: 'Active',
        price: 299.99,
        billingTerm: 'Annual',
        billingStart: '2024-01-01T00:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: null,
        createdDate: '2023-12-15T10:30:00Z',
        commitmentTermId: 'commit-annual-1yr',
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

      expect(result.id).toBe(subscriptionId);
      expect(result.companyId).toBe('company-123');
      expect(result.quantity).toBe(25);
      expect(result.status).toBe('Active');
      expect(result.commitmentTermMonths).toBe(12);
    });

    it('should handle subscription without commitment details', async () => {
      const subscriptionId = 'sub-no-commitment';
      const mockResponse: Subscription = {
        id: subscriptionId,
        companyId: 'company-456',
        productId: 'prod-basic',
        quantity: 5,
        status: 'Active',
        price: 49.99,
        billingTerm: 'Monthly',
        billingStart: '2024-06-01T00:00:00Z',
        startDate: '2024-06-01T00:00:00Z',
        endDate: null,
        createdDate: '2024-05-20T08:00:00Z',
        commitmentTermId: null,
        commitmentTermMonths: null,
        commitmentEndDate: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getSubscription(mockClient, subscriptionId);

      expect(result.commitmentTermId).toBeNull();
      expect(result.commitmentTermMonths).toBeNull();
      expect(result.commitmentEndDate).toBeNull();
    });

    it('should handle 404 when subscription does not exist', async () => {
      const subscriptionId = 'nonexistent-subscription';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Subscription not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getSubscription(mockClient, subscriptionId)).rejects.toThrow('Subscription not found');
    });
  });

  describe('User Story 3: Update Subscription Quantity', () => {
    it('should successfully update subscription quantity', async () => {
      const subscriptionId = 'target-subscription-id';
      const updateRequest = { quantity: 15 };

      const mockResponse: Subscription = {
        id: subscriptionId,
        companyId: 'company-123',
        productId: 'prod-office-365',
        quantity: 15,
        status: 'Active',
        price: 149.99,
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

      expect(result.quantity).toBe(15);
      expect(result.id).toBe(subscriptionId);
    });

    it('should handle validation error for invalid quantity', async () => {
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

    it('should handle updating quantity to a higher value', async () => {
      const subscriptionId = 'sub-scale-up';
      const updateRequest = { quantity: 50 };

      const mockResponse: Subscription = {
        id: subscriptionId,
        companyId: 'company-789',
        productId: 'prod-enterprise',
        quantity: 50,
        status: 'Active',
        price: 999.99,
        billingTerm: 'Annual',
        billingStart: '2024-01-01T00:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: null,
        createdDate: '2023-11-01T09:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await updateSubscription(mockClient, subscriptionId, updateRequest);

      expect(result.quantity).toBe(50);
    });
  });

  describe('User Story 4: Cancel Subscription', () => {
    it('should successfully cancel subscription immediately', async () => {
      const subscriptionId = 'target-subscription-id';

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

    it('should successfully schedule cancellation on future billing date', async () => {
      const subscriptionId = 'sub-scheduled-cancel';
      const cancelOptions = { billingDate: '2025-12-31' };

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

    it('should handle 404 when subscription does not exist', async () => {
      const subscriptionId = 'nonexistent-subscription';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Subscription not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(cancelSubscription(mockClient, subscriptionId)).rejects.toThrow('Subscription not found');
    });
  });

  describe('User Story 5: View Subscription History', () => {
    it('should retrieve ordered subscription history', async () => {
      const subscriptionId = 'target-subscription-id';
      const mockResponse: SubscriptionHistory[] = [
        {
          id: 'hist-3',
          subscriptionId,
          action: 'QuantityUpdate',
          date: '2024-12-01T10:00:00Z',
          userId: 'user-123',
          previousQuantity: 10,
          newQuantity: 15,
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
          id: 'hist-1',
          subscriptionId,
          action: 'Created',
          date: '2024-10-01T08:00:00Z',
          userId: null,
          previousQuantity: null,
          newQuantity: 10,
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getSubscriptionHistory(mockClient, subscriptionId);

      expect(result).toHaveLength(3);
      expect(result[0]?.action).toBe('QuantityUpdate');
      expect(result[0]?.previousQuantity).toBe(10);
      expect(result[0]?.newQuantity).toBe(15);
      expect(result[2]?.action).toBe('Created');
    });

    it('should handle empty history for newly created subscriptions', async () => {
      const subscriptionId = 'sub-new';
      const mockResponse: SubscriptionHistory[] = [];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getSubscriptionHistory(mockClient, subscriptionId);

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle history with multiple quantity changes', async () => {
      const subscriptionId = 'sub-multiple-changes';
      const mockResponse: SubscriptionHistory[] = [
        {
          id: 'hist-5',
          subscriptionId,
          action: 'QuantityUpdate',
          date: '2024-12-05T15:00:00Z',
          userId: 'user-789',
          previousQuantity: 30,
          newQuantity: 25,
        },
        {
          id: 'hist-4',
          subscriptionId,
          action: 'QuantityUpdate',
          date: '2024-12-03T12:00:00Z',
          userId: 'user-456',
          previousQuantity: 20,
          newQuantity: 30,
        },
        {
          id: 'hist-3',
          subscriptionId,
          action: 'QuantityUpdate',
          date: '2024-12-01T10:00:00Z',
          userId: 'user-123',
          previousQuantity: 10,
          newQuantity: 20,
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getSubscriptionHistory(mockClient, subscriptionId);

      expect(result).toHaveLength(3);
      expect(result.every((h) => h.action === 'QuantityUpdate')).toBe(true);
      expect(result[0]?.previousQuantity).toBe(30);
      expect(result[0]?.newQuantity).toBe(25);
    });
  });
});
