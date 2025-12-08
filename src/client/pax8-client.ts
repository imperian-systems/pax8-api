import { TokenManager } from '../auth/token-manager';
import { Pax8ClientConfig, ResolvedPax8ClientConfig, validateConfig } from './config';

/**
 * Main entry point for interacting with the Pax8 API. Handles configuration and authentication lifecycle.
 */
export class Pax8Client {
  private readonly config: ResolvedPax8ClientConfig;

  private readonly tokenManager: TokenManager;

  constructor(config: Pax8ClientConfig) {
    this.config = validateConfig(config);
    this.tokenManager = new TokenManager(this.config);
  }

  /** Current client configuration with defaults applied. */
  get configuration(): ResolvedPax8ClientConfig {
    return { ...this.config };
  }

  /** Manually refresh the access token. Useful when autoRefresh is disabled. */
  async refreshToken(): Promise<void> {
    await this.tokenManager.refreshToken();
  }

  /** Returns true if a non-expired token is currently cached. */
  isTokenValid(): boolean {
    return this.tokenManager.isTokenValid();
  }

  /** Returns the cached token expiration timestamp (ms) or null if no token is cached. */
  getTokenExpiresAt(): number | null {
    return this.tokenManager.getTokenExpiresAt();
  }

  /** Perform an HTTP request with automatic token acquisition. */
  async request(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await this.tokenManager.ensureValidToken();

    const headers = new Headers(init.headers ?? {});
    if (!headers.has('authorization')) {
      headers.set('Authorization', `${token.tokenType} ${token.value}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    if (init.signal) {
      if (init.signal.aborted) {
        controller.abort(init.signal.reason);
      } else {
        init.signal.addEventListener('abort', () => controller.abort(init.signal?.reason), { once: true });
      }
    }

    const url = new URL(path, this.config.baseUrl);

    try {
      return await fetch(url, { ...init, headers, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
