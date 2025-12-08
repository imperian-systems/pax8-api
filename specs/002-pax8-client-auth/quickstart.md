# Quickstart: Pax8Client Authentication

**Feature**: 002-pax8-client-auth  
**Date**: 2025-12-08

## Overview

This feature implements the core `Pax8Client` class with OAuth 2.0 authentication. After implementation, developers can create a client, make authenticated API requests, and manage tokens automatically.

## Basic Usage

### 1. Create a Client

```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});
```

### 2. Make API Requests

The client automatically handles token acquisition on the first request:

```typescript
// Token is automatically obtained before this request
const response = await client.request('/companies');
const companies = await response.json();
```

### 3. Custom Configuration

```typescript
const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  
  // Optional settings
  timeout: 60000,        // 60 second timeout
  retryAttempts: 5,      // Retry up to 5 times
  retryDelay: 2000,      // Start with 2 second delay
  autoRefresh: true      // Auto-refresh tokens (default)
});
```

## Token Management

### Automatic Refresh (Default)

With `autoRefresh: true` (default), the client automatically refreshes tokens when they have less than 5 minutes remaining:

```typescript
// Long-running application - tokens refresh automatically
setInterval(async () => {
  const response = await client.request('/subscriptions');
  // Token refreshes automatically if needed
}, 60000);
```

### Manual Refresh

For manual control, disable auto-refresh and call `refreshToken()`:

```typescript
const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  autoRefresh: false
});

// Manually refresh when needed
await client.refreshToken();
```

## Error Handling

### Authentication Errors

```typescript
import { Pax8AuthenticationError } from '@imperian-systems/pax8-api';

try {
  const client = new Pax8Client({
    clientId: 'invalid-id',
    clientSecret: 'invalid-secret'
  });
  await client.request('/companies');
} catch (error) {
  if (error instanceof Pax8AuthenticationError) {
    console.error('Auth failed:', error.message);
    // "Authentication failed: Invalid client credentials..."
  }
}
```

## Configuration Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientId` | string | **required** | OAuth client ID |
| `clientSecret` | string | **required** | OAuth client secret |
| `baseUrl` | string | `https://api.pax8.com/v1` | API base URL |
| `tokenUrl` | string | `https://token-manager.pax8.com/oauth/token` | Token endpoint |
| `audience` | string | `https://api.pax8.com` | OAuth audience |
| `retryAttempts` | number | `3` | Max retry attempts |
| `retryDelay` | number | `1000` | Initial retry delay (ms) |
| `timeout` | number | `30000` | Request timeout (ms) |
| `autoRefresh` | boolean | `true` | Auto-refresh tokens |

## Files Created

This feature adds the following files to the codebase:

```
src/
├── client/
│   ├── pax8-client.ts       # Main Pax8Client class
│   └── config.ts            # Configuration types and defaults
├── auth/
│   ├── token-manager.ts     # Token acquisition and refresh
│   └── types.ts             # Auth-related types
├── errors/
│   ├── pax8-error.ts        # Base error class
│   └── auth-error.ts        # Pax8AuthenticationError
├── http/
│   └── retry.ts             # Retry logic with exponential backoff
└── index.ts                 # Public exports

tests/
├── unit/
│   ├── auth/token-manager.test.ts
│   └── http/retry.test.ts
├── contract/
│   └── auth/token-endpoint.test.ts
└── integration/
    └── auth/auth-flow.test.ts
```

## Dependencies

**Runtime**: None (zero runtime dependencies)  
**Dev**: TypeScript 5.x, Vitest  
**Platform**: Node.js 22+ (native fetch required)
