# AI-Native Codebase Checklist

Use this checklist to verify your codebase against evidence-based AI-native standards.

---

## 📋 Quick Health Check (5 minutes)

- [ ] `AGENTS.md` exists at project root
- [ ] Variables are named descriptively (not `d`, `u`, `tmp`, `data`)
- [ ] Functions are < 50 lines each
- [ ] TypeScript strict mode is enabled (or equivalent for your language)
- [ ] External data is validated (Zod, Pydantic, JSON Schema)
- [ ] Error handling uses typed errors (not generic `Error`)
- [ ] Public functions have documentation comments
- [ ] No `any` types (use `unknown` and narrow)

**If you checked ≥ 6/8**: Good foundation. Continue to detailed audit.  
**If you checked < 6/8**: Start with **Phase 1** below.

---

## 📊 Detailed Audit

### 1. Architecture (Navigation-First Design)

**Goal**: Enable AI agents to navigate code via graph structure, not grep.

- [ ] `.ai/architecture.json` exists with module dependencies
- [ ] Modules follow bounded context pattern (clear domain boundaries)
- [ ] Three-layer architecture (interface → domain → infrastructure)
- [ ] Dependencies flow downward only (no circular dependencies)
- [ ] Each module has single entry point (`index.ts` or equivalent)
- [ ] No hidden global state (explicit dependency injection)
- [ ] Files are 150-400 lines (split if larger)
- [ ] Critical code (types, public APIs) at top 20% of files
- [ ] Related code is within 2000 tokens of each other

**Impact**: 40% improvement in code localization (LocAgent, ACL 2025)

---

### 2. Code Structure (Semantic Clarity)

**Goal**: Minimize semantic depth for AI comprehension.

- [ ] Functions have ≤ 4 semantic depth levels
- [ ] Functions are 20-50 lines (target 30)
- [ ] Each function has single responsibility
- [ ] Guard clauses instead of deeply nested ifs
- [ ] Named constants for all magic numbers (except 0, 1, -1)
- [ ] Pure functions where possible (no hidden mutations)
- [ ] Composition over inheritance (flat type hierarchies)
- [ ] Immutability by default (explicit state transformations)
- [ ] No "clever" code (explicit > implicit)

**Impact**: Up to 20.9% performance improvement (Xie et al., 2026)

---

### 3. Naming Conventions (Descriptive > Concise)

**Goal**: Maximize semantic similarity through explicit names.

- [ ] Variables describe WHAT they contain (not just type)
- [ ] Functions describe WHAT they do (verb + noun)
- [ ] Constants describe WHY they exist (semantic purpose)
- [ ] Boolean variables/functions are predicates (`isValid`, `hasAccess`)
- [ ] No abbreviations unless industry-standard (`id`, `url`, `api`)
- [ ] No single-letter variables (except loop counters)
- [ ] Type names match domain language (ubiquitous language)

**Impact**: +9% semantic similarity vs. minimal names (Yakubov, 2025)

**Examples**:
```typescript
// ❌ BAD
const d = new Date();
const u = getU(id);

// ✅ GOOD
const currentTimestamp = new Date();
const authenticatedUser = getUserById(id);
```

---

### 4. Documentation (TSDoc + AGENTS.md)

**Goal**: Provide machine-readable context for AI agents.

#### AGENTS.md
- [ ] Exists at project root
- [ ] Lists exact build/test/dev commands (copy-paste ready)
- [ ] Documents code style with examples
- [ ] Lists constraints (what NOT to do)
- [ ] Includes common patterns (working code snippets)
- [ ] Updated within last 3 months

#### TSDoc/JSDoc
- [ ] Every exported function has documentation comment
- [ ] `@param` includes constraints (not just types)
- [ ] `@returns` describes format (not just type)
- [ ] `@throws` lists all error conditions
- [ ] At least 2 `@example` blocks per complex function
- [ ] `@remarks` for gotchas, performance notes, alternatives

#### Inline Comments
- [ ] Comments explain WHY, not WHAT
- [ ] Complex algorithms have rationale comments
- [ ] Workarounds have TODO with issue link
- [ ] No dead code (delete it — git preserves history)

**Impact**: 40% reduction in corrections (AGENTS.md), Significant improvement in LLM understanding (ACL 2024)

---

### 5. Type Systems (Types as Contracts)

**Goal**: Catch errors at compile time AND runtime.

- [ ] TypeScript strict mode enabled (or equivalent)
- [ ] No `any` types (use `unknown` and narrow)
- [ ] Explicit return types for exported functions
- [ ] Zod/Pydantic schemas for all external data
- [ ] Types defined before implementation
- [ ] Enums for closed sets (not string unions)
- [ ] Branded types for domain primitives (UserId, Email, etc.)

**Impact**: 35% fewer hallucinations vs. untyped code (2026 study)

