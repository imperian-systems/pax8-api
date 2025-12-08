import { describe, it, expect, beforeEach, vi } from 'vitest';

import { listOrders, getOrder, createOrder } from '../../../src/api/orders';
import type { OrdersApiClient } from '../../../src/api/orders';
import type { OrderListResponse, Order } from '../../../src/models/orders';

/**
 * Contract tests for Orders API endpoints.
 * These tests verify request/response structures match the OpenAPI specification.
 */

describe('Orders API Contract Tests', () => {
  let mockClient: OrdersApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('GET /orders - listOrders', () => {
    it('should return 200 with valid order list response structure', async () => {
      const mockResponse: OrderListResponse = {
        content: [
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
            createdDate: '2024-12-01T10:30:00Z',
            orderedBy: 'Pax8 Partner',
            orderedByUserId: 'u1u2u3u4-u5u6-u7u8-u9u0-u1u2u3u4u5u6',
            orderedByUserEmail: 'agent@example.com',
            isScheduled: false,
            lineItems: [
              {
                id: 'li1-id',
                productId: 'prod-123',
                subscriptionId: 'sub-456',
                billingTerm: 'Monthly',
                quantity: 5,
              },
            ],
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

      const result = await listOrders(mockClient);

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('id');
      expect(result.content[0]).toHaveProperty('companyId');
      expect(result.content[0]).toHaveProperty('createdDate');
      expect(result.content[0]).toHaveProperty('orderedBy');
      expect(result.content[0]).toHaveProperty('lineItems');
      expect(result.page).toHaveProperty('size');
      expect(result.page).toHaveProperty('totalElements');
      expect(result.page).toHaveProperty('totalPages');
      expect(result.page).toHaveProperty('number');
    });

    it('should handle custom pagination parameters', async () => {
      const mockResponse: OrderListResponse = {
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

      const result = await listOrders(mockClient, { page: 2, size: 50 });

      expect(mockClient.request).toHaveBeenCalledWith('/orders?page=2&size=50', { method: 'GET' });
      expect(result.page.size).toBe(50);
      expect(result.page.number).toBe(2);
    });

    it('should handle companyId filter parameter', async () => {
      const companyId = 'f9e8d7c6-b5a4-3210-fedc-ba9876543210';
      const mockResponse: OrderListResponse = {
        content: [
          {
            id: 'order-1',
            companyId,
            createdDate: '2024-12-01T10:30:00Z',
            orderedBy: 'Customer',
            lineItems: [],
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

      const result = await listOrders(mockClient, { companyId });

      expect(mockClient.request).toHaveBeenCalledWith(`/orders?page=0&size=10&companyId=${companyId}`, {
        method: 'GET',
      });
      expect(result.content[0]?.companyId).toBe(companyId);
    });

    it('should handle 401 unauthorized error', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(listOrders(mockClient)).rejects.toThrow('Invalid credentials');
    });

    it('should handle 422 validation error', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'validation_error', message: 'Invalid page size' }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(listOrders(mockClient, { size: 300 })).rejects.toThrow();
    });
  });

  describe('GET /orders/{orderId} - getOrder', () => {
    it('should return 200 with valid order structure', async () => {
      const orderId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const mockResponse: Order = {
        id: orderId,
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
        createdDate: '2024-12-01T10:30:00Z',
        orderedBy: 'Pax8 Partner',
        orderedByUserId: 'u1u2u3u4-u5u6-u7u8-u9u0-u1u2u3u4u5u6',
        orderedByUserEmail: 'agent@example.com',
        isScheduled: false,
        lineItems: [
          {
            id: 'li1-id',
            productId: 'prod-123',
            subscriptionId: 'sub-456',
            commitmentTermId: 'commit-789',
            billingTerm: 'Annual',
            quantity: 10,
            lineItemNumber: 1,
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

      expect(mockClient.request).toHaveBeenCalledWith(`/orders/${orderId}`, { method: 'GET' });
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe(orderId);
      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0]).toHaveProperty('productId');
      expect(result.lineItems[0]).toHaveProperty('subscriptionId');
    });

    it('should handle 404 not found error', async () => {
      const orderId = 'nonexistent-id';

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Order not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getOrder(mockClient, orderId)).rejects.toThrow('Order not found');
    });
  });

  describe('POST /orders - createOrder', () => {
    it('should return 201 with created order structure', async () => {
      const createRequest = {
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
        orderedBy: 'Pax8 Partner' as const,
        orderedByUserEmail: 'agent@example.com',
        lineItems: [
          {
            productId: 'prod-123',
            quantity: 5,
            billingTerm: 'Monthly' as const,
            lineItemNumber: 1,
            provisioningDetails: [{ key: 'tenantDomain', values: ['contoso.onmicrosoft.com'] }],
          },
        ],
      };

      const mockResponse: Order = {
        id: 'new-order-id',
        companyId: createRequest.companyId,
        createdDate: '2024-12-08T20:00:00Z',
        orderedBy: 'Pax8 Partner',
        orderedByUserEmail: 'agent@example.com',
        lineItems: [
          {
            id: 'li-new',
            productId: 'prod-123',
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

      expect(mockClient.request).toHaveBeenCalledWith('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createRequest),
      });
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe('new-order-id');
    });

    it('should support isMock query parameter for validation', async () => {
      const createRequest = {
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
        lineItems: [
          {
            productId: 'prod-123',
            quantity: 1,
            billingTerm: 'Annual' as const,
            lineItemNumber: 1,
          },
        ],
      };

      const mockResponse: Order = {
        id: 'mock-order-id',
        companyId: createRequest.companyId,
        createdDate: '2024-12-08T20:00:00Z',
        orderedBy: 'Pax8 Partner',
        lineItems: [
          {
            id: 'mock-li',
            productId: 'prod-123',
            subscriptionId: null,
            billingTerm: 'Annual',
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

      expect(mockClient.request).toHaveBeenCalledWith('/orders?isMock=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createRequest),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle 422 validation error for missing required fields', async () => {
      const invalidRequest = {
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
        lineItems: [
          {
            productId: 'prod-123',
            quantity: 5,
            billingTerm: 'Monthly' as const,
            // missing lineItemNumber
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'validation_error', message: 'lineItemNumber is required' }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(createOrder(mockClient, invalidRequest as unknown)).rejects.toThrow();
    });
  });
});
