import { describe, it, expect, beforeEach, vi } from 'vitest';

import { listOrders, getOrder, createOrder } from '../../../src/api/orders';
import type { OrdersApiClient } from '../../../src/api/orders';
import type { OrderListResponse, Order } from '../../../src/models/orders';

/**
 * Integration tests for Orders API flows.
 * These tests verify complete user journeys with realistic data flows.
 */

describe('Orders API Integration Tests', () => {
  let mockClient: OrdersApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('User Story 1: List Orders with Pagination', () => {
    it('should retrieve first page with default pagination', async () => {
      const mockResponse: OrderListResponse = {
        content: Array.from({ length: 10 }, (_, i) => ({
          id: `order-${i + 1}`,
          companyId: `company-${i % 3 + 1}`,
          createdDate: `2024-12-0${(i % 9) + 1}T10:30:00Z`,
          orderedBy: 'Pax8 Partner' as const,
          orderedByUserEmail: `agent${i}@example.com`,
          lineItems: [
            {
              id: `li-${i}`,
              productId: `prod-${i}`,
              subscriptionId: `sub-${i}`,
              billingTerm: 'Monthly' as const,
              quantity: i + 1,
            },
          ],
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

      const result = await listOrders(mockClient);

      expect(result.content).toHaveLength(10);
      expect(result.page.size).toBe(10);
      expect(result.page.totalElements).toBe(50);
      expect(result.page.totalPages).toBe(5);
      expect(result.page.number).toBe(0);
    });

    it('should filter orders by companyId', async () => {
      const companyId = 'target-company-id';
      const mockResponse: OrderListResponse = {
        content: [
          {
            id: 'order-1',
            companyId,
            createdDate: '2024-12-01T10:30:00Z',
            orderedBy: 'Customer',
            orderedByUserEmail: 'customer@example.com',
            lineItems: [
              {
                id: 'li-1',
                productId: 'prod-1',
                subscriptionId: 'sub-1',
                billingTerm: 'Monthly',
                quantity: 5,
              },
            ],
          },
          {
            id: 'order-2',
            companyId,
            createdDate: '2024-12-02T14:00:00Z',
            orderedBy: 'Pax8 Partner',
            orderedByUserEmail: 'agent@example.com',
            lineItems: [
              {
                id: 'li-2',
                productId: 'prod-2',
                subscriptionId: 'sub-2',
                billingTerm: 'Annual',
                quantity: 10,
              },
            ],
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

      const result = await listOrders(mockClient, { companyId });

      expect(result.content).toHaveLength(2);
      expect(result.content.every((o) => o.companyId === companyId)).toBe(true);
    });

    it('should paginate through multiple pages', async () => {
      // First page
      const page0Response: OrderListResponse = {
        content: Array.from({ length: 20 }, (_, i) => ({
          id: `order-${i + 1}`,
          companyId: 'company-1',
          createdDate: `2024-12-01T${String(i).padStart(2, '0')}:00:00Z`,
          orderedBy: 'Pax8 Partner' as const,
          lineItems: [],
        })),
        page: {
          size: 20,
          totalElements: 45,
          totalPages: 3,
          number: 0,
        },
      };

      // Second page
      const page1Response: OrderListResponse = {
        content: Array.from({ length: 20 }, (_, i) => ({
          id: `order-${i + 21}`,
          companyId: 'company-1',
          createdDate: `2024-12-02T${String(i).padStart(2, '0')}:00:00Z`,
          orderedBy: 'Customer' as const,
          lineItems: [],
        })),
        page: {
          size: 20,
          totalElements: 45,
          totalPages: 3,
          number: 1,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(page0Response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(page1Response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const firstPage = await listOrders(mockClient, { page: 0, size: 20 });
      expect(firstPage.content).toHaveLength(20);
      expect(firstPage.page.number).toBe(0);
      expect(firstPage.content[0]?.id).toBe('order-1');

      const secondPage = await listOrders(mockClient, { page: 1, size: 20 });
      expect(secondPage.content).toHaveLength(20);
      expect(secondPage.page.number).toBe(1);
      expect(secondPage.content[0]?.id).toBe('order-21');
    });

    it('should handle empty results when no orders exist', async () => {
      const mockResponse: OrderListResponse = {
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

      const result = await listOrders(mockClient, { companyId: 'nonexistent-company' });

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });
  });

  describe('User Story 2: View Order Details', () => {
    it('should retrieve complete order information including line items', async () => {
      const orderId = 'target-order-id';
      const mockResponse: Order = {
        id: orderId,
        companyId: 'company-123',
        createdDate: '2024-12-01T10:30:00Z',
        orderedBy: 'Pax8 Partner',
        orderedByUserId: 'user-456',
        orderedByUserEmail: 'agent@example.com',
        isScheduled: false,
        lineItems: [
          {
            id: 'li-1',
            productId: 'prod-microsoft-365',
            subscriptionId: 'sub-789',
            commitmentTermId: 'commit-annual',
            billingTerm: 'Annual',
            quantity: 25,
            lineItemNumber: 1,
            provisionStartDate: '2024-12-05T00:00:00Z',
          },
          {
            id: 'li-2',
            productId: 'prod-office-365',
            subscriptionId: 'sub-790',
            billingTerm: 'Monthly',
            quantity: 10,
            lineItemNumber: 2,
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getOrder(mockClient, orderId);

      expect(result.id).toBe(orderId);
      expect(result.companyId).toBe('company-123');
      expect(result.lineItems).toHaveLength(2);
      expect(result.lineItems[0]?.subscriptionId).toBe('sub-789');
      expect(result.lineItems[0]?.commitmentTermId).toBe('commit-annual');
      expect(result.lineItems[1]?.subscriptionId).toBe('sub-790');
    });

    it('should handle order with nullable subscriptionId', async () => {
      const orderId = 'pending-order-id';
      const mockResponse: Order = {
        id: orderId,
        companyId: 'company-123',
        createdDate: '2024-12-08T20:00:00Z',
        orderedBy: 'Customer',
        lineItems: [
          {
            id: 'li-pending',
            productId: 'prod-pending',
            subscriptionId: null, // Not yet provisioned
            billingTerm: 'Monthly',
            quantity: 5,
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getOrder(mockClient, orderId);

      expect(result.lineItems[0]?.subscriptionId).toBeNull();
    });
  });

  describe('User Story 3: Create Order', () => {
    it('should create order with required line item fields', async () => {
      const createRequest = {
        companyId: 'company-123',
        orderedBy: 'Pax8 Partner' as const,
        orderedByUserEmail: 'agent@example.com',
        lineItems: [
          {
            productId: 'prod-microsoft-365',
            quantity: 10,
            billingTerm: 'Annual' as const,
            lineItemNumber: 1,
            commitmentTermId: 'commit-annual-1yr',
          },
        ],
      };

      const mockResponse: Order = {
        id: 'new-order-123',
        companyId: 'company-123',
        createdDate: '2024-12-08T20:30:00Z',
        orderedBy: 'Pax8 Partner',
        orderedByUserEmail: 'agent@example.com',
        lineItems: [
          {
            id: 'li-new-1',
            productId: 'prod-microsoft-365',
            subscriptionId: null,
            commitmentTermId: 'commit-annual-1yr',
            billingTerm: 'Annual',
            quantity: 10,
            lineItemNumber: 1,
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await createOrder(mockClient, createRequest);

      expect(result.id).toBe('new-order-123');
      expect(result.lineItems[0]?.commitmentTermId).toBe('commit-annual-1yr');
    });

    it('should create order with provisioning details', async () => {
      const createRequest = {
        companyId: 'company-123',
        lineItems: [
          {
            productId: 'prod-microsoft-365',
            quantity: 5,
            billingTerm: 'Monthly' as const,
            lineItemNumber: 1,
            provisioningDetails: [
              { key: 'tenantDomain', values: ['contoso.onmicrosoft.com'] },
              { key: 'adminEmail', values: ['admin@contoso.com'] },
            ],
          },
        ],
      };

      const mockResponse: Order = {
        id: 'new-order-456',
        companyId: 'company-123',
        createdDate: '2024-12-08T20:35:00Z',
        orderedBy: 'Pax8 Partner',
        lineItems: [
          {
            id: 'li-new-2',
            productId: 'prod-microsoft-365',
            subscriptionId: null,
            billingTerm: 'Monthly',
            quantity: 5,
            lineItemNumber: 1,
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await createOrder(mockClient, createRequest);

      expect(result.id).toBe('new-order-456');
    });

    it('should validate order without creating using isMock parameter', async () => {
      const createRequest = {
        companyId: 'company-123',
        lineItems: [
          {
            productId: 'prod-test',
            quantity: 1,
            billingTerm: 'Trial' as const,
            lineItemNumber: 1,
          },
        ],
      };

      const mockResponse: Order = {
        id: 'mock-order-id',
        companyId: 'company-123',
        createdDate: '2024-12-08T20:40:00Z',
        orderedBy: 'Pax8 Partner',
        lineItems: [
          {
            id: 'mock-li',
            productId: 'prod-test',
            subscriptionId: null,
            billingTerm: 'Trial',
            quantity: 1,
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await createOrder(mockClient, createRequest, { isMock: true });

      expect(mockClient.request).toHaveBeenCalledWith('/orders?isMock=true', expect.any(Object));
      expect(result).toBeDefined();
    });
  });
});