**Example**:
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number().positive(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

type User = z.infer<typeof UserSchema>;

function getUser(id: number): Promise<User> {
  const data = await fetch(`/users/${id}`);
  return UserSchema.parse(data);  // Runtime validation
}
```

---

### 6. Error Handling (Typed Hierarchies)

**Goal**: Enable categorical error handling for AI agents.

- [ ] Custom error classes (not generic `Error`)
- [ ] Error hierarchy reflects domain (UserError, PaymentError, etc.)
- [ ] Each error has `code` property (string enum)
- [ ] Each error has `retryable` flag (boolean)
- [ ] Errors include context (original values, state)
- [ ] Catch blocks are specific (not `catch (e)` for everything)
- [ ] No empty catch blocks
- [ ] No silent error suppression

**Impact**: AI agents learn error taxonomy, 3-attempt debugging limit respected

**Example**:
```typescript
class PaymentError extends Error {
  code: PaymentErrorCode;
  retryable: boolean;
}

class InsufficientFundsError extends PaymentError {
  constructor(required: Money, available: Money) {
    super(`Need ${required}, have ${available}`);
    this.code = 'INSUFFICIENT_FUNDS';
    this.retryable = false;
  }
}
```

---

### 7. Context Optimization (Avoid Dilution)

**Goal**: Keep critical information in AI's effective context window.

- [ ] Important types/interfaces at top of files
- [ ] Related functions within 2000 tokens of each other
- [ ] Module dependencies in `.ai/architecture.json`
- [ ] Large files (>400 lines) split into submodules
- [ ] Imports organized by category (stdlib, external, internal)
- [ ] No deeply nested folders (max 4 levels)
- [ ] README links to key entry points

**Impact**: 13.9-85% accuracy improvement (Context Rot study, 2025)

---

### 8. Testing (Verification Infrastructure)

**Goal**: Enable AI agents to verify their changes.

- [ ] Test commands in `AGENTS.md`
- [ ] Unit tests for all utilities
- [ ] Integration tests for all API routes
- [ ] E2E tests for critical flows
- [ ] Test files colocated with source (or in `__tests__`)
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Descriptive test names (`it('throws on negative quantity')`)
- [ ] Minimum coverage target defined (e.g., 80%)

**Why**: AI debugging has exponential decay after 3 attempts — tests catch errors early.

---

### 9. Tooling Integration (LSP + AST)

**Goal**: Enable semantic navigation (900x faster than grep).

- [ ] LSP configured (TypeScript, Pylance, rust-analyzer, etc.)
- [ ] `.vscode/settings.json` with LSP enabled (if VSCode)
- [ ] AST-based linting (ESLint, Pylint, Clippy, etc.)
- [ ] Pre-commit hooks (lint, typecheck, test)
- [ ] CI/CD runs full verification (build, test, lint)

**Impact**: 900x faster navigation vs. text search (50ms vs 45 seconds)

---

### 10. Security (Explicit Validation)

**Goal**: Never trust external input.

- [ ] All user input validated with schemas
- [ ] SQL uses prepared statements (no string concatenation)
- [ ] HTML sanitization for user-generated content
- [ ] CSRF protection enabled
- [ ] Rate limiting on API endpoints
- [ ] Secrets in environment variables (not hardcoded)
- [ ] No secrets in client-side code
- [ ] Dependency scanning (Snyk, Dependabot, etc.)

---

## 🎯 Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Basic AI-friendly structure

- [ ] Add `AGENTS.md` to project root
- [ ] Enable TypeScript strict mode (or equivalent)
- [ ] Add Zod/Pydantic validation for external data
- [ ] Configure LSP integration
- [ ] Add TSDoc to all public APIs

**Outcome**: AI agents can understand basic project structure and contracts.

---

### Phase 2: Code Quality (Week 2)
**Goal**: Optimize for AI comprehension

- [ ] Audit function semantic depth (max 4 levels)
- [ ] Rename variables to descriptive names
- [ ] Add explicit error handling with typed errors
- [ ] Create `.ai/architecture.json` dependency map
- [ ] Set up AST-based linting

**Outcome**: AI agents can navigate code and understand logic flow.

---

### Phase 3: Documentation (Week 3)
**Goal**: Provide complete context

- [ ] Add `@example` blocks to complex functions
- [ ] Document constraints in `AGENTS.md`
- [ ] Create pattern library (common code snippets)
- [ ] Add `@remarks` for gotchas
- [ ] Version control AI prompts (`.cursor/rules/`)

**Outcome**: AI agents can learn from examples and avoid common pitfalls.

---

### Phase 4: Tooling (Week 4)
**Goal**: Enable verification

- [ ] Set up MCP server (if applicable)
- [ ] Configure automated test running
- [ ] Add pre-commit hooks
- [ ] Set up CI/CD verification
- [ ] Create debugging playbooks

**Outcome**: AI agents can verify their changes automatically.

---

## 📈 Measuring Success

### Quantitative Metrics

- **Context window usage**: < 50% of available tokens for typical tasks
- **Localization accuracy**: AI finds correct files in < 3 attempts
- **First-attempt success rate**: > 70% for routine tasks
- **Correction iterations**: < 2 rounds for typical changes
- **Test pass rate**: > 95% after AI changes

### Qualitative Indicators

- AI agents complete tasks without asking clarifying questions
- Generated code matches existing patterns
- AI-generated PRs pass code review without style comments
- Debugging sessions resolve in ≤ 3 attempts
- New team members (human or AI) onboard faster

---

## 🚨 Red Flags

If you see these patterns, prioritize fixes:

- **Deep nesting**: Functions with > 4 semantic levels
- **Large files**: > 500 lines per file
- **Generic errors**: `throw new Error('...')` everywhere
- **Magic numbers**: Unexplained constants throughout code
- **Missing docs**: Exported functions without TSDoc
- **Type any**: `any` types in more than 1% of code
- **Implicit state**: Global variables and hidden mutations
- **Dead code**: Commented-out code, unused exports
- **Circular deps**: Modules that depend on each other
- **Unclear contracts**: Interface changes break consumers

---

## 🎓 Learning Resources

See [`research/papers.md`](./research/papers.md) for academic sources.  
See [`research/industry.md`](./research/industry.md) for production case studies.

---

**Next Steps**: Pick one phase above and start implementing. Each phase builds on the previous, but you can prioritize based on your team's needs.

**Questions?** Open an issue or discussion in this repository.
