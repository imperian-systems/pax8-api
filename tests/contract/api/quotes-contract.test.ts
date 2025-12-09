import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuotesApi } from '../../../src/api/quotes';
import type { QuotesApiClient } from '../../../src/api/quotes';
import type {
  Quote,
  QuoteListResponse,
  CreateQuotePayload,
  UpdateQuotePayload,
  AddStandardLineItemPayload,
  AddCustomLineItemPayload,
  AddUsageBasedLineItemPayload,
  UpdateLineItemPayload,
  BulkDeleteLineItemsPayload,
  Section,
  CreateSectionPayload,
  UpdateSectionsPayload,
  AccessListEntry,
  AddAccessListPayload,
} from '../../../src/models/quotes';

/**
 * Contract tests for Quotes API endpoints.
 * These tests verify request/response structures match the Pax8 Quoting API v2 OpenAPI specification.
 */

describe('Quotes API Contract Tests', () => {
  let mockClient: QuotesApiClient;
  let quotesApi: QuotesApi;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
    quotesApi = new QuotesApi(mockClient);
  });

  // ============================================================================
  // User Story 1: Quote CRUD Operations
  // ============================================================================

  describe('POST /v2/quotes - createQuote', () => {
    it('should return 201 with valid quote structure', async () => {
      const payload: CreateQuotePayload = {
        clientId: 'client-123',
      };

      const mockQuote: Quote = {
        id: 'quote-123',
        status: 'draft',
        client: { id: 'client-123', name: 'Test Company' },
        partner: { id: 'partner-456', name: 'Partner Corp' },
        lineItems: [],
        totals: {
          initialCost: { amount: 0, currency: 'USD' },
          initialProfit: { amount: 0, currency: 'USD' },
          initialTotal: { amount: 0, currency: 'USD' },
          recurringCost: { amount: 0, currency: 'USD' },
          recurringProfit: { amount: 0, currency: 'USD' },
          recurringTotal: { amount: 0, currency: 'USD' },
        },
        attachments: [],
        referenceCode: 'REF-001',
        introMessage: '',
        termsAndDisclaimers: '',
        expiresOn: '2025-01-31T00:00:00Z',
        published: false,
        publishedOn: null,
        createdBy: 'user-789',
        createdOn: '2024-12-09T00:00:00Z',
        respondedOn: null,
        revokedOn: null,
        acceptedBy: null,
        quoteRequestId: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuote), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.create(payload);

      expect(result).toEqual(mockQuote);
      expect(result.id).toBe('quote-123');
      expect(result.status).toBe('draft');
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });

    it('should return 400 for missing clientId', async () => {
      const invalidPayload = {} as CreateQuotePayload;

      await expect(quotesApi.create(invalidPayload)).rejects.toThrow('clientId is required');
    });

    it('should return 404 if client not found', async () => {
      const payload: CreateQuotePayload = {
        clientId: 'nonexistent-client',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Client not found', type: 'QUOTE_NOT_FOUND' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(quotesApi.create(payload)).rejects.toThrow();
    });
  });

  describe('GET /v2/quotes - listQuotes', () => {
    it('should return 200 with valid quote list response structure', async () => {
      const mockResponse: QuoteListResponse = {
        content: [
          {
            id: 'quote-123',
            status: 'draft',
            client: { id: 'client-123', name: 'Test Company' },
            partner: { id: 'partner-456', name: 'Partner Corp' },
            lineItems: [],
            totals: {
              initialCost: { amount: 0, currency: 'USD' },
              initialProfit: { amount: 0, currency: 'USD' },
              initialTotal: { amount: 0, currency: 'USD' },
              recurringCost: { amount: 0, currency: 'USD' },
              recurringProfit: { amount: 0, currency: 'USD' },
              recurringTotal: { amount: 0, currency: 'USD' },
            },
            attachments: [],
            referenceCode: 'REF-001',
            introMessage: '',
            termsAndDisclaimers: '',
            expiresOn: '2025-01-31T00:00:00Z',
            published: false,
            publishedOn: null,
            createdBy: 'user-789',
            createdOn: '2024-12-09T00:00:00Z',
            respondedOn: null,
            revokedOn: null,
            acceptedBy: null,
            quoteRequestId: null,
          },
        ],
        statusCounts: {
          draft: 1,
          assigned: 0,
          sent: 0,
          closed: 0,
          declined: 0,
          accepted: 0,
          changes_requested: 0,
          expired: 0,
        },
        page: {
          limit: 10,
          page: 1,
          totalElements: 1,
          totalPages: 1,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.list();

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(result.page.limit).toBe(10);
      expect(result.page.page).toBe(1);
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes?limit=10&page=1');
    });

    it('should handle pagination parameters (limit and page)', async () => {
      const mockResponse: QuoteListResponse = {
        content: [],
        statusCounts: {
          draft: 0,
          assigned: 0,
          sent: 0,
          closed: 0,
          declined: 0,
          accepted: 0,
          changes_requested: 0,
          expired: 0,
        },
        page: {
          limit: 20,
          page: 2,
          totalElements: 0,
          totalPages: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.list({ limit: 20, page: 2 });

      expect(result.page.limit).toBe(20);
      expect(result.page.page).toBe(2);
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes?limit=20&page=2');
    });

    it('should handle status filter', async () => {
      const mockResponse: QuoteListResponse = {
        content: [],
        statusCounts: {
          draft: 0,
          assigned: 0,
          sent: 0,
          closed: 0,
          declined: 0,
          accepted: 0,
          changes_requested: 0,
          expired: 0,
        },
        page: {
          limit: 10,
          page: 1,
          totalElements: 0,
          totalPages: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await quotesApi.list({ status: 'draft' });

      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes?limit=10&page=1&status=draft');
    });

    it('should throw error for invalid limit', async () => {
      await expect(quotesApi.list({ limit: 100 })).rejects.toThrow('limit must be between');
    });

    it('should throw error for invalid page (0-indexed)', async () => {
      await expect(quotesApi.list({ page: 0 })).rejects.toThrow('page must be a positive integer');
    });
  });

  describe('GET /v2/quotes/{quoteId} - getQuote', () => {
    it('should return 200 with valid quote structure', async () => {
      const mockQuote: Quote = {
        id: 'quote-123',
        status: 'sent',
        client: { id: 'client-123', name: 'Test Company' },
        partner: { id: 'partner-456', name: 'Partner Corp' },
        lineItems: [
          {
            id: 'line-item-1',
            billingTerm: 'Monthly',
            product: {
              id: 'prod-1',
              name: 'Microsoft 365',
              sku: 'MS365-E3',
              type: 'Standalone',
              isMspOnly: false,
            },
            quantity: 10,
            price: { amount: 20, currency: 'USD' },
            cost: { amount: 15, currency: 'USD' },
            totals: {
              initialCost: { amount: 0, currency: 'USD' },
              initialProfit: { amount: 0, currency: 'USD' },
              initialTotal: { amount: 0, currency: 'USD' },
              recurringCost: { amount: 150, currency: 'USD' },
              recurringProfit: { amount: 50, currency: 'USD' },
              recurringTotal: { amount: 200, currency: 'USD' },
            },
            effectiveDate: '2024-12-01T00:00:00Z',
            note: null,
            subscriptionId: null,
            commitmentTerm: null,
            relationship: null,
            usageBased: null,
          },
        ],
        totals: {
          initialCost: { amount: 0, currency: 'USD' },
          initialProfit: { amount: 0, currency: 'USD' },
          initialTotal: { amount: 0, currency: 'USD' },
          recurringCost: { amount: 150, currency: 'USD' },
          recurringProfit: { amount: 50, currency: 'USD' },
          recurringTotal: { amount: 200, currency: 'USD' },
        },
        attachments: [],
        referenceCode: 'REF-001',
        introMessage: 'Thank you for your interest',
        termsAndDisclaimers: 'Standard terms apply',
        expiresOn: '2025-01-31T00:00:00Z',
        published: true,
        publishedOn: '2024-12-09T00:00:00Z',
        createdBy: 'user-789',
        createdOn: '2024-12-09T00:00:00Z',
        respondedOn: null,
        revokedOn: null,
        acceptedBy: null,
        quoteRequestId: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuote), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.get('quote-123');

      expect(result).toEqual(mockQuote);
      expect(result.id).toBe('quote-123');
      expect(result.lineItems).toHaveLength(1);
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123');
    });

    it('should return 404 for nonexistent quote', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Quote not found', type: 'QUOTE_NOT_FOUND' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(quotesApi.get('nonexistent-quote')).rejects.toThrow();
    });

    it('should throw error for empty quoteId', async () => {
      await expect(quotesApi.get('')).rejects.toThrow('quoteId is required');
    });
  });

  describe('PUT /v2/quotes/{quoteId} - updateQuote', () => {
    it('should return 200 with updated quote structure', async () => {
      const payload: UpdateQuotePayload = {
        status: 'sent',
        introMessage: 'Updated introduction',
      };

      const mockQuote: Quote = {
        id: 'quote-123',
        status: 'sent',
        client: { id: 'client-123', name: 'Test Company' },
        partner: { id: 'partner-456', name: 'Partner Corp' },
        lineItems: [],
        totals: {
          initialCost: { amount: 0, currency: 'USD' },
          initialProfit: { amount: 0, currency: 'USD' },
          initialTotal: { amount: 0, currency: 'USD' },
          recurringCost: { amount: 0, currency: 'USD' },
          recurringProfit: { amount: 0, currency: 'USD' },
          recurringTotal: { amount: 0, currency: 'USD' },
        },
        attachments: [],
        referenceCode: 'REF-001',
        introMessage: 'Updated introduction',
        termsAndDisclaimers: '',
        expiresOn: '2025-01-31T00:00:00Z',
        published: false,
        publishedOn: null,
        createdBy: 'user-789',
        createdOn: '2024-12-09T00:00:00Z',
        respondedOn: null,
        revokedOn: null,
        acceptedBy: null,
        quoteRequestId: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuote), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.update('quote-123', payload);

      expect(result).toEqual(mockQuote);
      expect(result.status).toBe('sent');
      expect(result.introMessage).toBe('Updated introduction');
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });

    it('should return 404 for nonexistent quote', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Quote not found', type: 'QUOTE_NOT_FOUND' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(quotesApi.update('nonexistent-quote', { status: 'sent' })).rejects.toThrow();
    });
  });

  describe('DELETE /v2/quotes/{quoteId} - deleteQuote', () => {
    it('should return 204 on successful deletion', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        })
      );

      await quotesApi.delete('quote-123');

      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123', {
        method: 'DELETE',
      });
    });

    it('should return 404 for nonexistent quote', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Quote not found', type: 'QUOTE_NOT_FOUND' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(quotesApi.delete('nonexistent-quote')).rejects.toThrow();
    });

    it('should throw error for empty quoteId', async () => {
      await expect(quotesApi.delete('')).rejects.toThrow('quoteId is required');
    });
  });

  // ============================================================================
  // User Story 2: Line Item Management
  // ============================================================================

  describe('POST /v2/quotes/{quoteId}/line-items - addLineItems (Standard)', () => {
    it('should add standard line items and return updated quote', async () => {
      const lineItems: AddStandardLineItemPayload[] = [
        {
          type: 'Standard',
          productId: 'prod-1',
          billingTerm: 'Monthly',
          quantity: 5,
        },
      ];

      const mockQuote: Quote = {
        id: 'quote-123',
        status: 'draft',
        client: { id: 'client-123', name: 'Test Company' },
        partner: { id: 'partner-456', name: 'Partner Corp' },
        lineItems: [
          {
            id: 'line-item-1',
            billingTerm: 'Monthly',
            product: {
              id: 'prod-1',
              name: 'Product 1',
              sku: 'SKU-1',
              type: 'Standalone',
              isMspOnly: false,
            },
            quantity: 5,
            price: { amount: 10, currency: 'USD' },
            cost: { amount: 8, currency: 'USD' },
            totals: {
              initialCost: { amount: 0, currency: 'USD' },
              initialProfit: { amount: 0, currency: 'USD' },
              initialTotal: { amount: 0, currency: 'USD' },
              recurringCost: { amount: 40, currency: 'USD' },
              recurringProfit: { amount: 10, currency: 'USD' },
              recurringTotal: { amount: 50, currency: 'USD' },
            },
            effectiveDate: null,
            note: null,
            subscriptionId: null,
            commitmentTerm: null,
            relationship: null,
            usageBased: null,
          },
        ],
        totals: {
          initialCost: { amount: 0, currency: 'USD' },
          initialProfit: { amount: 0, currency: 'USD' },
          initialTotal: { amount: 0, currency: 'USD' },
          recurringCost: { amount: 40, currency: 'USD' },
          recurringProfit: { amount: 10, currency: 'USD' },
          recurringTotal: { amount: 50, currency: 'USD' },
        },
        attachments: [],
        referenceCode: 'REF-001',
        introMessage: '',
        termsAndDisclaimers: '',
        expiresOn: '2025-01-31T00:00:00Z',
        published: false,
        publishedOn: null,
        createdBy: 'user-789',
        createdOn: '2024-12-09T00:00:00Z',
        respondedOn: null,
        revokedOn: null,
        acceptedBy: null,
        quoteRequestId: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuote), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.addLineItems('quote-123', lineItems);

      expect(result).toEqual(mockQuote);
      expect(result.lineItems).toHaveLength(1);
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123/line-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineItems }),
      });
    });
  });

  describe('POST /v2/quotes/{quoteId}/line-items - addLineItems (Custom)', () => {
    it('should add custom line items and return updated quote', async () => {
      const lineItems: AddCustomLineItemPayload[] = [
        {
          type: 'Custom',
          productName: 'Custom Service',
          productSku: 'CUSTOM-001',
          billingTerm: 'One-Time',
          quantity: 1,
          cost: { amount: 100, currency: 'USD' },
          price: { amount: 150, currency: 'USD' },
        },
      ];

      const mockQuote: Quote = {
        id: 'quote-123',
        status: 'draft',
        client: { id: 'client-123', name: 'Test Company' },
        partner: { id: 'partner-456', name: 'Partner Corp' },
        lineItems: [
          {
            id: 'line-item-1',
            billingTerm: 'One-Time',
            product: null,
            quantity: 1,
            price: { amount: 150, currency: 'USD' },
            cost: { amount: 100, currency: 'USD' },
            totals: {
              initialCost: { amount: 100, currency: 'USD' },
              initialProfit: { amount: 50, currency: 'USD' },
              initialTotal: { amount: 150, currency: 'USD' },
              recurringCost: { amount: 0, currency: 'USD' },
              recurringProfit: { amount: 0, currency: 'USD' },
              recurringTotal: { amount: 0, currency: 'USD' },
            },
            effectiveDate: null,
            note: null,
            subscriptionId: null,
            commitmentTerm: null,
            relationship: null,
            usageBased: null,
          },
        ],
        totals: {
          initialCost: { amount: 100, currency: 'USD' },
          initialProfit: { amount: 50, currency: 'USD' },
          initialTotal: { amount: 150, currency: 'USD' },
          recurringCost: { amount: 0, currency: 'USD' },
          recurringProfit: { amount: 0, currency: 'USD' },
          recurringTotal: { amount: 0, currency: 'USD' },
        },
        attachments: [],
        referenceCode: 'REF-001',
        introMessage: '',
        termsAndDisclaimers: '',
        expiresOn: '2025-01-31T00:00:00Z',
        published: false,
        publishedOn: null,
        createdBy: 'user-789',
        createdOn: '2024-12-09T00:00:00Z',
        respondedOn: null,
        revokedOn: null,
        acceptedBy: null,
        quoteRequestId: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuote), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.addLineItems('quote-123', lineItems);

      expect(result).toEqual(mockQuote);
      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0].product).toBeNull();
    });
  });

  describe('POST /v2/quotes/{quoteId}/line-items - addLineItems (UsageBased)', () => {
    it('should add usage-based line items and return updated quote', async () => {
      const lineItems: AddUsageBasedLineItemPayload[] = [
        {
          type: 'UsageBased',
          productId: 'prod-2',
          billingTerm: 'Monthly',
          quantity: 1,
          cost: { amount: 0, currency: 'USD' },
          usageBased: {
            type: 'QTY_VARIES',
            displayNote: true,
          },
        },
      ];

      const mockQuote: Quote = {
        id: 'quote-123',
        status: 'draft',
        client: { id: 'client-123', name: 'Test Company' },
        partner: { id: 'partner-456', name: 'Partner Corp' },
        lineItems: [
          {
            id: 'line-item-1',
            billingTerm: 'Monthly',
            product: {
              id: 'prod-2',
              name: 'Usage Product',
              sku: 'USAGE-1',
              type: 'Standalone',
              isMspOnly: false,
            },
            quantity: 1,
            price: { amount: 0, currency: 'USD' },
            cost: { amount: 0, currency: 'USD' },
            totals: {
              initialCost: { amount: 0, currency: 'USD' },
              initialProfit: { amount: 0, currency: 'USD' },
              initialTotal: { amount: 0, currency: 'USD' },
              recurringCost: { amount: 0, currency: 'USD' },
              recurringProfit: { amount: 0, currency: 'USD' },
              recurringTotal: { amount: 0, currency: 'USD' },
            },
            effectiveDate: null,
            note: null,
            subscriptionId: null,
            commitmentTerm: null,
            relationship: null,
            usageBased: {
              type: 'QTY_VARIES',
              displayNote: true,
            },
          },
        ],
        totals: {
          initialCost: { amount: 0, currency: 'USD' },
          initialProfit: { amount: 0, currency: 'USD' },
          initialTotal: { amount: 0, currency: 'USD' },
          recurringCost: { amount: 0, currency: 'USD' },
          recurringProfit: { amount: 0, currency: 'USD' },
          recurringTotal: { amount: 0, currency: 'USD' },
        },
        attachments: [],
        referenceCode: 'REF-001',
        introMessage: '',
        termsAndDisclaimers: '',
        expiresOn: '2025-01-31T00:00:00Z',
        published: false,
        publishedOn: null,
        createdBy: 'user-789',
        createdOn: '2024-12-09T00:00:00Z',
        respondedOn: null,
        revokedOn: null,
        acceptedBy: null,
        quoteRequestId: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuote), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.addLineItems('quote-123', lineItems);

      expect(result).toEqual(mockQuote);
      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0].usageBased).toBeDefined();
      expect(result.lineItems[0].usageBased?.type).toBe('QTY_VARIES');
    });
  });

  describe('PUT /v2/quotes/{quoteId}/line-items - updateLineItems', () => {
    it('should update line items and return updated quote', async () => {
      const lineItems: UpdateLineItemPayload[] = [
        {
          id: 'line-item-1',
          quantity: 10,
          price: { amount: 25, currency: 'USD' },
        },
      ];

      const mockQuote: Quote = {
        id: 'quote-123',
        status: 'draft',
        client: { id: 'client-123', name: 'Test Company' },
        partner: { id: 'partner-456', name: 'Partner Corp' },
        lineItems: [
          {
            id: 'line-item-1',
            billingTerm: 'Monthly',
            product: {
              id: 'prod-1',
              name: 'Product 1',
              sku: 'SKU-1',
              type: 'Standalone',
              isMspOnly: false,
            },
            quantity: 10,
            price: { amount: 25, currency: 'USD' },
            cost: { amount: 8, currency: 'USD' },
            totals: {
              initialCost: { amount: 0, currency: 'USD' },
              initialProfit: { amount: 0, currency: 'USD' },
              initialTotal: { amount: 0, currency: 'USD' },
              recurringCost: { amount: 80, currency: 'USD' },
              recurringProfit: { amount: 170, currency: 'USD' },
              recurringTotal: { amount: 250, currency: 'USD' },
            },
            effectiveDate: null,
            note: null,
            subscriptionId: null,
            commitmentTerm: null,
            relationship: null,
            usageBased: null,
          },
        ],
        totals: {
          initialCost: { amount: 0, currency: 'USD' },
          initialProfit: { amount: 0, currency: 'USD' },
          initialTotal: { amount: 0, currency: 'USD' },
          recurringCost: { amount: 80, currency: 'USD' },
          recurringProfit: { amount: 170, currency: 'USD' },
          recurringTotal: { amount: 250, currency: 'USD' },
        },
        attachments: [],
        referenceCode: 'REF-001',
        introMessage: '',
        termsAndDisclaimers: '',
        expiresOn: '2025-01-31T00:00:00Z',
        published: false,
        publishedOn: null,
        createdBy: 'user-789',
        createdOn: '2024-12-09T00:00:00Z',
        respondedOn: null,
        revokedOn: null,
        acceptedBy: null,
        quoteRequestId: null,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuote), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.updateLineItems('quote-123', lineItems);

      expect(result).toEqual(mockQuote);
      expect(result.lineItems[0].quantity).toBe(10);
      expect(result.lineItems[0].price.amount).toBe(25);
    });
  });

  describe('DELETE /v2/quotes/{quoteId}/line-items/{lineItemId} - deleteLineItem', () => {
    it('should return 204 on successful deletion', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        })
      );

      await quotesApi.deleteLineItem('quote-123', 'line-item-1');

      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123/line-items/line-item-1', {
        method: 'DELETE',
      });
    });

    it('should throw error for empty lineItemId', async () => {
      await expect(quotesApi.deleteLineItem('quote-123', '')).rejects.toThrow('lineItemId is required');
    });
  });

  describe('POST /v2/quotes/{quoteId}/line-items/bulk-delete - bulkDeleteLineItems', () => {
    it('should return 204 on successful bulk deletion', async () => {
      const payload: BulkDeleteLineItemsPayload = {
        lineItemIds: ['line-item-1', 'line-item-2'],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        })
      );

      await quotesApi.bulkDeleteLineItems('quote-123', payload);

      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123/line-items/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });
  });

  // ============================================================================
  // User Story 3: Section Management
  // ============================================================================

  describe('GET /v2/quotes/{quoteId}/sections - getSections', () => {
    it('should return array of sections', async () => {
      const mockSections: Section[] = [
        {
          id: 'section-1',
          name: 'Microsoft Products',
          order: 1,
          lineItems: [
            { lineItemId: 'line-item-1', order: 1 },
            { lineItemId: 'line-item-2', order: 2 },
          ],
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSections), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.getSections('quote-123');

      expect(result).toEqual(mockSections);
      expect(result).toHaveLength(1);
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123/sections');
    });
  });

  describe('POST /v2/quotes/{quoteId}/sections - createSection', () => {
    it('should create section and return all sections', async () => {
      const payload: CreateSectionPayload = {
        name: 'Google Workspace Products',
      };

      const mockSections: Section[] = [
        {
          id: 'section-1',
          name: 'Microsoft Products',
          order: 1,
          lineItems: [],
        },
        {
          id: 'section-2',
          name: 'Google Workspace Products',
          order: 2,
          lineItems: [],
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSections), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.createSection('quote-123', payload);

      expect(result).toEqual(mockSections);
      expect(result).toHaveLength(2);
    });
  });

  describe('PUT /v2/quotes/{quoteId}/sections - updateSections', () => {
    it('should update sections and return all sections', async () => {
      const payload: UpdateSectionsPayload = {
        sections: [
          {
            id: 'section-1',
            name: 'Updated Section Name',
            order: 1,
          },
        ],
      };

      const mockSections: Section[] = [
        {
          id: 'section-1',
          name: 'Updated Section Name',
          order: 1,
          lineItems: [],
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSections), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.updateSections('quote-123', payload);

      expect(result).toEqual(mockSections);
      expect(result[0].name).toBe('Updated Section Name');
    });
  });

  // ============================================================================
  // User Story 4: Access List Management
  // ============================================================================

  describe('GET /v2/quotes/{quoteId}/access-list - getAccessList', () => {
    it('should return array of access list entries', async () => {
      const mockAccessList: AccessListEntry[] = [
        {
          id: 'entry-1',
          email: 'customer@example.com',
          link: 'https://quotes.pax8.com/view/abc123',
          userId: 'user-123',
        },
        {
          id: 'entry-2',
          email: 'stakeholder@example.com',
          link: 'https://quotes.pax8.com/view/def456',
          userId: null,
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockAccessList), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.getAccessList('quote-123');

      expect(result).toEqual(mockAccessList);
      expect(result).toHaveLength(2);
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123/access-list');
    });
  });

  describe('POST /v2/quotes/{quoteId}/access-list - addAccessListEntries', () => {
    it('should add entries and return updated access list', async () => {
      const payload: AddAccessListPayload = {
        emails: ['newcustomer@example.com', 'partner@example.com'],
      };

      const mockAccessList: AccessListEntry[] = [
        {
          id: 'entry-3',
          email: 'newcustomer@example.com',
          link: 'https://quotes.pax8.com/view/ghi789',
          userId: null,
        },
        {
          id: 'entry-4',
          email: 'partner@example.com',
          link: 'https://quotes.pax8.com/view/jkl012',
          userId: null,
        },
      ];

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockAccessList), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotesApi.addAccessListEntries('quote-123', payload);

      expect(result).toEqual(mockAccessList);
      expect(result).toHaveLength(2);
    });
  });

  describe('DELETE /v2/quotes/{quoteId}/access-list/{accessListEntryId} - deleteAccessListEntry', () => {
    it('should return 204 on successful deletion', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        })
      );

      await quotesApi.deleteAccessListEntry('quote-123', 'entry-1');

      expect(mockClient.request).toHaveBeenCalledWith('/v2/quotes/quote-123/access-list/entry-1', {
        method: 'DELETE',
      });
    });

    it('should throw error for empty accessListEntryId', async () => {
      await expect(quotesApi.deleteAccessListEntry('quote-123', '')).rejects.toThrow('accessListEntryId is required');
    });
  });
});
