# Context Optimization for AI-Native Codebases

How to structure code to minimize context dilution and maximize AI agent effectiveness.

---

## Core Finding: Context Windows Are Limited

**Research**: "Context Rot" (Chroma Research, 2025)

**Models Tested**: 18 LLMs including GPT-4.1, Claude 4, Gemini 2.5

**Key Findings**:
- **13.9-85% accuracy drop** as context grows
- **Middle-loss**: 20+ point performance drop when critical info is buried in middle
- **Effective window**: Much smaller than advertised (100th token ≠ 10,000th token)

**Implication**: Advertised context windows (128K, 200K tokens) ≠ effective context windows.

---

## 1. Critical Code Positioning: First/Last 20%

**Research**: Multiple studies show AI models process beginning and end of context more reliably than middle.

### Anti-Pattern: Important Code Buried

```typescript
// ❌ BAD: Public API buried in middle (lines 500-600 of 1000-line file)

// Lines 1-499: Internal implementation details
// ...

// Lines 500-600: PUBLIC API (buried!)
export interface UserService {
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
}

// Lines 601-1000: More internal details
// ...
```

### Pattern: Critical Code at Edges

```typescript
// ✅ GOOD: File structure optimized for context positioning

// Lines 1-100: PUBLIC API at top (first 20%)
export interface UserService {
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: number, data: UpdateUserInput): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
};

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// Lines 101-400: Implementation (middle)
export function createUserService(db: Database): UserService {
  return {
    async getUser(id) {
      // Implementation...
    },
    async createUser(data) {
      // Implementation...
    },
    // ...
  };
}

// Lines 401-500: Helper functions (last 20%)
function validateUserInput(input: unknown): ValidatedUser {
  return UserInputSchema.parse(input);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
```

**Structure**:
- **First 20%**: Public API, type definitions, contracts
- **Middle 60%**: Implementation details
- **Last 20%**: Helper functions, constants, utilities

---

## 2. File Size Limits: 150-400 Lines

**Finding**: LLMs process the 100th token more reliably than the 10,000th token.

**Guideline**:
- **Target: 150-250 lines** per file
- **Maximum: 400 lines** (split if larger)
- **Minimum: 50 lines** (consider consolidation if smaller)

### Anti-Pattern: Monolithic Files

```
// ❌ BAD: 2000-line file
src/
  services/
    user.ts  (2000 lines)
```

### Pattern: Focused Modules

```
// ✅ GOOD: Split into focused files
src/
  users/
    index.ts           (50 lines - public API)
    service.ts         (200 lines - service implementation)
    repository.ts      (150 lines - data access)
    validation.ts      (100 lines - input validation)
    types.ts           (80 lines - type definitions)
    errors.ts          (60 lines - error classes)
```

**When to split**:
- File exceeds 400 lines
- Multiple unrelated responsibilities
- Testing becomes difficult
- Hard to find specific code

---

## 3. Related Code Proximity: 2000-Token Windows

**Research**: "Tokenomics" (arXiv:2601.14470)

**Finding**: 60-70% of tokens spent on context retrieval. **Targeted retrieval** reduces token usage by 40%.

**Guideline**: Keep related code within **2000 tokens** (~500-800 lines depending on language).

### Anti-Pattern: Scattered Dependencies

```
// ❌ BAD: Dependencies scattered across files
src/
  utils/
    validation.ts      // validateEmail()
  services/
    auth.ts           // Uses validateEmail()
  api/
    routes/
      users.ts        // Uses validateEmail() and auth
```

### Pattern: Colocated Dependencies

```
// ✅ GOOD: Related code together
src/
  auth/
    index.ts          // Public API
    validation.ts     // Email validation (used by service.ts)
    service.ts        // Auth service (uses validation.ts)
    types.ts          // Shared types
  
  api/
    routes/
      users.ts        // Imports from @/auth
```

**Benefits**:
- AI agents find dependencies quickly
- Less context switching
- Clear module boundaries

---

## 4. Import Organization: Semantic Grouping

### Anti-Pattern: Random Import Order

