import { describe, it, expect, beforeEach, vi } from 'vitest';

import { listProducts, getProduct, getProvisioningDetails, getDependencies, getPricing } from '../../../src/api/products';
import type { ProductsApiClient } from '../../../src/api/products';
import type {
  ProductListResponse,
  ProductDetail,
  ProvisioningDetailsResponse,
  Dependencies,
  PricingResponse,
} from '../../../src/models/products';

/**
 * Contract tests for Products API endpoints.
 * These tests verify request/response structures match the OpenAPI specification.
 */

describe('Products API Contract Tests', () => {
  let mockClient: ProductsApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('GET /products - listProducts', () => {
    it('should return 200 with valid product list response structure', async () => {
      const mockResponse: ProductListResponse = {
        content: [
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'Microsoft 365 Business Basic',
            vendorName: 'Microsoft',
            shortDescription: 'Cloud-based productivity suite',
            sku: 'MS365BB',
            vendorSku: 'CFQ7TTC0LH18',
            requiresCommitment: false,
          },
        ],
        page: {
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await listProducts(mockClient);

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('id');
      expect(result.content[0]).toHaveProperty('name');
      expect(result.content[0]).toHaveProperty('vendorName');
      expect(result.page).toHaveProperty('size');
      expect(result.page).toHaveProperty('totalElements');
      expect(result.page).toHaveProperty('totalPages');
      expect(result.page).toHaveProperty('number');
    });

    it('should handle custom pagination parameters', async () => {
      const mockResponse: ProductListResponse = {
        content: [],
        page: {
          size: 50,
          totalElements: 0,
          totalPages: 0,
          number: 2,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await listProducts(mockClient, { page: 2, size: 50 });

      expect(mockClient.request).toHaveBeenCalledWith('/products?page=2&size=50', { method: 'GET' });
    });

    it('should handle vendorName filter parameter', async () => {
      const mockResponse: ProductListResponse = {
        content: [],
        page: {
          size: 10,
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await listProducts(mockClient, { vendorName: 'Microsoft' });

      expect(mockClient.request).toHaveBeenCalledWith('/products?page=0&size=10&vendorName=Microsoft', { method: 'GET' });
    });

    it('should handle search parameter', async () => {
      const mockResponse: ProductListResponse = {
        content: [],
        page: {
          size: 10,
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await listProducts(mockClient, { search: 'Office 365' });

      expect(mockClient.request).toHaveBeenCalledWith('/products?page=0&size=10&search=Office+365', { method: 'GET' });
    });

    it('should handle sort parameter', async () => {
      const mockResponse: ProductListResponse = {
        content: [],
        page: {
          size: 10,
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await listProducts(mockClient, { sort: 'name' });

      expect(mockClient.request).toHaveBeenCalledWith('/products?page=0&size=10&sort=name', { method: 'GET' });
    });

    it('should validate size parameter and throw 422-style error for size > 200', async () => {
      await expect(listProducts(mockClient, { size: 201 })).rejects.toThrow('size must be between 1 and 200');
    });

    it('should validate page parameter', async () => {
      await expect(listProducts(mockClient, { page: -1 })).rejects.toThrow('page must be a non-negative integer');
    });

    it('should validate sort parameter', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(listProducts(mockClient, { sort: 'invalid' as any })).rejects.toThrow('sort must be one of: name, vendor');
    });
  });

  describe('GET /products/{productId} - getProduct', () => {
    it('should return 200 with valid product detail response structure', async () => {
      const mockResponse: ProductDetail = {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Microsoft 365 Business Basic',
        vendorName: 'Microsoft',
        shortDescription: 'Cloud-based productivity suite',
        description: 'Microsoft 365 Business Basic includes web and mobile versions of Office apps...',
        sku: 'MS365BB',
        vendorSku: 'CFQ7TTC0LH18',
        requiresCommitment: false,
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getProduct(mockClient, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('vendorName');
      expect(result).toHaveProperty('description');
    });

    it('should handle 404 for unknown product ID', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getProduct(mockClient, 'unknown-id')).rejects.toThrow('Product not found');
    });

    it('should validate productId parameter', async () => {
      await expect(getProduct(mockClient, '')).rejects.toThrow('productId is required and must be a non-empty string');
    });
  });

  describe('GET /products/{productId}/provisioning-details - getProvisioningDetails', () => {
    it('should return 200 with valid provisioning details response structure', async () => {
      const mockResponse: ProvisioningDetailsResponse = {
        content: [
          {
            label: 'Domain Name',
            key: 'domainName',
            description: 'The primary domain for this Microsoft 365 tenant',
            valueType: 'Input',
          },
          {
            label: 'Commitment Term',
            key: 'commitmentTerm',
            description: 'Select commitment period',
            valueType: 'Single-Value',
            possibleValues: ['Monthly', 'Annual', '3-Year'],
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getProvisioningDetails(mockClient, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toHaveProperty('label');
      expect(result.content[0]).toHaveProperty('key');
      expect(result.content[0]).toHaveProperty('valueType');
    });

    it('should handle 404 for unknown product ID', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getProvisioningDetails(mockClient, 'unknown-id')).rejects.toThrow('Product not found');
    });

    it('should validate productId parameter', async () => {
      await expect(getProvisioningDetails(mockClient, '')).rejects.toThrow(
        'productId is required and must be a non-empty string',
      );
    });
  });

  describe('GET /products/{productId}/dependencies - getDependencies', () => {
    it('should return 200 with valid dependencies response structure', async () => {
      const mockResponse: Dependencies = {
        commitmentDependencies: [
          {
            id: 'commit-123',
            term: '3-Year',
            autoRenew: true,
            allowForQuantityIncrease: true,
            allowForQuantityDecrease: false,
          },
        ],
        productDependencies: [
          {
            name: 'Requires',
            products: [
              {
                id: 'dep-product-123',
                name: 'Azure Active Directory',
                vendorName: 'Microsoft',
              },
            ],
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getDependencies(mockClient, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('commitmentDependencies');
      expect(result).toHaveProperty('productDependencies');
      expect(result.commitmentDependencies).toHaveLength(1);
      expect(result.productDependencies).toHaveLength(1);
    });

    it('should handle product with no dependencies', async () => {
      const mockResponse: Dependencies = {};

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getDependencies(mockClient, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 for unknown product ID', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getDependencies(mockClient, 'unknown-id')).rejects.toThrow('Product not found');
    });

    it('should validate productId parameter', async () => {
      await expect(getDependencies(mockClient, '')).rejects.toThrow('productId is required and must be a non-empty string');
    });
  });

  describe('GET /products/{productId}/pricing - getPricing', () => {
    it('should return 200 with valid pricing response structure', async () => {
      const mockResponse: PricingResponse = {
        content: [
          {
            productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            productName: 'Microsoft 365 Business Basic',
            billingTerm: 'Monthly',
            type: 'Flat',
            unitOfMeasurement: 'User',
            rates: [
              {
                partnerBuyRate: 6.0,
                suggestedRetailPrice: 6.0,
                chargeType: 'Per Unit',
              },
            ],
          },
          {
            productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            productName: 'Microsoft 365 Business Basic',
            billingTerm: 'Annual',
            commitmentTerm: '1-Year',
            commitmentTermInMonths: 12,
            type: 'Flat',
            unitOfMeasurement: 'User',
            rates: [
              {
                partnerBuyRate: 5.0,
                suggestedRetailPrice: 5.0,
                chargeType: 'Per Unit',
              },
            ],
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getPricing(mockClient, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toHaveProperty('productId');
      expect(result.content[0]).toHaveProperty('productName');
      expect(result.content[0]).toHaveProperty('billingTerm');
      expect(result.content[0]).toHaveProperty('rates');
      expect(result.content[0].rates).toHaveLength(1);
    });

    it('should handle companyId query parameter for company-specific pricing', async () => {
      const mockResponse: PricingResponse = {
        content: [
          {
            productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            productName: 'Microsoft 365 Business Basic',
            billingTerm: 'Monthly',
            type: 'Flat',
            rates: [
              {
                partnerBuyRate: 5.5,
                suggestedRetailPrice: 5.5,
                chargeType: 'Per Unit',
              },
            ],
          },
        ],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await getPricing(mockClient, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        '/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890/pricing?companyId=f9e8d7c6-b5a4-3210-fedc-ba9876543210',
        { method: 'GET' },
      );
    });

    it('should handle 404 for unknown product ID', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getPricing(mockClient, 'unknown-id')).rejects.toThrow('Product not found');
    });

    it('should validate productId parameter', async () => {
      await expect(getPricing(mockClient, '')).rejects.toThrow('productId is required and must be a non-empty string');
    });
  });
});
