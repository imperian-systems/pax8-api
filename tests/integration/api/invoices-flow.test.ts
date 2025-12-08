import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getInvoice, listDraftInvoiceItems, listInvoiceItems, listInvoices } from '../../../src/api/invoices';
import type { InvoicesApiClient } from '../../../src/api/invoices';
import type { Invoice, InvoiceItem, InvoiceItemListResponse, InvoiceListResponse } from '../../../src/models/invoices';

/**
 * Integration tests for Invoices API flows.
 * These tests verify complete user journeys with realistic data flows.
 */

describe('Invoices API Integration Tests', () => {
  let mockClient: InvoicesApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  const makeInvoice = (id: string, companyId: string, status: 'Paid' | 'Unpaid' = 'Unpaid'): Invoice => ({
    id,
    companyId,
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    paidDate: status === 'Paid' ? '2024-02-10' : undefined,
    total: 1500.0,
    balance: status === 'Paid' ? 0.0 : 1500.0,
    status,
    carriedBalance: 0.0,
    partnerName: 'Test Partner',
  });

  const makeInvoiceItem = (id: string, invoiceId: string | undefined, companyId: string): InvoiceItem => ({
    id,
    invoiceId,
    companyId,
    subscriptionId: 'sub-123',
    productId: 'prod-456',
    productName: 'Microsoft 365 Business Standard',
    quantity: 10,
    unitPrice: 12.5,
    total: 125.0,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    chargeType: 'Renewal',
  });

  describe('User Story 1: List Invoices with Pagination and Filters', () => {
    it('should retrieve first page with default pagination', async () => {
      const mockResponse: InvoiceListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeInvoice(`inv-${i + 1}`, `comp-${i + 1}`)),
        page: {
          size: 10,
          totalElements: 25,
          totalPages: 3,
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

      expect(result.content).toHaveLength(10);
      expect(result.page.size).toBe(10);
      expect(result.page.totalPages).toBe(3);
      expect(result.page.number).toBe(0);
    });

    it('should paginate through multiple pages', async () => {
      // First page
      const firstPage: InvoiceListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeInvoice(`inv-page1-${i + 1}`, 'comp-123')),
        page: {
          size: 10,
          totalElements: 25,
          totalPages: 3,
          number: 0,
        },
      };

      // Second page
      const secondPage: InvoiceListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeInvoice(`inv-page2-${i + 1}`, 'comp-123')),
        page: {
          size: 10,
          totalElements: 25,
          totalPages: 3,
          number: 1,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(firstPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(secondPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const page1 = await listInvoices(mockClient, { page: 0, size: 10 });
      const page2 = await listInvoices(mockClient, { page: 1, size: 10 });

      expect(page1.content[0].id).toBe('inv-page1-1');
      expect(page2.content[0].id).toBe('inv-page2-1');
      expect(page1.page.number).toBe(0);
      expect(page2.page.number).toBe(1);
    });

    it('should filter invoices by companyId', async () => {
      const mockResponse: InvoiceListResponse = {
        content: [makeInvoice('inv-1', 'comp-target'), makeInvoice('inv-2', 'comp-target')],
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

      const result = await listInvoices(mockClient, { companyId: 'comp-target' });

      expect(result.content).toHaveLength(2);
      expect(result.content.every((inv) => inv.companyId === 'comp-target')).toBe(true);
      expect(mockClient.request).toHaveBeenCalledWith('/invoices?page=0&size=10&companyId=comp-target', {
        method: 'GET',
      });
    });

    it('should return empty results when no invoices match', async () => {
      const mockResponse: InvoiceListResponse = {
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

      const result = await listInvoices(mockClient, { companyId: 'comp-nonexistent' });

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });
  });

  describe('User Story 2: View Invoice Details', () => {
    it('should retrieve full invoice details', async () => {
      const mockInvoice: Invoice = {
        id: 'inv-detail-123',
        companyId: 'comp-456',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        paidDate: '2024-02-10',
        total: 2500.0,
        balance: 0.0,
        status: 'Paid',
        carriedBalance: 50.0,
        partnerName: 'Premium Partner LLC',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockInvoice), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getInvoice(mockClient, 'inv-detail-123');

      expect(result.id).toBe('inv-detail-123');
      expect(result.total).toBe(2500.0);
      expect(result.status).toBe('Paid');
      expect(result.paidDate).toBe('2024-02-10');
      expect(result.carriedBalance).toBe(50.0);
    });

    it('should handle 404 when invoice not found', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invoice not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getInvoice(mockClient, 'inv-nonexistent')).rejects.toThrow();
    });

    it('should retrieve invoice after listing', async () => {
      const listResponse: InvoiceListResponse = {
        content: [makeInvoice('inv-123', 'comp-456'), makeInvoice('inv-124', 'comp-456')],
        page: {
          size: 10,
          totalElements: 2,
          totalPages: 1,
          number: 0,
        },
      };

      const detailResponse: Invoice = {
        id: 'inv-123',
        companyId: 'comp-456',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        total: 1500.0,
        balance: 1500.0,
        status: 'Unpaid',
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(listResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(detailResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const list = await listInvoices(mockClient, { companyId: 'comp-456' });
      const detail = await getInvoice(mockClient, list.content[0].id);

      expect(detail.id).toBe('inv-123');
      expect(detail.companyId).toBe('comp-456');
    });
  });

  describe('User Story 3: List Invoice Line Items', () => {
    it('should retrieve invoice line items with pagination', async () => {
      const mockResponse: InvoiceItemListResponse = {
        content: Array.from({ length: 5 }, (_, i) => makeInvoiceItem(`item-${i + 1}`, 'inv-123', 'comp-456')),
        page: {
          size: 10,
          totalElements: 5,
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

      const result = await listInvoiceItems(mockClient, 'inv-123');

      expect(result.content).toHaveLength(5);
      expect(result.content[0].invoiceId).toBe('inv-123');
      expect(result.content[0].productName).toBe('Microsoft 365 Business Standard');
    });

    it('should paginate through invoice line items', async () => {
      const firstPage: InvoiceItemListResponse = {
        content: Array.from({ length: 10 }, (_, i) => makeInvoiceItem(`item-page1-${i + 1}`, 'inv-456', 'comp-789')),
        page: {
          size: 10,
          totalElements: 15,
          totalPages: 2,
          number: 0,
        },
      };

      const secondPage: InvoiceItemListResponse = {
        content: Array.from({ length: 5 }, (_, i) => makeInvoiceItem(`item-page2-${i + 1}`, 'inv-456', 'comp-789')),
        page: {
          size: 10,
          totalElements: 15,
          totalPages: 2,
          number: 1,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(firstPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(secondPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const page1 = await listInvoiceItems(mockClient, 'inv-456', { page: 0, size: 10 });
      const page2 = await listInvoiceItems(mockClient, 'inv-456', { page: 1, size: 10 });

      expect(page1.content).toHaveLength(10);
      expect(page2.content).toHaveLength(5);
      expect(page1.page.number).toBe(0);
      expect(page2.page.number).toBe(1);
    });

    it('should retrieve items after getting invoice', async () => {
      const invoiceResponse: Invoice = makeInvoice('inv-789', 'comp-111');
      const itemsResponse: InvoiceItemListResponse = {
        content: [makeInvoiceItem('item-1', 'inv-789', 'comp-111'), makeInvoiceItem('item-2', 'inv-789', 'comp-111')],
        page: {
          size: 10,
          totalElements: 2,
          totalPages: 1,
          number: 0,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(invoiceResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(itemsResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const invoice = await getInvoice(mockClient, 'inv-789');
      const items = await listInvoiceItems(mockClient, invoice.id);

      expect(items.content).toHaveLength(2);
      expect(items.content.every((item) => item.invoiceId === invoice.id)).toBe(true);
    });
  });

  describe('User Story 4: List Draft Invoice Items', () => {
    it('should retrieve draft invoice items for a company', async () => {
      const mockResponse: InvoiceItemListResponse = {
        content: Array.from({ length: 3 }, (_, i) => makeInvoiceItem(`draft-${i + 1}`, undefined, 'comp-999')),
        page: {
          size: 10,
          totalElements: 3,
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

      const result = await listDraftInvoiceItems(mockClient, 'comp-999');

      expect(result.content).toHaveLength(3);
      expect(result.content[0].invoiceId).toBeUndefined();
      expect(result.content[0].companyId).toBe('comp-999');
    });

    it('should paginate through draft invoice items', async () => {
      const firstPage: InvoiceItemListResponse = {
        content: Array.from({ length: 20 }, (_, i) => makeInvoiceItem(`draft-page1-${i + 1}`, undefined, 'comp-abc')),
        page: {
          size: 20,
          totalElements: 35,
          totalPages: 2,
          number: 0,
        },
      };

      const secondPage: InvoiceItemListResponse = {
        content: Array.from({ length: 15 }, (_, i) => makeInvoiceItem(`draft-page2-${i + 1}`, undefined, 'comp-abc')),
        page: {
          size: 20,
          totalElements: 35,
          totalPages: 2,
          number: 1,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(firstPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(secondPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const page1 = await listDraftInvoiceItems(mockClient, 'comp-abc', { page: 0, size: 20 });
      const page2 = await listDraftInvoiceItems(mockClient, 'comp-abc', { page: 1, size: 20 });

      expect(page1.content).toHaveLength(20);
      expect(page2.content).toHaveLength(15);
      expect(page1.page.number).toBe(0);
      expect(page2.page.number).toBe(1);
    });

    it('should return empty results when no draft items exist', async () => {
      const mockResponse: InvoiceItemListResponse = {
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

      const result = await listDraftInvoiceItems(mockClient, 'comp-new');

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });
  });

  describe('Complete Invoice Workflow', () => {
    it('should support list -> detail -> items workflow', async () => {
      // Step 1: List invoices for a company
      const listResponse: InvoiceListResponse = {
        content: [makeInvoice('inv-flow-1', 'comp-flow')],
        page: {
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };

      // Step 2: Get invoice detail
      const detailResponse: Invoice = {
        id: 'inv-flow-1',
        companyId: 'comp-flow',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        total: 1500.0,
        balance: 1500.0,
        status: 'Unpaid',
      };

      // Step 3: Get invoice items
      const itemsResponse: InvoiceItemListResponse = {
        content: [makeInvoiceItem('item-flow-1', 'inv-flow-1', 'comp-flow')],
        page: {
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(listResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(detailResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(itemsResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const invoices = await listInvoices(mockClient, { companyId: 'comp-flow' });
      const invoice = await getInvoice(mockClient, invoices.content[0].id);
      const items = await listInvoiceItems(mockClient, invoice.id);

      expect(invoices.content).toHaveLength(1);
      expect(invoice.id).toBe('inv-flow-1');
      expect(items.content).toHaveLength(1);
      expect(items.content[0].invoiceId).toBe('inv-flow-1');
    });
  });
});
