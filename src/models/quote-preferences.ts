/**
 * Quote Preferences API models and types.
 * Based on Pax8 Quoting Endpoints v2 OpenAPI specification.
 */

/**
 * Partner-level quote preferences.
 */
export interface QuotePreferences {
  /** Default days until quote expiration */
  daysToExpire: number;

  /** Default introduction message */
  introMessage: string;

  /** Default terms and disclaimers */
  termsAndDisclaimers: string;
}

/**
 * Payload for updating quote preferences.
 */
export interface UpdateQuotePreferencesPayload {
  /** Days until expiration */
  daysToExpire?: number;

  /** Introduction message */
  introMessage?: string;

  /** Terms and disclaimers */
  termsAndDisclaimers?: string;
}
