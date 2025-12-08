export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export const PRODUCT_SORT_FIELDS = ['name', 'vendor'] as const;
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

export const BILLING_TERMS = ['Monthly', 'Annual', '2-Year', '3-Year', 'One-Time', 'Trial', 'Activation'] as const;
export type BillingTerm = (typeof BILLING_TERMS)[number];

export const PRICING_TYPES = ['Flat', 'Volume', 'Tiered', 'Mark-Up'] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const CHARGE_TYPES = ['Per Unit', 'Flat Rate'] as const;
export type ChargeType = (typeof CHARGE_TYPES)[number];

export const PROVISIONING_VALUE_TYPES = ['Input', 'Single-Value', 'Multi-Value'] as const;
export type ProvisioningValueType = (typeof PROVISIONING_VALUE_TYPES)[number];

// Base Product interface (list response)
export interface Product {
  id: string;
  name: string;
  vendorName: string;
  shortDescription?: string;
  sku?: string;
  vendorSku?: string;
  altVendorSku?: string;
  requiresCommitment?: boolean;
}

// ProductDetail interface (get response) - extends Product with description
export interface ProductDetail extends Product {
  description?: string;
}

// List products request parameters
export interface ListProductsOptions {
  page?: number;
  size?: number;
  sort?: ProductSortField;
  vendorName?: string;
  search?: string;
}

// Page metadata for pagination
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

// Product list response
export interface ProductListResponse {
  content: Product[];
  page: PageMetadata;
}

// Provisioning details interfaces
export interface ProvisioningDetail {
  label: string;
  key: string;
  description?: string;
  valueType: ProvisioningValueType;
  possibleValues?: string[];
}

export interface ProvisioningDetailsResponse {
  content: ProvisioningDetail[];
}

// Dependencies interfaces
export interface Commitment {
  id: string;
  term: string;
  autoRenew?: boolean;
  renewalWindowDaysBeforeTermEnd?: number;
  renewalWindowDaysAfterTermEnd?: number;
  allowForQuantityIncrease?: boolean;
  allowForQuantityDecrease?: boolean;
  allowForEarlyCancellation?: boolean;
  cancellationFeeApplied?: boolean;
  isTransferable?: boolean;
}

export interface ProductDependency {
  name: string;
  products: Product[];
}

export interface Dependencies {
  commitmentDependencies?: Commitment[];
  productDependencies?: ProductDependency[];
}

// Pricing interfaces
export interface Rate {
  partnerBuyRate: number;
  suggestedRetailPrice: number;
  startQuantityRange?: number;
  endQuantityRange?: number;
  chargeType: ChargeType;
}

export interface Pricing {
  productId: string;
  productName: string;
  billingTerm: BillingTerm;
  commitmentTerm?: string;
  commitmentTermInMonths?: number;
  type: PricingType;
  unitOfMeasurement?: string;
  rates: Rate[];
}

export interface PricingOptions {
  companyId?: string;
}

export interface PricingResponse {
  content: Pricing[];
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
