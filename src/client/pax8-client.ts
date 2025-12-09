import { Pax8ClientConfig, ResolvedPax8ClientConfig, validateConfig } from './config';
import { CompaniesApi } from '../api/companies';
import { ContactsApi } from '../api/contacts';
import { InvoicesApi } from '../api/invoices';
import { OrdersApi } from '../api/orders';
import { ProductsApi } from '../api/products';
import { SubscriptionsApi } from '../api/subscriptions';
import { UsageSummariesApi } from '../api/usage-summaries';
import { QuotesApi } from '../api/quotes';
import { QuotePreferencesApi } from '../api/quote-preferences';
import { TokenManager } from '../auth/token-manager';

/**
 * Main entry point for interacting with the Pax8 API.
 *
 * Handles configuration validation, token acquisition/refresh, and HTTP request
 * execution with automatic Authorization headers.
 */
export class Pax8Client {
  private readonly config: ResolvedPax8ClientConfig;

  private readonly tokenManager: TokenManager;

  /** Companies API methods */
  public readonly companies: CompaniesApi;

  /** Contacts API methods */
  public readonly contacts: ContactsApi;

  /** Invoices API methods */
  public readonly invoices: InvoicesApi;

  /** Products API methods */
  public readonly products: ProductsApi;

  /** Orders API methods */
  public readonly orders: OrdersApi;

  /** Subscriptions API methods */
  public readonly subscriptions: SubscriptionsApi;

  /** Usage Summaries API methods */
  public readonly usageSummaries: UsageSummariesApi;

  /** Quotes API methods */
  public readonly quotes: QuotesApi;

  /** Quote Preferences API methods */
  public readonly quotePreferences: QuotePreferencesApi;

  /**
   * Create a new client instance.
   *
   * @param config User-supplied configuration; required values are validated and defaults applied.
   * @throws TypeError when required fields are missing or invalid.
   */
  constructor(config: Pax8ClientConfig) {
    this.config = validateConfig(config);
    this.tokenManager = new TokenManager(this.config);
    this.companies = new CompaniesApi(this);
    this.contacts = new ContactsApi(this);
    this.invoices = new InvoicesApi(this);
    this.products = new ProductsApi(this);
    this.orders = new OrdersApi(this);
    this.subscriptions = new SubscriptionsApi(this);
    this.usageSummaries = new UsageSummariesApi(this);
    this.quotes = new QuotesApi(this);
    this.quotePreferences = new QuotePreferencesApi(this);
  }

  /** Current client configuration with defaults applied. */
  get configuration(): ResolvedPax8ClientConfig {
    return { ...this.config };
  }

  /** Manually refresh the access token. Useful when autoRefresh is disabled. */
  async refreshToken(): Promise<void> {
    await this.tokenManager.refreshToken();
  }

  /**
   * Check whether a non-expired token is cached.
   *
   * @returns true if a token exists and is still valid; false otherwise.
   */
  isTokenValid(): boolean {
    return this.tokenManager.isTokenValid();
  }

  /**
   * Get the cached token expiration timestamp.
   *
   * @returns Epoch milliseconds when the token expires, or null when no token is cached.
   */
  getTokenExpiresAt(): number | null {
    return this.tokenManager.getTokenExpiresAt();
  }

  /**
   * Perform an HTTP request with automatic token acquisition.
   *
   * @param path Relative path (e.g., "/companies") or absolute URL to request.
   * @param init Fetch init options. Authorization header is set if not provided.
   * @returns A fetch Response instance for the requested resource.
   */
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
