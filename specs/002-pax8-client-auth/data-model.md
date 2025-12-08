# Data Model: Pax8Client Authentication

**Feature**: 002-pax8-client-auth  
**Date**: 2025-12-08  
**Source**: [research.md](./research.md), Pax8 OpenAPI Auth v1.0.0

## Entities

### ClientConfiguration

The configuration object passed to `Pax8Client` constructor.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| clientId | string | Yes | - | OAuth client ID from Pax8 Integrations Hub |
| clientSecret | string | Yes | - | OAuth client secret from Pax8 Integrations Hub |
| baseUrl | string | No | `https://api.pax8.com/v1` | API base URL for requests |
| tokenUrl | string | No | `https://token-manager.pax8.com/oauth/token` | OAuth token endpoint |
| audience | string | No | `https://api.pax8.com` | OAuth audience for token requests |
| retryAttempts | number | No | 3 | Maximum retry attempts for failed requests |
| retryDelay | number | No | 1000 | Initial retry delay in milliseconds |
| timeout | number | No | 30000 | Request timeout in milliseconds |
| autoRefresh | boolean | No | true | Automatically refresh tokens before expiry |

**Validation Rules**:
- `clientId`: Non-empty string
- `clientSecret`: Non-empty string
- `retryAttempts`: Non-negative integer
- `retryDelay`: Positive integer
- `timeout`: Positive integer

### AccessToken

Internal representation of an OAuth access token with expiration tracking.

| Field | Type | Description |
|-------|------|-------------|
| value | string | The Bearer token string |
| expiresAt | number | Unix timestamp (ms) when token expires |
| tokenType | "Bearer" | Token type (always Bearer for Pax8) |

**Derived Properties**:
- `isExpired`: `Date.now() >= expiresAt`
- `isExpiringSoon`: `Date.now() >= expiresAt - (5 * 60 * 1000)` (within 5 minutes)

**State Transitions**:
```
[No Token] --acquire--> [Valid] --time passes--> [Expiring Soon] --refresh--> [Valid]
                                                       |
                                               --time passes-->
                                                       |
                                                       v
                                                  [Expired] --refresh--> [Valid]
```

### TokenRequest

Request body sent to the token endpoint.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| client_id | string | Yes | OAuth client ID |
| client_secret | string | Yes | OAuth client secret |
| audience | string | Yes | Target API audience |
| grant_type | "client_credentials" | Yes | OAuth grant type |

### TokenResponse

Response from successful token request.

| Field | Type | Description |
|-------|------|-------------|
| access_token | string | The Bearer token |
| expires_in | 86400 | Token lifetime in seconds |
| token_type | "Bearer" | Token type |

### TokenErrorResponse

Response from failed token request (401).

| Field | Type | Description |
|-------|------|-------------|
| error | "access_denied" | Error code |
| error_description | "Unauthorized" | Human-readable error |

### Pax8AuthenticationError

Error class thrown for authentication failures.

| Field | Type | Description |
|-------|------|-------------|
| message | string | Human-readable error message |
| status | number | HTTP status code (401 for auth errors) |
| type | string | Error type identifier |
| instance | string | Request path that failed |
| cause | Error? | Original error if applicable |

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        Pax8Client                               │
│  - config: ClientConfiguration                                  │
│  - tokenManager: TokenManager                                   │
├─────────────────────────────────────────────────────────────────┤
│  + constructor(config: ClientConfiguration)                     │
│  + refreshToken(): Promise<void>                                │
│  # request(path, options): Promise<Response>                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       TokenManager                              │
│  - token: AccessToken | null                                    │
│  - config: TokenManagerConfig                                   │
│  - refreshPromise: Promise<AccessToken> | null                  │
├─────────────────────────────────────────────────────────────────┤
│  + ensureValidToken(): Promise<AccessToken>                     │
│  + refresh(): Promise<AccessToken>                              │
│  + isTokenValid(): boolean                                      │
│  + getTokenExpiresAt(): number | null                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ throws
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Pax8AuthenticationError                       │
│  extends Pax8Error                                              │
├─────────────────────────────────────────────────────────────────┤
│  + status: 401                                                  │
│  + type: "authentication_error"                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Type Definitions Summary

```typescript
// Configuration
interface Pax8ClientConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  tokenUrl?: string;
  audience?: string;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  autoRefresh?: boolean;
}

// Internal token representation
interface AccessToken {
  value: string;
  expiresAt: number;
  tokenType: 'Bearer';
}

// API request/response types
interface TokenRequest {
  client_id: string;
  client_secret: string;
  audience: string;
  grant_type: 'client_credentials';
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

// Error types
interface TokenErrorResponse {
  error: string;
  error_description: string;
}
```
