# Documentation Standards for AI-Native Codebases

## Core Principle: Documentation IS Code

**Finding**: Documentation is not an afterthought for AI agents — it's **primary input data**.

- **TSDoc with examples**: AI learns from patterns, not prose
- **Type systems**: Zod/TypeScript = 35% fewer hallucinations
- **AGENTS.md**: Machine-readable instructions = 40% fewer corrections

---

## 1. TSDoc/JSDoc Standard

### The Evidence

**Research**: "Testing the Effect of Code Documentation on Large Language Model Code Understanding" (ACL 2024)

**Finding**: Block comments and inline comments **significantly improve** LLM code understanding compared to uncommented code.

### Template: Complete TSDoc

```typescript
/**
 * Brief one-line description of what this function does.
 *
 * Longer explanation of WHY this exists (not WHAT it does — code shows what).
 * Include:
 * - Behavioral contracts
 * - Invariants that must hold
 * - Performance characteristics (if relevant)
 *
 * @param userId - User ID (must be positive integer from auth token)
 * @param options - Configuration object
 * @param options.includeDeleted - Whether to include soft-deleted records (default: false)
 * @param options.maxResults - Maximum results to return (1-100, default: 10)
 * 
 * @returns User object with profile data, validated against UserSchema
 * 
 * @throws {NotFoundError} If user doesn't exist
 * @throws {PermissionError} If caller lacks read:user permission
 * @throws {ValidationError} If userId is invalid format (negative, NaN, etc.)
 * 
 * @example
 * // Common case: Fetch active user
 * const user = await getUser(123, { includeDeleted: false });
 * console.log(user.name);
 * 
 * @example
 * // Admin retrieving deleted user for audit
 * const deleted = await getUser(456, { includeDeleted: true });
 * // Requires admin role or audit:read permission
 * 
 * @example
 * // Error handling
 * try {
 *   const user = await getUser(invalidId);
 * } catch (e) {
 *   if (e instanceof NotFoundError) {
 *     console.log('User does not exist');
 *   }
 * }
 * 
 * @remarks
 * This function caches results for 5 minutes using Redis.
 * Use `getUserFresh()` to bypass cache.
 * For bulk operations (>10 users), use `getUsers()` instead (batched queries).
 * 
 * @see {@link getUsers} for batch retrieval
 * @see {@link getUserFresh} for cache bypass
 * @see {@link UserSchema} for return type structure
 */
async function getUser(
  userId: number,
  options: GetUserOptions = {}
): Promise<User> {
  // Implementation...
}
```

### Critical Tags

| Tag | Purpose | Why AI Needs It |
|-----|---------|----------------|
| `@param` | Parameter description with **constraints** | Knows valid ranges, formats, defaults |
| `@returns` | Return value with **expected format** | Knows what to expect, how to handle |
| `@throws` | Error conditions with **when it fails** | Learns error handling patterns |
| `@example` | **Multiple** real-world use cases | Learns from patterns, not prose |
| `@remarks` | Context that doesn't fit elsewhere | Gotchas, performance, alternatives |
| `@see` | Links to related functions | Discovers related code |

---

## 2. AGENTS.md Standard

### The Gold Standard for Machine Instructions

**Adoption**: 60,000+ repositories (as of 2026)  
**Impact**: 40% reduction in back-and-forth corrections with AI agents

### Complete Template

```markdown
# AGENTS.md

## Project Context
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Database**: Supabase (PostgreSQL 15 + Realtime subscriptions)
- **Auth**: NextAuth.js v5 (Edge-compatible, JWT sessions)
- **Styling**: Tailwind CSS 4.0 (CSS-first config, @apply NOT recommended)
- **Package Manager**: pnpm 9.x (NEVER use npm or yarn)
- **Node Version**: 20.x LTS (use `nvm use` to switch)
- **Runtime**: Node.js (server) + Edge Runtime (middleware, some API routes)

## Architecture

```
src/
  app/              # Next.js App Router (file-based routing)
    (auth)/         # Route group (auth pages)
    (dashboard)/    # Route group (protected pages)
    api/            # API routes
    layout.tsx      # Root layout
    page.tsx        # Home page
  
  components/
    ui/             # shadcn components (DO NOT modify manually)
    features/       # Business logic components (auth, payments, etc.)
    shared/         # Reusable components
  
  lib/              # Shared utilities
    db/             # Database client, schema, migrations
    auth/           # Auth helpers, session management
    utils/          # General utilities
  
  types/            # Shared TypeScript types
```

## Development Workflow

```bash
# Install dependencies
pnpm install

# Development server (localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run production build locally
pnpm start

# Run tests
pnpm test           # All tests
pnpm test:watch     # Watch mode
pnpm test:e2e       # End-to-end tests (requires dev server running)

# Linting and formatting
pnpm lint           # ESLint + Prettier check
pnpm lint:fix       # Auto-fix issues
pnpm format         # Format all files with Prettier

# Database
pnpm db:migrate     # Run pending migrations
pnpm db:rollback    # Rollback last migration
pnpm db:seed        # Seed database with test data
pnpm db:studio      # Open Prisma Studio (database GUI)

