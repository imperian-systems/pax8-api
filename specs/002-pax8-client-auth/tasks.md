# Tasks: Pax8Client Class with Authentication

**Input**: Design documents from `/specs/002-pax8-client-auth/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and TypeScript configuration

 - [X] T001 Initialize npm package with package.json at repository root
 - [X] T002 [P] Configure TypeScript with tsconfig.json (strict mode, ESM/CJS dual output)
 - [X] T003 [P] Configure Vitest for testing in vitest.config.ts
 - [X] T004 [P] Configure ESLint and Prettier for code quality
 - [X] T005 Create directory structure: src/client/, src/auth/, src/errors/, src/http/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base error classes and HTTP utilities required by ALL user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement base Pax8Error class in src/errors/pax8-error.ts
- [X] T007 [P] Implement Pax8AuthenticationError extending Pax8Error in src/errors/auth-error.ts
- [X] T008 [P] Implement exponential backoff retry logic with jitter in src/http/retry.ts
- [X] T009 [P] Create auth types (TokenRequest, TokenResponse, TokenErrorResponse, AccessToken) in src/auth/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Initialize Client with Credentials (Priority: P1) 🎯 MVP

**Goal**: Developers can create a Pax8Client instance with credentials and optional configuration

**Independent Test**: Create a client instance, verify it initializes without errors and stores configuration correctly

### Implementation for User Story 1

 - [X] T010 [P] [US1] Create Pax8ClientConfig interface and defaults in src/client/config.ts
 - [X] T011 [P] [US1] Create configuration validation utility in src/client/config.ts
 - [X] T012 [US1] Implement Pax8Client constructor with config validation in src/client/pax8-client.ts
 - [X] T013 [US1] Add JSDoc comments to Pax8Client class and config types

**Checkpoint**: Client can be instantiated with credentials and optional config. No network calls yet.

---

## Phase 4: User Story 2 - Automatic Token Acquisition (Priority: P1)

**Goal**: Client automatically obtains token on first API request using OAuth 2.0 Client Credentials flow

**Independent Test**: Make an API request, verify client obtains token automatically before request executes

### Implementation for User Story 2

- [X] T014 [US2] Implement TokenManager class skeleton in src/auth/token-manager.ts
- [X] T015 [US2] Implement token acquisition (doRefresh) with fetch to token endpoint in src/auth/token-manager.ts
- [X] T016 [US2] Implement token storage and expiry calculation in src/auth/token-manager.ts
- [X] T017 [US2] Implement ensureValidToken() for lazy token acquisition in src/auth/token-manager.ts
- [X] T018 [US2] Add retry logic integration for failed token requests in src/auth/token-manager.ts
- [X] T019 [US2] Implement request() method in Pax8Client that calls ensureValidToken() in src/client/pax8-client.ts
- [X] T020 [US2] Handle 401 errors from token endpoint with Pax8AuthenticationError in src/auth/token-manager.ts

**Checkpoint**: Client automatically acquires token on first request. Token is stored for reuse.

---

## Phase 5: User Story 3 - Automatic Token Refresh (Priority: P2)

**Goal**: Client proactively refreshes tokens within 5-minute expiry buffer when autoRefresh is enabled

**Independent Test**: Simulate token near expiry, make request, verify new token is obtained without error

### Implementation for User Story 3

- [ ] T021 [US3] Implement isTokenExpiringSoon() with 5-minute buffer check in src/auth/token-manager.ts
- [ ] T022 [US3] Implement concurrent request handling with promise mutex pattern in src/auth/token-manager.ts
- [ ] T023 [US3] Update ensureValidToken() to check autoRefresh config and expiry buffer in src/auth/token-manager.ts
- [ ] T024 [US3] Handle token refresh failures with retry and clear error messaging in src/auth/token-manager.ts
 - [X] T021 [US3] Implement isTokenExpiringSoon() with 5-minute buffer check in src/auth/token-manager.ts
 - [X] T022 [US3] Implement concurrent request handling with promise mutex pattern in src/auth/token-manager.ts
 - [X] T023 [US3] Update ensureValidToken() to check autoRefresh config and expiry buffer in src/auth/token-manager.ts
 - [X] T024 [US3] Handle token refresh failures with retry and clear error messaging in src/auth/token-manager.ts

**Checkpoint**: Long-running applications automatically get fresh tokens before expiry.

---

## Phase 6: User Story 4 - Manual Token Management (Priority: P3)

**Goal**: Developers can manually refresh tokens and query token status

**Independent Test**: Disable autoRefresh, manually call refreshToken(), verify new token is obtained

### Implementation for User Story 4

- [X] T025 [US4] Implement public refreshToken() method in Pax8Client in src/client/pax8-client.ts
- [X] T026 [US4] Implement isTokenValid() and getTokenExpiresAt() helper methods in src/auth/token-manager.ts
- [X] T027 [US4] Expose token status methods on Pax8Client for debugging/advanced use in src/client/pax8-client.ts

**Checkpoint**: Developers have full control over token lifecycle when needed.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Public exports, documentation, and final validation

- [ ] T028 [P] Create public API exports in src/index.ts (Pax8Client, errors, types)
- [ ] T029 [P] Add comprehensive JSDoc comments to all public APIs
- [ ] T030 Validate implementation against quickstart.md examples
- [ ] T031 [P] Create README example code snippet for package documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on T005 (directory structure)
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 (needs Pax8Client class)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (needs token acquisition)
- **User Story 4 (Phase 6)**: Depends on Phase 5 (needs token refresh logic)
- **Polish (Phase 7)**: Depends on all user stories

### Within Each Phase

- Tasks marked [P] can run in parallel
- Non-parallel tasks must complete sequentially

### Parallel Opportunities per Phase

**Phase 1 Setup**:
```
T001 → T002, T003, T004 (in parallel) → T005
```

**Phase 2 Foundational**:
```
T006 → T007, T008, T009 (in parallel)
```

**Phase 3 User Story 1**:
```
T010, T011 (in parallel) → T012 → T013
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (client initialization)
4. Complete Phase 4: User Story 2 (token acquisition)
5. **STOP and VALIDATE**: Client can make authenticated requests
6. Deploy/demo MVP

### Incremental Delivery

1. MVP (US1 + US2) → Basic authenticated client works
2. Add User Story 3 → Long-running apps supported
3. Add User Story 4 → Advanced users have manual control
4. Each increment adds value without breaking previous

---

## Task Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|------------------------|
| Setup | T001-T005 (5) | T002, T003, T004 |
| Foundational | T006-T009 (4) | T007, T008, T009 |
| US1: Init Client | T010-T013 (4) | T010, T011 |
| US2: Token Acquisition | T014-T020 (7) | None (sequential flow) |
| US3: Auto Refresh | T021-T024 (4) | None (builds on previous) |
| US4: Manual Control | T025-T027 (3) | None (builds on previous) |
| Polish | T028-T031 (4) | T028, T029, T031 |

**Total Tasks**: 31
**Parallel Opportunities**: 10 tasks can run in parallel with others

---

## Notes

- No test tasks included (tests not explicitly requested in spec)
- [P] tasks can run in parallel within their phase
- [USn] labels map tasks to user stories for traceability
- User Stories 1 and 2 are both P1 priority - implement together for MVP
- Commit after each task or logical group
- Verify quickstart.md examples work after each user story
