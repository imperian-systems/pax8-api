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
 * Integration tests for Products API flows.
 * These tests verify complete user journeys with realistic data flows.
 */

describe('Products API Integration Tests', () => {
  let mockClient: ProductsApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('User Story 1: List Products from Catalog', () => {
    it('should retrieve first page with default pagination', async () => {
      const mockResponse: ProductListResponse = {
        content: Array.from({ length: 10 }, (_, i) => ({
          id: `product-${i + 1}`,
          name: `Product ${i + 1}`,
          vendorName: 'Microsoft',
          shortDescription: `Description for product ${i + 1}`,
        })),
        page: {
          size: 10,
          totalElements: 50,
          totalPages: 5,
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

      expect(result.content).toHaveLength(10);
      expect(result.page.size).toBe(10);
      expect(result.page.totalElements).toBe(50);
      expect(result.page.totalPages).toBe(5);
      expect(result.page.number).toBe(0);
    });

    it('should filter products by vendor name', async () => {
      const mockResponse: ProductListResponse = {
        content: [
          {
            id: 'ms-product-1',
            name: 'Microsoft 365 Business Basic',
            vendorName: 'Microsoft',
            shortDescription: 'Cloud productivity suite',
          },
          {
            id: 'ms-product-2',
            name: 'Microsoft 365 Business Standard',
            vendorName: 'Microsoft',
            shortDescription: 'Advanced productivity suite',
          },
        ],
        page: {
          size: 10,
          totalElements: 2,
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

      const result = await listProducts(mockClient, { vendorName: 'Microsoft' });

      expect(result.content).toHaveLength(2);
      expect(result.content.every((p) => p.vendorName === 'Microsoft')).toBe(true);
    });

    it('should search products by keyword', async () => {
      const mockResponse: ProductListResponse = {
        content: [
          {
            id: 'office-product-1',
            name: 'Office 365 E3',
            vendorName: 'Microsoft',
            shortDescription: 'Enterprise productivity suite',
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

      const result = await listProducts(mockClient, { search: 'Office 365' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].name).toContain('Office');
    });

    it('should sort products by name', async () => {
      const mockResponse: ProductListResponse = {
        content: [
          {
            id: 'prod-1',
            name: 'Azure Active Directory',
            vendorName: 'Microsoft',
          },
          {
            id: 'prod-2',
            name: 'Backup Solution',
            vendorName: 'Acronis',
          },
          {
            id: 'prod-3',
            name: 'Cloud Storage',
            vendorName: 'Dropbox',
          },
        ],
        page: {
          size: 10,
          totalElements: 3,
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

      const result = await listProducts(mockClient, { sort: 'name' });

      expect(result.content).toHaveLength(3);
      // Names should be in alphabetical order
      expect(result.content[0].name).toBe('Azure Active Directory');
      expect(result.content[1].name).toBe('Backup Solution');
      expect(result.content[2].name).toBe('Cloud Storage');
    });

    it('should handle empty results', async () => {
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

      const result = await listProducts(mockClient, { vendorName: 'NonExistentVendor' });

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });

    it('should paginate through multiple pages', async () => {
      const firstPage: ProductListResponse = {
        content: Array.from({ length: 20 }, (_, i) => ({
          id: `product-page1-${i + 1}`,
          name: `Product ${i + 1}`,
          vendorName: 'Microsoft',
        })),
        page: {
          size: 20,
          totalElements: 50,
          totalPages: 3,
          number: 0,
        },
      };

      const secondPage: ProductListResponse = {
        content: Array.from({ length: 20 }, (_, i) => ({
          id: `product-page2-${i + 1}`,
          name: `Product ${i + 21}`,
          vendorName: 'Microsoft',
        })),
        page: {
          size: 20,
          totalElements: 50,
          totalPages: 3,
          number: 1,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(firstPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(secondPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const page1 = await listProducts(mockClient, { page: 0, size: 20 });
      const page2 = await listProducts(mockClient, { page: 1, size: 20 });

      expect(page1.content).toHaveLength(20);
      expect(page2.content).toHaveLength(20);
      expect(page1.page.number).toBe(0);
      expect(page2.page.number).toBe(1);
    });
  });

  describe('User Story 2: View Product Details', () => {
    it('should retrieve full product details by ID', async () => {
      const mockResponse: ProductDetail = {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Microsoft 365 Business Basic',
        vendorName: 'Microsoft',
        shortDescription: 'Cloud-based productivity suite',
        description: 'Microsoft 365 Business Basic includes web and mobile versions of Office apps like Word, Excel, PowerPoint, and more. Perfect for small businesses.',
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

      expect(result.id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(result.name).toBe('Microsoft 365 Business Basic');
      expect(result.description).toBeDefined();
      expect(result.description).toContain('Microsoft 365 Business Basic');
    });

    it('should handle 404 for non-existent product', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getProduct(mockClient, 'non-existent-id')).rejects.toThrow('Product not found');
    });
  });

  describe('User Story 3: Get Product Provisioning Details', () => {
    it('should retrieve provisioning configuration fields', async () => {
      const mockResponse: ProvisioningDetailsResponse = {
        content: [
          {
            label: 'Domain Name',
            key: 'domainName',
            description: 'The primary domain for this Microsoft 365 tenant',
            valueType: 'Input',
          },
          {
            label: 'Admin Email',
            key: 'adminEmail',
            description: 'Email address for the tenant administrator',
            valueType: 'Input',
          },
          {
            label: 'Commitment Term',
            key: 'commitmentTerm',
            description: 'Select the billing commitment period',
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

      expect(result.content).toHaveLength(3);
      expect(result.content[0].label).toBe('Domain Name');
      expect(result.content[0].valueType).toBe('Input');
      expect(result.content[2].possibleValues).toEqual(['Monthly', 'Annual', '3-Year']);
    });

    it('should handle product with no provisioning requirements', async () => {
      const mockResponse: ProvisioningDetailsResponse = {
        content: [],
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getProvisioningDetails(mockClient, 'simple-product-id');

      expect(result.content).toHaveLength(0);
    });

    it('should handle 404 for non-existent product', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getProvisioningDetails(mockClient, 'non-existent-id')).rejects.toThrow('Product not found');
    });
  });

  describe('User Story 4: Get Product Dependencies', () => {
    it('should retrieve prerequisite products and commitments', async () => {
      const mockResponse: Dependencies = {
        commitmentDependencies: [
          {
            id: 'commit-123',
            term: '3-Year',
            autoRenew: true,
            allowForQuantityIncrease: true,
            allowForQuantityDecrease: false,
            allowForEarlyCancellation: false,
            cancellationFeeApplied: true,
          },
        ],
        productDependencies: [
          {
            name: 'Requires',
            products: [
              {
                id: 'dep-product-1',
                name: 'Azure Active Directory Premium',
                vendorName: 'Microsoft',
                shortDescription: 'Identity and access management service',
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

      expect(result.commitmentDependencies).toHaveLength(1);
      expect(result.commitmentDependencies![0].term).toBe('3-Year');
      expect(result.productDependencies).toHaveLength(1);
      expect(result.productDependencies![0].products).toHaveLength(1);
      expect(result.productDependencies![0].products[0].name).toBe('Azure Active Directory Premium');
    });

    it('should handle product with no dependencies', async () => {
      const mockResponse: Dependencies = {};

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await getDependencies(mockClient, 'standalone-product-id');

      expect(result.commitmentDependencies).toBeUndefined();
      expect(result.productDependencies).toBeUndefined();
    });

    it('should handle 404 for non-existent product', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getDependencies(mockClient, 'non-existent-id')).rejects.toThrow('Product not found');
    });
  });

  describe('User Story 5: Get Product Pricing', () => {
    it('should retrieve general pricing for a product', async () => {
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

      expect(result.content).toHaveLength(2);
      expect(result.content[0].billingTerm).toBe('Monthly');
      expect(result.content[0].rates[0].partnerBuyRate).toBe(6.0);
      expect(result.content[1].billingTerm).toBe('Annual');
      expect(result.content[1].rates[0].partnerBuyRate).toBe(5.0);
    });

    it('should retrieve company-specific pricing', async () => {
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

      const result = await getPricing(mockClient, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
        companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].rates[0].partnerBuyRate).toBe(5.5);
    });

    it('should handle tiered pricing with quantity ranges', async () => {
      const mockResponse: PricingResponse = {
        content: [
          {
            productId: 'tiered-product-id',
            productName: 'Enterprise Cloud Storage',
            billingTerm: 'Monthly',
            type: 'Tiered',
            unitOfMeasurement: 'GB',
            rates: [
              {
                partnerBuyRate: 0.1,
                suggestedRetailPrice: 0.15,
                startQuantityRange: 0,
                endQuantityRange: 1000,
                chargeType: 'Per Unit',
              },
              {
                partnerBuyRate: 0.08,
                suggestedRetailPrice: 0.12,
                startQuantityRange: 1001,
                endQuantityRange: 5000,
                chargeType: 'Per Unit',
              },
              {
                partnerBuyRate: 0.05,
                suggestedRetailPrice: 0.1,
                startQuantityRange: 5001,
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

      const result = await getPricing(mockClient, 'tiered-product-id');

      expect(result.content[0].type).toBe('Tiered');
      expect(result.content[0].rates).toHaveLength(3);
      expect(result.content[0].rates[0].partnerBuyRate).toBe(0.1);
      expect(result.content[0].rates[1].partnerBuyRate).toBe(0.08);
      expect(result.content[0].rates[2].partnerBuyRate).toBe(0.05);
    });

    it('should handle 404 for non-existent product', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(getPricing(mockClient, 'non-existent-id')).rejects.toThrow('Product not found');
    });
  });
});
