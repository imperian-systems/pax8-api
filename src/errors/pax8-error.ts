/** Options bag for constructing typed Pax8 errors. */
export interface Pax8ErrorOptions extends ErrorOptions {
  /** HTTP status associated with the error, when available. */
  status?: number;
  /** Short, stable identifier describing the error category. */
  type?: string;
  /** Request path or resource instance related to the failure. */
  instance?: string;
  /** Additional structured details useful for debugging. */
  details?: Record<string, unknown>;
}

/**
 * Base error for all Pax8 SDK failures.
 *
 * Extends the native Error to carry HTTP and diagnostic metadata that can be used
 * by consumers for richer logging or programmatic handling.
 */
export class Pax8Error extends Error {
  public readonly status?: number;

  public readonly type?: string;

  public readonly instance?: string;

  public readonly details?: Record<string, unknown>;

  constructor(message: string, options: Pax8ErrorOptions = {}) {
    super(message, { cause: options.cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'Pax8Error';
    this.status = options.status;
    this.type = options.type;
    this.instance = options.instance;
    this.details = options.details;
  }
}
