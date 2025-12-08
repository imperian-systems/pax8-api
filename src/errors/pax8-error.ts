export interface Pax8ErrorOptions extends ErrorOptions {
  status?: number;
  type?: string;
  instance?: string;
  details?: Record<string, unknown>;
}

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
