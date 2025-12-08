# Research: Pax8Client Authentication

**Feature**: 002-pax8-client-auth  
**Date**: 2025-12-08  
**Source**: Pax8 Authentication OpenAPI v1.0.0

## OAuth 2.0 Client Credentials Flow

### Decision: Standard OAuth 2.0 Client Credentials Grant

**Rationale**: Pax8 uses standard OAuth 2.0 client credentials flow with no custom extensions. This simplifies implementation and ensures compatibility.

**Alternatives Considered**:
- Authorization Code flow: Not applicable (server-to-server, no user context)
- API Key authentication: Not offered by Pax8

### Token Endpoint Details

**Source**: [Pax8 Authentication OpenAPI](https://devx.pax8.com/openapi/661e99f4abd96700535eda89)

| Field | Value |
|-------|-------|
| Token URL | `https://token-manager.pax8.com/oauth/token` |
| Grant Type | `client_credentials` |
| Content-Type | `application/json` |
| Token Lifetime | 86400 seconds (24 hours) |
| Token Type | `Bearer` |

### Request Schema (TokenRequest)

```typescript
interface TokenRequest {
  client_id: string;      // Required - OAuth client ID
  client_secret: string;  // Required - OAuth client secret
  audience: string;       // Required - One of: "https://api.pax8.com", "api://p8p.client", "api://provisioning", "api://usage"
  grant_type: "client_credentials"; // Required - Must be "client_credentials"
}
```

**Note**: Different audiences for different API endpoints:
- `https://api.pax8.com` - Partner endpoints (companies, products, subscriptions, etc.)
- `api://p8p.client` - Alternative partner endpoint audience
- `api://provisioning` - Vendor provisioning endpoints
- `api://usage` - Vendor usage endpoints

### Response Schema (TokenResponse)

```typescript
interface TokenResponse {
  access_token: string;  // The Bearer token to use in Authorization header
  expires_in: 86400;     // Fixed at 86400 seconds (24 hours)
  token_type: "Bearer";  // Always "Bearer"
}
```

### Error Response

```typescript
interface TokenErrorResponse {
  error: "access_denied";
  error_description: "Unauthorized";
}
```

HTTP Status: `401 Unauthorized`

## Token Refresh Strategy

### Decision: On-demand refresh with 5-minute buffer

**Rationale**: As clarified in spec (Session 2025-12-08), use on-demand refresh: check token validity before each request, refresh if less than 5 minutes remaining. This avoids background timers and unnecessary token refreshes.

**Alternatives Considered**:
- Background timer: Adds complexity, may refresh tokens unnecessarily
- Lazy refresh on 401: Causes request failures before retry, poor UX

### Implementation Approach

1. Store token with calculated expiry timestamp (`Date.now() + expires_in * 1000`)
2. Before each request, check if `expiresAt - Date.now() < 5 * 60 * 1000`
3. If within buffer, refresh token before proceeding
4. Use mutex/lock pattern to prevent duplicate refresh during concurrent requests

## Retry Logic Best Practices

### Decision: Exponential backoff with jitter

**Rationale**: Industry standard for retry logic. Prevents thundering herd on transient failures.

**Implementation**:
```typescript
// Delay calculation: min(baseDelay * 2^attempt + jitter, maxDelay)
const calculateDelay = (attempt: number, baseDelay: number): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // 0-1000ms jitter
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};
```

### Retryable Conditions for Token Requests

- Network errors (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
- HTTP 500, 502, 503, 504 (server errors)
- HTTP 429 (rate limit) - respect Retry-After header

### Non-Retryable Conditions

- HTTP 401 (invalid credentials) - fail immediately with clear error
- HTTP 400 (bad request) - fail immediately with validation error

## Concurrent Request Handling

### Decision: Promise-based mutex pattern

**Rationale**: Ensures only one token refresh occurs at a time. Other requests wait for the same promise rather than triggering duplicate refreshes.

**Implementation Pattern**:
```typescript
class TokenManager {
  private refreshPromise: Promise<AccessToken> | null = null;
  
  async ensureValidToken(): Promise<AccessToken> {
    if (this.refreshPromise) {
      return this.refreshPromise; // Wait for in-flight refresh
    }
    
    if (this.isTokenExpiringSoon()) {
      this.refreshPromise = this.doRefresh()
        .finally(() => { this.refreshPromise = null; });
      return this.refreshPromise;
    }
    
    return this.currentToken!;
  }
}
```

## Configuration Defaults

Based on spec requirements and constitution:

| Option | Default | Rationale |
|--------|---------|-----------|
| baseUrl | `https://api.pax8.com/v1` | Documented API base |
| tokenUrl | `https://token-manager.pax8.com/oauth/token` | From OpenAPI spec |
| audience | `https://api.pax8.com` | Partner endpoints (most common) |
| retryAttempts | 3 | Constitution default |
| retryDelay | 1000ms | Standard initial backoff |
| timeout | 30000ms | Reasonable for network calls |
| autoRefresh | true | Best UX for long-running apps |

## Error Handling Design

### Decision: Typed error hierarchy

**Rationale**: Enables precise error handling with `instanceof` checks. Follows constitution requirement for clear error types.

**Error Classes**:
1. `Pax8Error` (base) - All Pax8-related errors extend this
2. `Pax8AuthenticationError` - Token/credential failures (FR-009)
   - Include original error details from API
   - Include helpful message for common issues

**Error Message Examples**:
- Invalid credentials: "Authentication failed: Invalid client credentials. Verify your clientId and clientSecret are correct."
- Token expired: "Authentication failed: Token has expired. Auto-refresh may be disabled or credentials may have changed."
- Network error: "Authentication failed: Unable to reach token endpoint. Check network connectivity."

## Testing Strategy

### Unit Tests (token-manager)
- Token storage and retrieval
- Expiry calculation and buffer check
- Retry delay calculation

### Contract Tests (auth endpoints)
- Request body matches TokenRequest schema
- Response parsing handles TokenResponse schema
- Error response handling for 401

### Integration Tests
- Full token acquisition flow (with mock server)
- Token refresh trigger when near expiry
- Concurrent request handling

## Security Considerations

1. **Credentials in memory only**: Never persist clientSecret to disk
2. **Token in memory only**: Tokens stored only in TokenManager instance
3. **No logging of secrets**: Ensure clientSecret and tokens are never logged
4. **HTTPS only**: All token requests must use HTTPS (enforced by token URL)