# Type checking
pnpm typecheck      # TypeScript type check without build
```

## Code Style

### General Rules
- **NO semicolons** (Prettier configured to omit)
- **Single quotes** for strings (except JSX, which uses double quotes)
- **2 spaces** for indentation
- **Named exports only** (NO default exports)
- **Max line length: 100** characters
- **Trailing commas**: Always (easier diffs)

### React/Next.js Specific
- **Server components by default** (use `'use client'` directive explicitly)
- **Async components** for data fetching (no useEffect for initial load)
- **Error boundaries** around all async components
- **Loading.tsx** for streaming UI (not manual loading states)
- **Parallel routes** for complex layouts (e.g., modals)

### TypeScript
- **Strict mode enabled** (tsconfig.json)
- **NO `any` type** (use `unknown` and narrow with type guards)
- **Explicit return types** for exported functions
- **Zod for all external data** (API responses, form inputs, env vars)

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Functions/Variables | camelCase | `getUserById`, `isAuthenticated` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `API_TIMEOUT` |
| Types/Interfaces | PascalCase | `User`, `ApiResponse` |
| Database tables | snake_case | `user_profiles`, `order_items` |
| API routes | kebab-case | `/api/user-settings` |
| Filenames | kebab-case (except components) | `get-user.ts`, `UserCard.tsx` |

## Constraints (CRITICAL - READ FIRST)

### NEVER
- **NEVER use `any` type** (use `unknown` and narrow)
- **NEVER skip Zod validation** on external data (API, forms, env)
- **NEVER modify shadcn components** directly (override via `className` instead)
- **NEVER commit `.env` files** (use `.env.example` for documentation)
- **NEVER use `suppressHydrationWarning`** (fix the root cause)
- **NEVER use default exports** (named exports only)
- **NEVER use `console.log` in production** (use proper logging: `pino`)
- **NEVER use `eval()` or `Function()` constructor
- **NEVER store secrets in client components** (use server-only)

### ALWAYS
- **ALWAYS validate external data** with Zod
- **ALWAYS use prepared statements** for SQL (prevent injection)
- **ALWAYS sanitize user-generated HTML** (use `DOMPurify` if needed)
- **ALWAYS use HTTPS** (except localhost)
- **ALWAYS rate limit** API routes (100 req/min per IP minimum)
- **ALWAYS add tests** for new features (unit + integration)
- **ALWAYS update this file** when patterns change

## Common Patterns

### API Route Pattern
```typescript
// app/api/users/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const UserInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18),
});

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Validate input
  const body = await request.json();
  const parsed = UserInputSchema.safeParse(body);
  
  if (!parsed.success) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  
  // 3. Business logic
  const user = await createUser(parsed.data);
  
  // 4. Return response
  return Response.json({ user }, { status: 201 });
}
```

### Server Action Pattern
```typescript
// app/actions/user.ts
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  // 1. Auth check
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  // 2. Validate
  const data = CreateUserSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
  });
  
  // 3. Database operation
  const user = await db.users.create({ data });
  
  // 4. Revalidate cache
  revalidatePath('/users');
  
  return { success: true, user };
}
```

### Error Handling Pattern
```typescript
// lib/errors.ts
export class AppError extends Error {
  code: string;
  statusCode: number;
  retryable: boolean;
  
  constructor(message: string, code: string, statusCode: number, retryable = false) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404, false);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, false);
  }
}

export class DatabaseError extends AppError {
  constructor(cause: Error) {
    super('Database operation failed', 'DB_ERROR', 500, true);
    this.cause = cause;
  }
}

// Usage in API route
try {
  const user = await getUser(id);
} catch (e) {
  if (e instanceof NotFoundError) {
    return Response.json({ error: e.message }, { status: 404 });
  }
  
  if (e instanceof DatabaseError && e.retryable) {
    // Retry logic or queue for later
  }
  
  throw e;  // Unknown error, let error boundary handle
}
```

## Testing Requirements

### Coverage
- **Minimum 80% coverage** for new code
- **100% coverage** for critical paths (auth, payments)
- **Unit tests**: All utilities in `lib/`
- **Integration tests**: All API routes
- **E2E tests**: Critical user flows (signup, checkout, etc.)

### Test Structure
```typescript
// lib/utils/__tests__/calculate-price.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePrice } from '../calculate-price';

