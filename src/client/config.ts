/** User-supplied configuration for constructing a Pax8 client instance. */
export interface Pax8ClientConfig {
  /** OAuth client ID from Pax8 Integrations Hub. */
  clientId: string;
  /** OAuth client secret from Pax8 Integrations Hub. */
  clientSecret: string;
  /** API base URL for subsequent requests. */
  baseUrl?: string;
  /** OAuth token endpoint URL. */
  tokenUrl?: string;
  /** OAuth audience for token requests. */
  audience?: string;
  /** Maximum retry attempts for failed requests. */
  retryAttempts?: number;
  /** Initial retry delay in milliseconds. */
  retryDelay?: number;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Automatically refresh tokens before expiry. */
  autoRefresh?: boolean;
}

/** Fully resolved configuration with defaults applied. */
export type ResolvedPax8ClientConfig = Pax8ClientConfig &
  Required<
    Pick<
      Pax8ClientConfig,
      'audience' | 'autoRefresh' | 'baseUrl' | 'retryAttempts' | 'retryDelay' | 'timeout' | 'tokenUrl'
    >
  >;

/** Default values used when optional configuration fields are omitted. */
export const defaultPax8ClientConfig: Omit<ResolvedPax8ClientConfig, 'clientId' | 'clientSecret'> = {
  baseUrl: 'https://api.pax8.com/v1',
  tokenUrl: 'https://token-manager.pax8.com/oauth/token',
  audience: 'https://api.pax8.com',
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000,
  autoRefresh: true,
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

/**
 * Validate user-supplied configuration and apply defaults.
 *
 * @throws TypeError when required fields are missing or invalid.
 * @returns A new configuration object with defaults and trimmed string fields.
 */
export const validateConfig = (config: Pax8ClientConfig): ResolvedPax8ClientConfig => {
  if (!isNonEmptyString(config.clientId)) {
    throw new TypeError('clientId is required and must be a non-empty string');
  }

  if (!isNonEmptyString(config.clientSecret)) {
    throw new TypeError('clientSecret is required and must be a non-empty string');
  }

  if (config.baseUrl !== undefined && !isNonEmptyString(config.baseUrl)) {
    throw new TypeError('baseUrl must be a non-empty string when provided');
  }

  if (config.tokenUrl !== undefined && !isNonEmptyString(config.tokenUrl)) {
    throw new TypeError('tokenUrl must be a non-empty string when provided');
  }

  if (config.audience !== undefined && !isNonEmptyString(config.audience)) {
    throw new TypeError('audience must be a non-empty string when provided');
  }

  if (config.retryAttempts !== undefined && !isNonNegativeInteger(config.retryAttempts)) {
    throw new TypeError('retryAttempts must be a non-negative integer when provided');
  }

  if (config.retryDelay !== undefined && !isPositiveInteger(config.retryDelay)) {
    throw new TypeError('retryDelay must be a positive integer when provided');
  }

  if (config.timeout !== undefined && !isPositiveInteger(config.timeout)) {
    throw new TypeError('timeout must be a positive integer when provided');
  }

  if (config.autoRefresh !== undefined && typeof config.autoRefresh !== 'boolean') {
    throw new TypeError('autoRefresh must be a boolean when provided');
  }

  const baseUrl = (config.baseUrl ?? defaultPax8ClientConfig.baseUrl).trim();
  const tokenUrl = (config.tokenUrl ?? defaultPax8ClientConfig.tokenUrl).trim();
  const audience = (config.audience ?? defaultPax8ClientConfig.audience).trim();

  return {
    ...defaultPax8ClientConfig,
    ...config,
    clientId: config.clientId.trim(),
    clientSecret: config.clientSecret.trim(),
    baseUrl,
    tokenUrl,
    audience,
    retryAttempts: config.retryAttempts ?? defaultPax8ClientConfig.retryAttempts,
    retryDelay: config.retryDelay ?? defaultPax8ClientConfig.retryDelay,
    timeout: config.timeout ?? defaultPax8ClientConfig.timeout,
    autoRefresh: config.autoRefresh ?? defaultPax8ClientConfig.autoRefresh,
  };
};