```typescript
// ❌ BAD: Random order
import { getUser } from './utils';
import React from 'react';
import { validateEmail } from '../validation';
import { db } from '@/lib/db';
import type { User } from '@/types';
import _ from 'lodash';
```

### Pattern: Grouped and Sorted

```typescript
// ✅ GOOD: Semantic groups with blank lines
// 1. External dependencies (node_modules)
import React from 'react';
import _ from 'lodash';

// 2. Internal libraries (@/ paths)
import { db } from '@/lib/db';
import type { User } from '@/types';

// 3. Relative imports (same module)
import { getUser } from './utils';
import { validateEmail } from './validation';

// 4. Side effects (CSS, etc.)
import './styles.css';
```

**Order**:
1. Node modules (external)
2. Internal libraries (absolute imports)
3. Relative imports (same module)
4. Side effects (CSS, assets)

---

## 5. Dependency Depth: Maximum 3-4 Levels

### Anti-Pattern: Deep Dependency Chains

```
// ❌ BAD: 6-level dependency chain
src/
  api/
    routes/
      users.ts        → service.ts
                      → repository.ts
                      → connection.ts
                      → pool.ts
                      → config.ts
                      → env.ts  (6 levels!)
```

### Pattern: Shallow Dependencies

```
// ✅ GOOD: Maximum 3 levels
src/
  api/
    routes/
      users.ts        → @/users/service  (level 1)
  
  users/
    service.ts        → @/users/repository  (level 2)
    repository.ts     → @/lib/db  (level 3)
  
  lib/
    db.ts            (base level)
```

**Guideline**: If you need more than 3 levels, consider:
- Flattening hierarchy
- Introducing abstraction layer
- Consolidating intermediate layers

---

## 6. Breadcrumb Comments: Navigation Aids

### Pattern: Section Markers

```typescript
// ✅ GOOD: Section markers for large files
// =============================================================================
// PUBLIC API
// =============================================================================

export interface UserService {
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
}

// =============================================================================
// IMPLEMENTATION
// =============================================================================

export function createUserService(db: Database): UserService {
  return {
    async getUser(id) {
      // ...
    },
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function validateUserInput(input: unknown): ValidatedUser {
  return UserInputSchema.parse(input);
}
```

**Benefits**:
- AI agents can jump to sections quickly
- Clear visual separation
- Easy to navigate large files

---

## 7. README Links: Entry Points

### Anti-Pattern: Generic README

```markdown
# My Project

This is a project that does things.

## Installation

npm install
```

### Pattern: README as Navigation Hub

```markdown
# My Project

## Architecture

- **Entry point**: [`src/index.ts`](./src/index.ts)
- **API routes**: [`src/api/routes/`](./src/api/routes/)
- **Business logic**: [`src/services/`](./src/services/)
- **Database**: [`src/db/`](./src/db/)

## Key Files

- [`src/users/service.ts`](./src/users/service.ts) - User management logic
- [`src/auth/service.ts`](./src/auth/service.ts) - Authentication
- [`src/payments/service.ts`](./src/payments/service.ts) - Payment processing

## Configuration

- [`.ai/architecture.json`](./.ai/architecture.json) - Module dependencies
- [`AGENTS.md`](./AGENTS.md) - Machine-readable instructions
```

**Benefits**:
- AI agents know where to start
- Key files linked directly
- Clear architectural overview

---

## 8. Chunking Strategy: Semantic Boundaries

### Anti-Pattern: Arbitrary Chunking

```typescript
// ❌ BAD: Split mid-function
// file1.ts
export function createUser(input: CreateUserInput) {
  const validated = validateInput(input);
  const normalized = normalizeData(validated);
  // (continued in file2.ts)
```

### Pattern: Semantic Chunking

```typescript
// ✅ GOOD: Split at semantic boundaries
// validation.ts - Complete responsibility
export function validateUserInput(input: unknown): ValidatedUser {
  return UserInputSchema.parse(input);
}

// transformation.ts - Complete responsibility
export function normalizeUserData(input: ValidatedUser): NormalizedUser {
  return {
    email: input.email.toLowerCase(),
    name: input.name.trim(),
  };
}

// service.ts - Orchestration
export function createUser(input: unknown): Promise<User> {
  const validated = validateUserInput(input);
  const normalized = normalizeUserData(validated);
  return db.users.create(normalized);
}
```

