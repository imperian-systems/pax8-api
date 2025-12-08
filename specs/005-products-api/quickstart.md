# Quickstart: Products API

**Feature**: 005-products-api  
**Date**: 2025-01-XX

## Overview

Adds Products API methods to the Pax8 client for browsing and querying the product catalog. Includes list, get, provisioning details, dependencies, and pricing endpoints with page-based pagination (default 10, max 200).

## Basic Usage

### 1) List products (page-based)

```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// List products with default pagination
const { content, page } = await client.products.list();

console.log(`Found ${page.totalElements} products across ${page.totalPages} pages`);

// Filter by vendor
const msProducts = await client.products.list({
  vendorName: 'Microsoft',
  size: 25,
  sort: 'name,asc'
});

// Search by product name
const searchResults = await client.products.list({
  search: 'Office 365',
  size: 10
});
```

### 2) Paginate through all products

```typescript
// Manual page-based pagination
let currentPage = 0;
const allProducts: Product[] = [];

do {
  const result = await client.products.list({ 
    page: currentPage,
    size: 50 
  });
  
  allProducts.push(...result.content);
  currentPage++;
} while (currentPage < result.page.totalPages);

console.log(`Retrieved ${allProducts.length} total products`);
```

### 3) Get a product by ID

```typescript
const product = await client.products.get('a1b2c3d4-e5f6-7890-abcd-ef1234567890');

console.log(product.name, product.vendorName);
console.log(product.shortDescription);
console.log(product.longDescription);
```

### 4) Get provisioning details

```typescript
// Get requirements for provisioning a product
const provisioning = await client.products.getProvisioningDetails(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);

console.log('Required fields:');
for (const field of provisioning.provisioningFields) {
  if (field.required) {
    console.log(`  - ${field.label} (${field.type}): ${field.description}`);
  }
}

if (provisioning.commitmentTermRequired) {
  console.log(`Default term: ${provisioning.defaultCommitmentTerm}`);
}
```

### 5) Get product dependencies

```typescript
// Check what products must be provisioned first
const deps = await client.products.getDependencies(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);

if (deps.hasDependencies) {
  console.log('Prerequisites:');
  for (const dep of deps.dependencies) {
    console.log(`  - ${dep.name} (${dep.dependencyType})`);
    console.log(`    ${dep.description}`);
  }
}
```

### 6) Get product pricing

```typescript
// Get general pricing
const pricing = await client.products.getPricing(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);

console.log(`Currency: ${pricing.currencyCode}`);
for (const rate of pricing.rates) {
  console.log(`  ${rate.billingTerm}: $${rate.partnerBuyPrice}`);
}

// Get company-specific pricing
const companyPricing = await client.products.getPricing(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  { companyId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210' }
);
```

## Error Handling

```typescript
import { Pax8Error } from '@imperian-systems/pax8-api';

try {
  await client.products.get('invalid-product-id');
} catch (error) {
  if (error instanceof Pax8Error) {
    switch (error.status) {
      case 404:
        console.error('Product not found');
        break;
      case 422:
        console.error('Invalid parameters:', error.message);
        break;
      case 429:
        console.error('Rate limited, retry after:', error.retryAfter);
        break;
      default:
        console.error(error.code, error.message);
    }
  }
}
```

## Validation Rules

The client enforces these constraints:

| Parameter | Constraint | Error |
|-----------|------------|-------|
| `size` | 1-200 | 422 Validation Error |
| `page` | ≥ 0 | 422 Validation Error |
| `sort` | `name` or `vendor` only | 422 Validation Error |
| `productId` | UUID format | 422 Validation Error |

```typescript
// Invalid page size returns 422 error
try {
  await client.products.list({ size: 500 }); // Error: size must be ≤ 200
} catch (error) {
  if (error instanceof Pax8Error && error.status === 422) {
    console.error('Validation error:', error.details);
  }
}
```

## Type Exports

```typescript
import type {
  Product,
  ProductDetail,
  ProvisioningDetail,
  ProvisioningField,
  ProductDependency,
  Dependencies,
  Pricing,
  Rate,
  Commitment,
  ListProductsParams,
  PricingParams,
  ProductListResponse
} from '@imperian-systems/pax8-api';
```

## Complete Example: Product Catalog Browser

```typescript
import { Pax8Client, Pax8Error } from '@imperian-systems/pax8-api';
import type { Product, ProductDetail, Pricing } from '@imperian-systems/pax8-api';

async function browseProducts() {
  const client = new Pax8Client({
    clientId: process.env.PAX8_CLIENT_ID!,
    clientSecret: process.env.PAX8_CLIENT_SECRET!
  });

  // 1. List Microsoft products
  const { content: products } = await client.products.list({
    vendorName: 'Microsoft',
    size: 20,
    sort: 'name,asc'
  });

  console.log(`Found ${products.length} Microsoft products:\n`);

  // 2. Get details for each product
  for (const product of products.slice(0, 3)) {
    console.log(`\n=== ${product.name} ===`);
    
    // Get full details
    const details = await client.products.get(product.id);
    console.log(details.shortDescription);
    
    // Get pricing
    const pricing = await client.products.getPricing(product.id);
    for (const rate of pricing.rates) {
      console.log(`  ${rate.billingTerm}: $${rate.partnerBuyPrice}/${rate.billingTerm.toLowerCase()}`);
    }
    
    // Check dependencies
    const deps = await client.products.getDependencies(product.id);
    if (deps.hasDependencies) {
      console.log('  Requires:', deps.dependencies.map(d => d.name).join(', '));
    }
  }
}

browseProducts().catch(console.error);
```

## API Reference

| Method | Description |
|--------|-------------|
| `products.list(params?)` | List products with filtering and pagination |
| `products.get(id)` | Get product details by ID |
| `products.getProvisioningDetails(id)` | Get provisioning requirements |
| `products.getDependencies(id)` | Get prerequisite products |
| `products.getPricing(id, params?)` | Get pricing information |
