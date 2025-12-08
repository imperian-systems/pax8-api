import { Pax8Error, Pax8ErrorOptions } from './pax8-error';

export interface Pax8AuthenticationErrorOptions extends Pax8ErrorOptions {}

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
