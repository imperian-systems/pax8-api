import { handleErrorResponse } from '../http/api-utils.js';
import { QuotePreferences, UpdateQuotePreferencesPayload } from '../models/quote-preferences.js';

export interface QuotePreferencesApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Quote Preferences API namespace for the Pax8Client.
 * Provides methods for managing partner-level quote preferences.
 */
export class QuotePreferencesApi {
  private readonly client: QuotePreferencesApiClient;

  /**
   * Create a new QuotePreferencesApi instance.
   *
   * @param client - The API client instance with request method
   */
  constructor(client: QuotePreferencesApiClient) {
    this.client = client;
  }

  /**
   * Get current quote preferences for the partner.
   *
   * @returns Promise resolving to QuotePreferences
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const prefs = await pax8Client.quotePreferences.get();
   * console.log(`Default expiration: ${prefs.daysToExpire} days`);
   * ```
   */
  async get(): Promise<QuotePreferences> {
    const response = await this.client.request('/v2/quote-preferences');

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    return data as QuotePreferences;
  }

  /**
   * Update quote preferences for the partner.
   *
   * @param payload - The preferences update payload
   * @returns Promise resolving to the updated QuotePreferences
   * @throws {Error} If the API request fails
   *
   * @example
   * ```typescript
   * const updated = await pax8Client.quotePreferences.update({
   *   daysToExpire: 30,
   *   introMessage: 'Thank you for your interest!'
   * });
   * ```
   */
  async update(payload: UpdateQuotePreferencesPayload): Promise<QuotePreferences> {
    const response = await this.client.request('/v2/quote-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data: unknown = await response.json();
    return data as QuotePreferences;
  }
}
