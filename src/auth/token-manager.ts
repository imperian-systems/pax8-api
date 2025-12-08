import { AccessToken, TokenErrorResponse, TokenRequest, TokenResponse } from './types';
import { ResolvedPax8ClientConfig } from '../client/config';
import { Pax8AuthenticationError } from '../errors/auth-error';
import { Pax8Error } from '../errors/pax8-error';
import { withRetry } from '../http/retry';

const MAX_RETRY_DELAY_MS = 30000;
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfter = (header: string | null): number | undefined => {
  if (!header) {
    return undefined;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const dateTime = Date.parse(header);
  if (!Number.isNaN(dateTime)) {
    return Math.max(dateTime - Date.now(), 0);
  }

  return undefined;
};

const createTimeoutSignal = (timeoutMs: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
};

export class TokenManager {
  private readonly config: ResolvedPax8ClientConfig;

  private token: AccessToken | null = null;

  private refreshPromise: Promise<AccessToken> | null = null;

  constructor(config: ResolvedPax8ClientConfig) {
    this.config = config;
  }

  public async ensureValidToken(): Promise<AccessToken> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentToken = this.token;

    const shouldRefresh =
      !currentToken || this.isExpired(currentToken) || (this.config.autoRefresh && this.isTokenExpiringSoon(currentToken));

    if (!shouldRefresh && currentToken) {
      return currentToken;
    }

    return this.startRefresh();
  }

  public refreshToken(): Promise<AccessToken> {
    return this.startRefresh();
  }

  public isTokenValid(): boolean {
    const currentToken = this.token;
    return Boolean(currentToken && !this.isExpired(currentToken));
  }

  public getTokenExpiresAt(): number | null {
    return this.token?.expiresAt ?? null;
  }

  private startRefresh(): Promise<AccessToken> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh()
        .then((token) => {
          this.token = token;
          return token;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  private isExpired(token: AccessToken): boolean {
    return token.expiresAt <= Date.now();
  }

  private isTokenExpiringSoon(token: AccessToken): boolean {
    return token.expiresAt <= Date.now() + EXPIRY_BUFFER_MS;
  }

  private async doRefresh(): Promise<AccessToken> {
    const requestBody: TokenRequest = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      audience: this.config.audience,
      grant_type: 'client_credentials',
    };

    const execute = async (): Promise<AccessToken> => {
      const { signal, cancel } = createTimeoutSignal(this.config.timeout);

      try {
        const response = await fetch(this.config.tokenUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal,
        });

        const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
        const contentType = response.headers.get('content-type') ?? '';
        const isJson = contentType.includes('application/json');

        if (response.ok) {
          const payload = (await response.json()) as TokenResponse;
          return this.toAccessToken(payload);
        }

        let errorBody: TokenErrorResponse | undefined;
        if (isJson) {
          try {
            errorBody = (await response.json()) as TokenErrorResponse;
          } catch {
            // ignore JSON parse errors for error responses
          }
        }

        if (response.status === 401) {
          throw new Pax8AuthenticationError(
            errorBody?.error_description
              ? `Authentication failed: ${errorBody.error_description}`
              : 'Authentication failed: Invalid client credentials',
            {
              status: 401,
              instance: '/oauth/token',
              details: errorBody
                ? { error: errorBody.error, error_description: errorBody.error_description }
                : undefined,
            },
          );
        }

        const error: Pax8Error & { retryAfterMs?: number } = new Pax8Error(
          `Token request failed with status ${response.status}`,
          {
            status: response.status,
            instance: '/oauth/token',
            details: errorBody
              ? { error: errorBody.error, error_description: errorBody.error_description }
              : undefined,
          },
        ) as Pax8Error & { retryAfterMs?: number };

        if (retryAfterMs !== undefined) {
          error.retryAfterMs = retryAfterMs;
        }

        throw error;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          throw new Error('Token request timed out');
        }

        throw error;
      } finally {
        cancel();
      }
    };

    try {
      return await withRetry(execute, {
        attempts: this.config.retryAttempts,
        baseDelayMs: this.config.retryDelay,
        maxDelayMs: MAX_RETRY_DELAY_MS,
        shouldRetry: (error) => this.shouldRetryTokenRequest(error),
      });
    } catch (error) {
      if (error instanceof Pax8AuthenticationError) {
        throw error;
      }

      const attemptNote = this.config.retryAttempts > 1 ? ` after ${this.config.retryAttempts} attempts` : '';
      const detail = error instanceof Error && error.message ? `: ${error.message}` : '';

      throw new Pax8Error(`Token refresh failed${attemptNote}${detail}`, {
        status: (error as Pax8Error)?.status,
        instance: '/oauth/token',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  private toAccessToken(response: TokenResponse): AccessToken {
    return {
      value: response.access_token,
      tokenType: response.token_type,
      expiresAt: Date.now() + response.expires_in * 1000,
    };
  }

  private async shouldRetryTokenRequest(error: unknown): Promise<boolean> {
    if (error instanceof Pax8AuthenticationError) {
      return false;
    }

    const status = (error as Pax8Error)?.status ?? (error as { status?: number }).status;

    if (status === 401 || status === 400) {
      return false;
    }

    const retryAfterMs = (error as { retryAfterMs?: number }).retryAfterMs;
    if (retryAfterMs && retryAfterMs > 0) {
      await delay(retryAfterMs);
      return true;
    }

    if (typeof status === 'number') {
      if (status === 429) {
        return true;
      }

      return status >= 500 && status < 600;
    }

    // Network or unknown errors are considered retryable
    return true;
  }
}
