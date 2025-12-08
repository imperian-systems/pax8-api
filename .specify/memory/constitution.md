<!--
  Sync Impact Report
  ===================
  Version change: 1.0.0 → 1.1.0 (MINOR - principle clarification)
  
  Modified principles:
    - II. OpenAPI-Driven Development → II. OpenAPI as Source of Truth
      (Changed from code generation to hand-crafted code based on specs)
  Added sections: None
  Removed sections: None
  
  Templates requiring updates:
    ✅ plan-template.md - Compatible (Constitution Check section aligns with principles)
    ✅ spec-template.md - Compatible (User Stories and Requirements align)
    ✅ tasks-template.md - Compatible (Phase structure supports TDD workflow)
  
  Follow-up TODOs: None
-->

# @imperian-systems/pax8-api Constitution

A TypeScript package for accessing Pax8's Partner, Quoting, Webhooks, and Vendor APIs.

## Core Principles

### I. Type Safety First

All API interactions MUST be fully typed using TypeScript with strict mode enabled. Generated types MUST match the OpenAPI specifications exactly. Runtime type validation MUST occur at API boundaries to ensure data integrity. No `any` types allowed except in explicitly documented escape hatches.

**Rationale**: Type safety prevents runtime errors, improves developer experience with autocomplete, and catches integration issues at compile time rather than in production.

### II. OpenAPI as Source of Truth

All types and API methods MUST be hand-crafted based on Pax8's official OpenAPI specifications:
- Authentication v1 (`https://devx.pax8.com/openapi/661e99f4abd96700535eda89`)
- Partner Endpoints v1 (`https://devx.pax8.com/openapi/6463f53f2c9755000aaf50be`)
- Quoting Endpoints v2 (`https://devx.pax8.com/openapi/6761fd80721228003dd0af1a`)
- Webhooks API v1/v2 (`https://devx.pax8.com/openapi/68485b592a33000024a5cf94`)
- Vendor Provisioning v1 (`https://devx.pax8.com/openapi/6614696de22531001ec2895e`)
- Vendor Usage v1 (`https://devx.pax8.com/openapi/661469e054fdd00030608528`)

Development workflow:
1. Copilot reads the OpenAPI spec for each resource
2. Types are manually written to match the spec exactly
3. API methods are implemented based on spec endpoints
4. Code comments reference the source spec section

Schema updates require manual review and code updates. Each type/method SHOULD include a comment linking to its OpenAPI source.

**Rationale**: Hand-crafted code allows for better ergonomics, documentation, and TypeScript idioms than generated code. OpenAPI specs remain the authoritative reference for correctness.

### III. Test-First Development (NON-NEGOTIABLE)

TDD mandatory for all features: Tests written → Tests fail (red) → Implementation → Tests pass (green) → Refactor.

Testing requirements:
- Unit tests for all utility functions and transformations
- Contract tests validating request/response shapes against OpenAPI specs
- Integration tests for authentication flow and pagination
- Mock server tests for error handling and retry logic

**Rationale**: API clients are critical infrastructure. Untested code in production causes cascading failures for all downstream consumers.

### IV. Resilient by Default