---

## 9. Context Compression: Remove Boilerplate

### Anti-Pattern: Verbose Boilerplate

```typescript
// ❌ BAD: Repetitive boilerplate (wastes tokens)
export interface GetUserRequest {
  userId: number;
}

export interface GetUserResponse {
  user: User;
}

export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface CreateUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  userId: number;
  email?: string;
  name?: string;
}

export interface UpdateUserResponse {
  user: User;
}
```

### Pattern: Concise Types

```typescript
// ✅ GOOD: Eliminate repetition
export interface UserService {
  getUser(userId: number): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(userId: number, input: UpdateUserInput): Promise<User>;
}

export type CreateUserInput = Pick<User, 'email' | 'name'>;
export type UpdateUserInput = Partial<CreateUserInput>;
```

---

## 10. LongCodeZip: Context Compression

**Research**: LongCodeZip (arXiv:2510.00446)

**Method**: Code-specific compression using structures and dependencies (not general text compression).

**Result**: **3-5x compression** with minimal performance loss.

### Pattern: Compression-Friendly Structure

```typescript
// ✅ GOOD: Structure enables compression
export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

// Instead of repeating strings everywhere:
throw new Error('Invalid input');
throw new Error('Not found');
throw new Error('Unauthorized');

// Use constants:
throw new AppError(ErrorCodes.INVALID_INPUT);
throw new AppError(ErrorCodes.NOT_FOUND);
throw new AppError(ErrorCodes.UNAUTHORIZED);
```

---

## 11. Dependency Graph Metadata

**Critical**: Provide machine-readable dependency information.

### Pattern: .ai/architecture.json

```json
{
  "modules": {
    "auth": {
      "entry": "src/auth/index.ts",
      "dependencies": ["db", "crypto"],
      "exports": ["authenticate", "authorize"],
      "size": "~500 lines",
      "description": "Authentication service"
    },
    "users": {
      "entry": "src/users/index.ts",
      "dependencies": ["auth", "db"],
      "exports": ["getUser", "createUser", "updateUser"],
      "size": "~800 lines",
      "description": "User management"
    }
  }
}
```

**Benefits**:
- AI agents navigate via graph (O(log n))
- No full-text search needed (O(n))
- Clear dependency boundaries

---

## 12. Context Budget: Track Token Usage

### Pattern: Measure and Optimize

```typescript
// ✅ GOOD: Add token estimates to large files
/**
 * User Service
 * 
 * Token budget: ~2000 tokens
 * Dependencies: db, validation (adds ~500 tokens)
 * Total context: ~2500 tokens
 * 
 * @module users/service
 */
export function createUserService(db: Database): UserService {
  // Implementation...
}
```

**Rule of thumb**:
- 1 token ≈ 4 characters (English)
- 100 lines ≈ 500-800 tokens
- Keep module context < 5000 tokens

---

## Summary: Context Optimization Checklist

- [ ] Critical code in first/last 20% of files
- [ ] Files are 150-400 lines (target 200-250)
- [ ] Related code within 2000 tokens
- [ ] Imports organized by semantic groups
- [ ] Dependency depth ≤ 3-4 levels
- [ ] Section markers in large files
- [ ] README links to key entry points
- [ ] Code split at semantic boundaries (not arbitrarily)
- [ ] Boilerplate minimized (DRY for types)
- [ ] .ai/architecture.json with module graph
- [ ] Token budget tracked for large modules
- [ ] No files > 400 lines

---

**📌 Key Insight**: Context windows are advertised as 128K+ tokens, but **effective recall drops dramatically** after ~10K tokens. Optimize for the first 2000-5000 tokens — that's where AI agents will look first and remember best.

---

**References**:
- Chroma Research (2025): "Context Rot" - 13.9-85% accuracy drop
- arXiv:2601.14470 (2026): "Tokenomics" - 60-70% tokens on retrieval
- arXiv:2510.00446 (2025): "LongCodeZip" - 3-5x compression
- Stanford/Google/Anthropic/Meta (2025): "Context Dilution" - Middle-loss effect
