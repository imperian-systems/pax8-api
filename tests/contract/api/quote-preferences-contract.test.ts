import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuotePreferencesApi } from '../../../src/api/quote-preferences';
import type { QuotePreferencesApiClient } from '../../../src/api/quote-preferences';
import type { QuotePreferences, UpdateQuotePreferencesPayload } from '../../../src/models/quote-preferences';

/**
 * Contract tests for Quote Preferences API endpoints.
 * These tests verify request/response structures match the Pax8 Quoting API v2 OpenAPI specification.
 */

describe('Quote Preferences API Contract Tests', () => {
  let mockClient: QuotePreferencesApiClient;
  let quotePreferencesApi: QuotePreferencesApi;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
    quotePreferencesApi = new QuotePreferencesApi(mockClient);
  });

  // ============================================================================
  // User Story 5: Quote Preferences
  // ============================================================================

  describe('GET /v2/quote-preferences - getPreferences', () => {
    it('should return 200 with valid preferences structure', async () => {
      const mockPreferences: QuotePreferences = {
        daysToExpire: 30,
        introMessage: 'Thank you for considering our services. We look forward to working with you!',
        termsAndDisclaimers: 'All prices are subject to change. Terms and conditions apply.',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPreferences), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotePreferencesApi.get();

      expect(result).toEqual(mockPreferences);
      expect(result.daysToExpire).toBe(30);
      expect(result.introMessage).toBeTruthy();
      expect(result.termsAndDisclaimers).toBeTruthy();
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quote-preferences');
    });

    it('should return 401 for unauthorized request', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized', type: 'ACCESS_DENIED' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(quotePreferencesApi.get()).rejects.toThrow();
    });

    it('should return empty/default preferences if none set', async () => {
      const mockPreferences: QuotePreferences = {
        daysToExpire: 30,
        introMessage: '',
        termsAndDisclaimers: '',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPreferences), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotePreferencesApi.get();

      expect(result).toEqual(mockPreferences);
      expect(result.daysToExpire).toBe(30);
      expect(result.introMessage).toBe('');
      expect(result.termsAndDisclaimers).toBe('');
    });
  });

  describe('PUT /v2/quote-preferences - updatePreferences', () => {
    it('should return 200 with updated preferences structure', async () => {
      const payload: UpdateQuotePreferencesPayload = {
        daysToExpire: 45,
        introMessage: 'Updated introduction message',
        termsAndDisclaimers: 'Updated terms and disclaimers',
      };

      const mockPreferences: QuotePreferences = {
        daysToExpire: 45,
        introMessage: 'Updated introduction message',
        termsAndDisclaimers: 'Updated terms and disclaimers',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPreferences), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotePreferencesApi.update(payload);

      expect(result).toEqual(mockPreferences);
      expect(result.daysToExpire).toBe(45);
      expect(result.introMessage).toBe('Updated introduction message');
      expect(mockClient.request).toHaveBeenCalledWith('/v2/quote-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });

    it('should allow partial updates (only daysToExpire)', async () => {
      const payload: UpdateQuotePreferencesPayload = {
        daysToExpire: 60,
      };

      const mockPreferences: QuotePreferences = {
        daysToExpire: 60,
        introMessage: 'Existing intro message',
        termsAndDisclaimers: 'Existing terms',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPreferences), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotePreferencesApi.update(payload);

      expect(result.daysToExpire).toBe(60);
      expect(result.introMessage).toBe('Existing intro message');
    });

    it('should allow partial updates (only introMessage)', async () => {
      const payload: UpdateQuotePreferencesPayload = {
        introMessage: 'New intro only',
      };

      const mockPreferences: QuotePreferences = {
        daysToExpire: 30,
        introMessage: 'New intro only',
        termsAndDisclaimers: 'Existing terms',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPreferences), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotePreferencesApi.update(payload);

      expect(result.introMessage).toBe('New intro only');
      expect(result.daysToExpire).toBe(30);
    });

    it('should allow partial updates (only termsAndDisclaimers)', async () => {
      const payload: UpdateQuotePreferencesPayload = {
        termsAndDisclaimers: 'New terms only',
      };

      const mockPreferences: QuotePreferences = {
        daysToExpire: 30,
        introMessage: 'Existing intro',
        termsAndDisclaimers: 'New terms only',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPreferences), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotePreferencesApi.update(payload);

      expect(result.termsAndDisclaimers).toBe('New terms only');
      expect(result.daysToExpire).toBe(30);
    });

    it('should return 400 for invalid daysToExpire value', async () => {
      const payload: UpdateQuotePreferencesPayload = {
        daysToExpire: -10, // Invalid: negative days
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'Invalid daysToExpire value', type: 'PAYLOAD_VALIDATION' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

      await expect(quotePreferencesApi.update(payload)).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      const payload: UpdateQuotePreferencesPayload = {
        daysToExpire: 45,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized', type: 'ACCESS_DENIED' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(quotePreferencesApi.update(payload)).rejects.toThrow();
    });

    it('should handle empty payload (no updates)', async () => {
      const payload: UpdateQuotePreferencesPayload = {};

      const mockPreferences: QuotePreferences = {
        daysToExpire: 30,
        introMessage: 'Existing intro',
        termsAndDisclaimers: 'Existing terms',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPreferences), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await quotePreferencesApi.update(payload);

      expect(result).toEqual(mockPreferences);
    });
  });
});
