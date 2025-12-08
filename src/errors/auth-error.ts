import { Pax8Error, Pax8ErrorOptions } from './pax8-error';

/** Options for authentication-specific errors. */
export interface Pax8AuthenticationErrorOptions extends Pax8ErrorOptions {}

/**
 * Authentication failure (e.g., invalid credentials or unauthorized token response).
 *
 * Provides a consistent 401 status and `authentication_error` type so consumers can
 * distinguish credential issues from other Pax8 errors.
 */
export class Pax8AuthenticationError extends Pax8Error {
  constructor(message: string, options: Pax8AuthenticationErrorOptions = {}) {
    super(message, {
      ...options,
      status: options.status ?? 401,
      type: options.type ?? 'authentication_error',
    });

    this.name = 'Pax8AuthenticationError';
  }
}
