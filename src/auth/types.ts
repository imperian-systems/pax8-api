/** Token type returned by the Pax8 OAuth endpoint. */
export type TokenType = 'Bearer';

/** OAuth 2.0 grant type used for Pax8 authentication. */
export type GrantType = 'client_credentials';

/** Request payload for obtaining an access token from Pax8. */
export interface TokenRequest {
  /** OAuth client ID issued by Pax8. */
  client_id: string;
  /** OAuth client secret issued by Pax8. */
  client_secret: string;
  /** Target API audience (e.g., https://api.pax8.com). */
  audience: string;
  /** Grant type used when exchanging client credentials. */
  grant_type: GrantType;
}

/** Successful token response returned by the Pax8 token service. */
export interface TokenResponse {
  /** Bearer token value to use in Authorization headers. */
  access_token: string;
  /** Token lifetime in seconds. */
  expires_in: number;
  /** Token type identifier (always Bearer). */
  token_type: TokenType;
}

/** Error response schema returned when token acquisition fails. */
export interface TokenErrorResponse {
  /** Error code from the token service (e.g., access_denied). */
  error: string;
  /** Human-readable description of the failure. */
  error_description: string;
}

/**
 * Internal representation of an access token with expiry tracking.
 * Consumers should use helper methods rather than reading values directly.
 */
export interface AccessToken {
  /** Bearer token value to include in requests. */
  value: string;
  /** Epoch milliseconds when the token expires. */
  expiresAt: number;
  /** Token type identifier (always Bearer). */
  tokenType: TokenType;
}