The client MUST handle transient failures gracefully:
- Automatic retries with exponential backoff for status codes: 429, 500, 502, 503, 504
- Maximum 3 retry attempts by default (configurable)
- Respect `Retry-After` headers on 429 responses
- Built-in rate limiting: 1000 requests/minute (Pax8's documented limit)
- Request/response interceptors for logging, metrics, and custom handling

**Rationale**: Network calls fail. API clients that don't handle failures gracefully cause application outages and poor user experiences.

### V. Zero Runtime Dependencies (Where Possible)

Use native `fetch` API (Node.js 22+). Minimize external dependencies to reduce:
- Security vulnerability surface
- Bundle size for consumers
- Dependency version conflicts
- Maintenance burden

Exceptions require documented justification and must be peer dependencies when possible.

**Rationale**: Every dependency is a liability. API clients are widely distributed; their dependency choices affect many downstream projects.

### VI. Developer Experience Excellence

The package MUST provide:
- Comprehensive JSDoc comments on all public APIs
- Intuitive method naming matching Pax8's resource/action patterns
- Pagination helpers that abstract page-based iteration
- Clear error types with actionable messages
- Working code examples in documentation

**Rationale**: Developer experience determines adoption. A well-documented, intuitive API reduces support burden and increases correct usage.

## Technical Standards

### Language & Runtime

- **Language**: TypeScript 5.x with strict mode
- **Target Runtime**: Node.js 22+ (native fetch support required)
- **Module Format**: Dual ESM/CommonJS distribution
- **Build Output**: Declaration files (.d.ts), source maps, minified bundles

### Project Structure

```text
src/
├── client/           # Main Pax8Client class and configuration
├── api/              # Resource-specific API classes (companies, products, etc.)
├── models/           # TypeScript interfaces generated from OpenAPI
├── auth/             # OAuth 2.0 client credentials flow
├── http/             # Fetch wrapper, interceptors, retry logic
├── pagination/       # Page iterator utilities
├── errors/           # Custom error classes
└── index.ts          # Public API exports

tests/
├── unit/             # Pure function tests
├── contract/         # Request/response shape validation
├── integration/      # Auth flow, pagination, real API calls (optional)
└── mocks/            # Mock server responses
```

### Naming Conventions

- **Files**: kebab-case (`company-service.ts`)
- **Classes**: PascalCase (`CompanyService`)
- **Functions/Methods**: camelCase (`listCompanies`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)
- **Types/Interfaces**: PascalCase with descriptive suffixes (`CompanyListResponse`, `CreateOrderRequest`)

### API Method Patterns

Resource methods MUST follow consistent naming:
- `list{Resource}(params?)` - Paginated list
- `get{Resource}(id)` - Single resource by ID
- `create{Resource}(data)` - Create new resource
- `update{Resource}(id, data)` - Update existing resource
- `delete{Resource}(id)` - Delete resource

## API Client Requirements

### Authentication

- Implement OAuth 2.0 client credentials flow
- Token endpoint: `https://token-manager.pax8.com/oauth/token`
- Audience: `https://api.pax8.com`
- Auto-refresh tokens before expiry (tokens expire in 86400 seconds)
- Secure credential storage guidance in documentation

### Pagination

All list endpoints use page-based pagination:
- Page parameter starts at 0
- Default page size: 10, maximum: 200
- Response format: `{ content: T[], page: { size, totalElements, totalPages, number } }`
- Provide async iterator helpers for full collection traversal

### Error Handling

Custom error classes for:
- `Pax8AuthenticationError` - Token/credential issues
- `Pax8RateLimitError` - 429 responses with retry info
- `Pax8NotFoundError` - 404 responses
- `Pax8ValidationError` - 422 responses with field details
- `Pax8ApiError` - Generic API errors with status code

### Dynamic Data Warning

Document that these endpoints return frequently-changing data that SHOULD NOT be cached long-term:
- Product pricing
- Product dependencies
- Provisioning details

## Development Workflow

### Branch Strategy

- `main` - Production-ready releases
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

### Quality Gates

Before merge to `develop`:
1. All tests pass
2. TypeScript compilation succeeds with no errors
3. Linting passes (ESLint + Prettier)
4. Test coverage meets minimum threshold (80%)
5. Documentation updated for public API changes

### Release Process

1. Version bump following semver
2. Changelog updated
3. Types verified against latest OpenAPI specs
4. Full test suite passes
5. npm publish with provenance

## Governance

This constitution supersedes all other development practices for this package. All pull requests MUST verify compliance with these principles.

**Amendments require**:
1. Written proposal with rationale
2. Impact assessment on existing code
3. Migration plan if breaking changes
4. Version bump (MAJOR for principle changes, MINOR for additions, PATCH for clarifications)

**Complexity Justification**: Any deviation from these principles MUST be documented with:
- What principle is being violated
- Why the violation is necessary
- What mitigation is in place
- When it will be resolved (if temporary)

**Version**: 1.1.0 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-08
