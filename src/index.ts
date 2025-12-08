export { Pax8Client } from './client/pax8-client';
export type { Pax8ClientConfig, ResolvedPax8ClientConfig } from './client/config';

export { Pax8Error } from './errors/pax8-error';
export type { Pax8ErrorOptions } from './errors/pax8-error';
export { Pax8AuthenticationError } from './errors/auth-error';

export type {
  AccessToken,
  GrantType,
  TokenErrorResponse,
  TokenRequest,
  TokenResponse,
  TokenType,
} from './auth/types';
