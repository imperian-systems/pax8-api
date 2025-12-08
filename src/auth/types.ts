export type TokenType = 'Bearer';
export type GrantType = 'client_credentials';

export interface TokenRequest {
  client_id: string;
  client_secret: string;
  audience: string;
  grant_type: GrantType;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: TokenType;
}

export interface TokenErrorResponse {
  error: string;
  error_description: string;
}

export interface AccessToken {
  value: string;
  expiresAt: number;
  tokenType: TokenType;
}
