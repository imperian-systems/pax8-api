import { handleErrorResponse, validatePage, validateSize, validateNonEmptyString } from '../http/api-utils.js';
import {
  ProductDetail,
  ProductListResponse,
  ListProductsOptions,
  ProvisioningDetailsResponse,
  Dependencies,
  PricingOptions,
  PricingResponse,
  MIN_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PRODUCT_SORT_FIELDS,
} from '../models/products';

export interface ProductsApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Products API namespace for the Pax8Client.
 * Provides methods for listing products, retrieving product details,
 * provisioning details, dependencies, and pricing information.
 */
export class ProductsApi {
  constructor(private readonly client: ProductsApiClient) {}

  /**
   * List products from the Pax8 catalog with page-based pagination.
   *
   * Supports filtering by vendor name and full-text search across product name,
   * vendor, SKU, and ID. Results can be sorted by name or vendor.
   *
   * @param options - Optional filtering, sorting, and pagination parameters
   * @returns Promise resolving to a paginated list of products
   *
   * @example
   * ```typescript
   * // List all products with default pagination (page 0, size 10)
   * const result = await client.products.list();
   *
   * // Filter by vendor with custom page size
   * const msProducts = await client.products.list({
   *   vendorName: 'Microsoft',
   *   size: 25,
   *   sort: 'name'
   * });
   *
   * // Search across products
   * const searchResults = await client.products.list({
   *   search: 'Office 365',
   *   page: 0,
   *   size: 50
   * });
   * ```
   */
  async list(options?: ListProductsOptions): Promise<ProductListResponse> {
    return listProducts(this.client, options);
  }

  /**
   * Get detailed information about a specific product by ID.
   *
   * @param productId - The unique identifier of the product (UUID format)
   * @returns Promise resolving to the product details
   *
   * @example
   * ```typescript
   * const product = await client.products.get('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
   * console.log(product.name, product.description);
   * ```
   */
  async get(productId: string): Promise<ProductDetail> {
    return getProduct(this.client, productId);
  }

  /**
   * Get provisioning configuration details for a product.
   *
   * Returns the fields and settings required for provisioning/ordering this product.
   * This information is dynamic and may change frequently based on vendor updates.
   *
   * **Note**: Provisioning details are dynamic data that can change frequently.
   * Do not cache this information for extended periods. Always fetch fresh data
   * when creating orders or subscriptions.
   *
   * @param productId - The unique identifier of the product (UUID format)
   * @returns Promise resolving to provisioning configuration details
   *
   * @example
   * ```typescript
   * const details = await client.products.getProvisioningDetails('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
   * for (const field of details.content) {
   *   console.log(`${field.label} (${field.valueType}): ${field.description}`);
   * }
   * ```
   */
  async getProvisioningDetails(productId: string): Promise<ProvisioningDetailsResponse> {
    return getProvisioningDetails(this.client, productId);
  }

  /**
   * Get dependency information for a product.
   *
   * Returns prerequisite products and commitment terms that must be satisfied
   * before this product can be ordered or provisioned.
   *
   * **Note**: Dependency information is dynamic and may change based on vendor policies.
   * Always fetch fresh data before creating orders to ensure compliance with current
   * prerequisite requirements.
   *
   * @param productId - The unique identifier of the product (UUID format)
   * @returns Promise resolving to product dependency information
   *
   * @example
   * ```typescript
   * const deps = await client.products.getDependencies('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
   * if (deps.productDependencies) {
   *   for (const dep of deps.productDependencies) {
   *     console.log(`Requires: ${dep.name}`);
   *   }
   * }
   * ```
   */
  async getDependencies(productId: string): Promise<Dependencies> {
    return getDependencies(this.client, productId);
  }

