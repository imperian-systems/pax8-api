import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getInvoice, listDraftInvoiceItems, listInvoiceItems, listInvoices } from '../../../src/api/invoices';
import type { InvoicesApiClient } from '../../../src/api/invoices';
import type { Invoice, InvoiceItemsResponse, InvoiceListResponse } from '../../../src/models/invoices';

/**
 * Contract tests for Invoices API endpoints.
 * These tests verify request/response structures match the OpenAPI specification.
 */

describe('Invoices API Contract Tests', () => {
  let mockClient: InvoicesApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('GET /invoices - listInvoices', () => {
    it('should return 200 with valid invoice list response structure', async () => {
      const mockResponse: InvoiceListResponse = {
        content: [
          {
            id: 'inv-123',
            companyId: 'comp-456',
            invoiceDate: '2024-01-15',
            dueDate: '2024-02-15',
            total: 1500.0,
            balance: 0.0,
            status: 'Paid',
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

      const result = await listInvoices(mockClient);

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(mockClient.request).toHaveBeenCalledWith('/invoices?page=0&size=10', { method: 'GET' });
    });

    it('should handle pagination parameters', async () => {
      const mockResponse: InvoiceListResponse = {
        content: [],
        page: { size: 50, totalElements: 100, totalPages: 2, number: 1 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await listInvoices(mockClient, { page: 1, size: 50 });

      expect(mockClient.request).toHaveBeenCalledWith('/invoices?page=1&size=50', { method: 'GET' });
      expect(result.page.number).toBe(1);
      expect(result.page.size).toBe(50);
    });

    it('should handle companyId filter', async () => {
      const mockResponse: InvoiceListResponse = {
        content: [],
        page: { size: 10, totalElements: 0, totalPages: 0, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await listInvoices(mockClient, { companyId: 'comp-123' });

      expect(mockClient.request).toHaveBeenCalledWith('/invoices?page=0&size=10&companyId=comp-123', { method: 'GET' });
    });

    it('should return 401 for unauthorized request', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(listInvoices(mockClient)).rejects.toThrow();
    });

    it('should handle invoices with optional fields', async () => {
      const mockResponse: InvoiceListResponse = {
        content: [
          {
            id: 'inv-789',
            companyId: 'comp-111',
            companyName: 'Test Company',
            invoiceDate: '2024-02-01',
            dueDate: '2024-03-01',
            total: 2500.0,
            partnerTotal: 2000.0,
            balance: 500.0,
            status: 'Unpaid',
            currencyCode: 'USD',
            externalId: 'ext-123',
          },
        ],
        page: { size: 10, totalElements: 1, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await listInvoices(mockClient);

      expect(result.content[0].companyName).toBe('Test Company');
      expect(result.content[0].partnerTotal).toBe(2000.0);
      expect(result.content[0].currencyCode).toBe('USD');
      expect(result.content[0].externalId).toBe('ext-123');
    });
  });

  describe('GET /invoices/{invoiceId} - getInvoice', () => {
    it('should return 200 with valid invoice structure', async () => {
      const mockInvoice: Invoice = {
        id: 'inv-123',
        companyId: 'comp-456',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        total: 1500.0,
        balance: 0.0,
        status: 'Paid',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockInvoice), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getInvoice(mockClient, 'inv-123');

      expect(result).toEqual(mockInvoice);
      expect(mockClient.request).toHaveBeenCalledWith('/invoices/inv-123', { method: 'GET' });
    });

    it('should throw error for empty invoiceId', async () => {
      await expect(getInvoice(mockClient, '')).rejects.toThrow();
    });

    it('should return 404 for non-existent invoice', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invoice not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getInvoice(mockClient, 'inv-nonexistent')).rejects.toThrow();
    });

    it('should handle invoice with optional fields', async () => {
      const mockInvoice: Invoice = {
        id: 'inv-456',
        companyId: 'comp-789',
        invoiceDate: '2024-02-01',
        dueDate: '2024-03-01',
        paidDate: '2024-02-15',
        total: 3000.0,
        balance: 0.0,
        status: 'Paid',
        carriedBalance: 500.0,
        partnerName: 'Test Partner Inc',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockInvoice), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getInvoice(mockClient, 'inv-456');

      expect(result.paidDate).toBe('2024-02-15');
      expect(result.carriedBalance).toBe(500.0);
      expect(result.partnerName).toBe('Test Partner Inc');
    });
  });

  describe('GET /invoices/{invoiceId}/items - listInvoiceItems', () => {
    it('should return 200 with valid invoice items list structure', async () => {
      const mockResponse: InvoiceItemsResponse = {
        content: [
          {
            id: 'item-123',
            invoiceId: 'inv-456',
            companyId: 'comp-789',
            subscriptionId: 'sub-111',
            productId: 'prod-222',
            productName: 'Microsoft 365 Business Standard',
            quantity: 10,
            unitPrice: 12.5,
            total: 125.0,
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            chargeType: 'Renewal',
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

      const result = await listInvoiceItems(mockClient, 'inv-456');

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(mockClient.request).toHaveBeenCalledWith('/invoices/inv-456/items?page=0&size=10', { method: 'GET' });
    });

    it('should handle pagination parameters', async () => {
      const mockResponse: InvoiceItemsResponse = {
        content: [],
        page: { size: 50, totalElements: 100, totalPages: 2, number: 1 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await listInvoiceItems(mockClient, 'inv-789', { page: 1, size: 50 });

      expect(mockClient.request).toHaveBeenCalledWith('/invoices/inv-789/items?page=1&size=50', { method: 'GET' });
      expect(result.page.number).toBe(1);
      expect(result.page.size).toBe(50);
    });

    it('should throw error for empty invoiceId', async () => {
      await expect(listInvoiceItems(mockClient, '')).rejects.toThrow();
    });

    it('should return 404 for non-existent invoice', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invoice not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(listInvoiceItems(mockClient, 'inv-nonexistent')).rejects.toThrow();
    });

    it('should handle items with optional fields', async () => {
      const mockResponse: InvoiceItemsResponse = {
        content: [
          {
            id: 'item-789',
            invoiceId: 'inv-789',
            companyId: 'comp-111',
            subscriptionId: 'sub-222',
            productId: 'prod-333',
            productName: 'Adobe Creative Cloud',
            quantity: 5,
            unitPrice: 54.99,
            total: 274.95,
            startDate: '2024-02-01',
            endDate: '2024-02-29',
            chargeType: 'NewCharge',
          },
        ],
        page: { size: 10, totalElements: 1, totalPages: 1, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await listInvoiceItems(mockClient, 'inv-abc');

      expect(result.content[0].id).toBe('item-789');
      expect(result.content[0].invoiceId).toBe('inv-789');
      expect(result.content[0].subscriptionId).toBe('sub-222');
    });
  });

  describe('GET /companies/{companyId}/invoices/draft-items - listDraftInvoiceItems', () => {
    it('should return 200 with valid draft items list structure', async () => {
      const mockResponse: InvoiceItemsResponse = {
        content: [
          {
            id: 'draft-item-123',
            invoiceId: null,
            companyId: 'comp-456',
            subscriptionId: 'sub-789',
            productId: 'prod-111',
            productName: 'Google Workspace Business',
            quantity: 20,
            unitPrice: 18.0,
            total: 360.0,
            startDate: '2024-03-01',
            endDate: '2024-03-31',
            chargeType: 'Renewal',
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

      const result = await listDraftInvoiceItems(mockClient, 'comp-456');

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(mockClient.request).toHaveBeenCalledWith('/companies/comp-456/invoices/draft-items?page=0&size=10', {
        method: 'GET',
      });
    });

    it('should handle pagination parameters', async () => {
      const mockResponse: InvoiceItemsResponse = {
        content: [],
        page: { size: 100, totalElements: 0, totalPages: 0, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await listDraftInvoiceItems(mockClient, 'comp-789', { page: 0, size: 100 });

      expect(mockClient.request).toHaveBeenCalledWith('/companies/comp-789/invoices/draft-items?page=0&size=100', {
        method: 'GET',
      });
    });

    it('should throw error for empty companyId', async () => {
      await expect(listDraftInvoiceItems(mockClient, '')).rejects.toThrow();
    });

    it('should return 404 for non-existent company', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Company not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(listDraftInvoiceItems(mockClient, 'comp-nonexistent')).rejects.toThrow();
    });

    it('should handle empty draft items result', async () => {
      const mockResponse: InvoiceItemsResponse = {
        content: [],
        page: { size: 10, totalElements: 0, totalPages: 0, number: 0 },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await listDraftInvoiceItems(mockClient, 'comp-999');

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });
  });
});