describe('calculatePrice', () => {
  it('calculates base price correctly', () => {
    expect(calculatePrice({ quantity: 2, unitPrice: 10 })).toBe(20);
  });
  
  it('applies discount when provided', () => {
    expect(calculatePrice({ quantity: 2, unitPrice: 10, discount: 0.1 })).toBe(18);
  });
  
  it('throws on negative quantity', () => {
    expect(() => calculatePrice({ quantity: -1, unitPrice: 10 })).toThrow();
  });
});
```

## Performance Requirements

- **Lighthouse score**: 90+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Initial JavaScript bundle**: < 200KB (gzip)
- **API response time**: < 200ms (p95)

## Security Requirements

- **All user input validated** with Zod (no exceptions)
- **SQL injection prevention**: Use parameterized queries only (Prisma handles this)
- **XSS prevention**: Sanitize user-generated HTML (use `dangerouslySetInnerHTML` sparingly)
- **CSRF protection**: Enabled via NextAuth (cookie-based sessions)
- **Rate limiting**: 100 req/min per IP on API routes (use `@upstash/ratelimit`)
- **Content Security Policy**: Strict CSP headers (configured in `next.config.js`)
- **Secrets management**: Use environment variables, NEVER hardcode

## AI Agent Hints

### When Adding New Features
1. **Update this file first** if introducing new patterns
2. **Search existing code** for similar implementations (`grep`, `ast-grep`)
3. **Follow existing patterns** (don't invent new ones without discussion)
4. **Add tests** (write tests BEFORE implementation if possible)

### When Debugging
1. **Read error messages completely** before attempting fixes
2. **Check related files** (imports, types, database schema)
3. **Run type checker** (`pnpm typecheck`) before submitting
4. **Run tests** (`pnpm test`) after each fix

### When Refactoring
1. **Run tests after each step** (incremental verification)
2. **Keep changes small** (< 300 lines per PR)
3. **Update documentation** if public API changes
4. **Check for regressions** (`pnpm test:e2e`)

### Common Pitfalls
- **Don't forget** to revalidate cache after mutations (use `revalidatePath`)
- **Don't assume** Server Components have access to browser APIs (they don't)
- **Don't mix** server and client code in same file (use `'use client'` directive)
- **Don't use** `useEffect` for data fetching in Server Components (use `async/await`)
```

---

## 3. Type Systems as Documentation

### Zod + TypeScript Pattern

```typescript
import { z } from 'zod';

// Schema IS the documentation
export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  settings: z.object({
    theme: z.enum(['light', 'dark']).default('light'),
    notifications: z.boolean().default(true),
    language: z.enum(['en', 'ko', 'ja']).default('en'),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// TypeScript type inferred from schema
export type User = z.infer<typeof UserSchema>;

/**
 * Fetch user by ID with runtime validation.
 * 
 * Runtime validation catches:
 * - API returning invalid data (schema mismatch)
 * - Database corruption (unexpected null values)
 * - Integration issues (third-party service changes)
 * 
 * @param id - User ID (positive integer)
 * @returns Validated User object guaranteed to match UserSchema
 * @throws {ZodError} If data doesn't match schema (detailed validation errors)
 * @throws {NotFoundError} If user doesn't exist
 * 
 * @example
 * const user = await getUser(123);
 * // user is typed as User AND runtime-validated
 * console.log(user.settings.theme);  // TypeScript knows this exists
 */
export async function getUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new NotFoundError('User', id);
  }
  
  const data = await response.json();
  
  // Runtime validation catches AI mistakes before they propagate
  return UserSchema.parse(data);
}
```

**Benefits**:
- **Compile-time**: TypeScript catches type errors during development
- **Runtime**: Zod catches invalid data from external sources
- **Self-documenting**: Schema shows exactly what's valid (ranges, formats, defaults)
- **Single source of truth**: No drift between types and validation logic

---

## 4. Inline Comments for Complex Logic

### When to Comment

**Comment WHY, not WHAT:**

```typescript
// ❌ BAD: Comment states the obvious
// Loop through items
for (const item of items) {
  // Add price to total
  total += item.price;
}

// ✅ GOOD: Comment explains non-obvious reasoning
// Process items in original order to maintain customer selection sequence.
// Sorting by price would break "first come, first served" logic.
for (const item of items) {
  total += item.price;
}
```

**Comment for algorithm rationale:**

```typescript
// Use binary search instead of linear search because:
// 1. User IDs are guaranteed sorted (database index)
// 2. Dataset can be >1M users (O(log n) vs O(n) matters)
// 3. Benchmark: 50ms vs 5000ms on production dataset
const index = binarySearch(userIds, targetId);
```

**Comment for workarounds:**

```typescript
// WORKAROUND: Stripe API returns cents, not dollars.
// TODO: File issue with Stripe to add `currency_format` param.
// See: https://stripe.com/docs/api/charges
const amountInDollars = charge.amount / 100;
```

---

## Summary: Documentation Checklist

- [ ] Every exported function has TSDoc
- [ ] TSDoc includes `@param`, `@returns`, `@throws`
- [ ] At least 2 `@example` blocks per complex function
- [ ] `@remarks` for gotchas, performance notes, alternatives
- [ ] AGENTS.md exists with build commands, constraints, patterns
- [ ] Zod schemas for all external data boundaries
- [ ] TypeScript strict mode enabled
- [ ] Inline comments explain WHY, not WHAT
- [ ] Workarounds have TODO with ticket/issue link
- [ ] No dead code (if unused, delete it — git preserves history)

---

**📌 Key Insight**: For humans, documentation supplements code. For AI agents, documentation IS code. Types, schemas, and examples are primary input data.