  /**
   * Get pricing information for a product.
   *
   * Returns pricing rates for different billing terms and quantity ranges.
   * Optionally scope pricing to a specific company for company-specific rates.
   *
   * **Note**: Pricing is dynamic and can change frequently based on vendor updates,
   * promotions, and company-specific agreements. Always fetch fresh pricing data
   * at the time of order creation. Do not cache pricing for extended periods.
   *
   * @param productId - The unique identifier of the product (UUID format)
   * @param options - Optional parameters including companyId for company-specific pricing
   * @returns Promise resolving to pricing information
   *
   * @example
   * ```typescript
   * // Get general pricing
   * const pricing = await client.products.getPricing('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
   *
   * // Get company-specific pricing
   * const companyPricing = await client.products.getPricing(
   *   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   *   { companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210' }
   * );
   * ```
   */
  async getPricing(productId: string, options?: PricingOptions): Promise<PricingResponse> {
    return getPricing(this.client, productId, options);
  }
}



/**
 * List products from the Pax8 catalog with page-based pagination.
 *
 * @param client - API client with request method
 * @param options - Optional filtering, sorting, and pagination parameters
 * @returns Promise resolving to a paginated list of products
 */
export const listProducts = async (
  client: ProductsApiClient,
  options?: ListProductsOptions,
): Promise<ProductListResponse> => {
  // Validate and normalize pagination parameters
  const page = validatePage(options?.page);
  const size = validateSize(options?.size, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE);

  // Validate sort parameter
  if (options?.sort !== undefined) {
    if (!(PRODUCT_SORT_FIELDS as readonly string[]).includes(options.sort)) {
      throw new TypeError(`sort must be one of: ${PRODUCT_SORT_FIELDS.join(', ')}`);
    }
  }

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  if (options?.sort) {
    searchParams.set('sort', options.sort);
  }

  if (options?.vendorName) {
    searchParams.set('vendorName', options.vendorName);
  }

  if (options?.search) {
    searchParams.set('search', options.search);
  }

  const path = `/products?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as ProductListResponse;
};

/**
 * Get detailed information about a specific product by ID.
 *
 * @param client - API client with request method
 * @param productId - The unique identifier of the product
 * @returns Promise resolving to the product details
 */
export const getProduct = async (client: ProductsApiClient, productId: string): Promise<ProductDetail> => {
  validateNonEmptyString(productId, 'productId');

  const path = `/products/${encodeURIComponent(productId)}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as ProductDetail;
};

/**
 * Get provisioning configuration details for a product.
 *
 * @param client - API client with request method
 * @param productId - The unique identifier of the product
 * @returns Promise resolving to provisioning configuration details
 */
export const getProvisioningDetails = async (
  client: ProductsApiClient,
  productId: string,
): Promise<ProvisioningDetailsResponse> => {
  validateNonEmptyString(productId, 'productId');

  const path = `/products/${encodeURIComponent(productId)}/provisioning-details`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as ProvisioningDetailsResponse;
};

/**
 * Get dependency information for a product.
 *
 * @param client - API client with request method
 * @param productId - The unique identifier of the product
 * @returns Promise resolving to product dependency information
 */
export const getDependencies = async (client: ProductsApiClient, productId: string): Promise<Dependencies> => {
  validateNonEmptyString(productId, 'productId');

  const path = `/products/${encodeURIComponent(productId)}/dependencies`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as Dependencies;
};

/**
 * Get pricing information for a product.
 *
 * @param client - API client with request method
 * @param productId - The unique identifier of the product
 * @param options - Optional parameters including companyId for company-specific pricing
 * @returns Promise resolving to pricing information
 */
export const getPricing = async (
  client: ProductsApiClient,
  productId: string,
  options?: PricingOptions,
): Promise<PricingResponse> => {
  validateNonEmptyString(productId, 'productId');

  // Build query parameters
  const searchParams = new URLSearchParams();

  if (options?.companyId) {
    searchParams.set('companyId', options.companyId);
  }

  const queryString = searchParams.toString();
  const path = `/products/${encodeURIComponent(productId)}/pricing${queryString ? `?${queryString}` : ''}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  return data as PricingResponse;
};
