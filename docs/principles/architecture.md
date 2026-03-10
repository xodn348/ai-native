# Architecture Principles for AI-Native Codebases

## Core Principle: Navigation-First Design

**Finding**: AI agents spend **60-70% of their time searching for code**, not writing it. (Source: Morph Research 2026, Tokenomics arXiv:2601.14470)

Traditional codebases optimize for human readers. AI-native codebases optimize for **agent navigation**.

---

## 1. Graph-Structured Architecture

### The Navigation Paradox

**Research**: "The Navigation Paradox" (arXiv:2602.20048)

Despite 128K+ context windows, **graph-structured navigation outperforms RAG retrieval** for architectural tasks.

**Why?**
- Graph navigation: **O(log n)** complexity
- RAG retrieval: **O(n)** complexity
- Dependency graphs provide semantic structure that flat text lacks

### Implementation: Explicit Dependency Metadata

Create `.ai/architecture.json` at project root:

```json
{
  "modules": {
    "auth": {
      "entry": "src/auth/index.ts",
      "dependencies": ["db", "crypto"],
      "exports": ["authenticate", "authorize", "validateToken"],
      "contracts": "src/auth/contracts.ts",
      "description": "Authentication and authorization service"
    },
    "db": {
      "entry": "src/db/index.ts",
      "dependencies": [],
      "exports": ["query", "transaction", "migrate"],
      "contracts": "src/db/contracts.ts",
      "description": "Database abstraction layer"
    },
    "api": {
      "entry": "src/api/index.ts",
      "dependencies": ["auth", "db", "validation"],
      "exports": ["createRouter", "handleRequest"],
      "contracts": "src/api/contracts.ts",
      "description": "HTTP API layer"
    }
  },
  "layers": {
    "domain": ["auth", "users", "payments"],
    "infrastructure": ["db", "cache", "queue"],
    "interface": ["api", "cli", "webhooks"]
  },
  "constraints": {
    "noCircularDeps": true,
    "layerFlow": "interface → domain → infrastructure",
    "maxDependencies": 5
  }
}
```

**Benefits**:
- AI agents can navigate via graph (not grep)
- **40% improvement** in code localization (LocAgent, ACL 2025)
- Circular dependency detection at design time

---

## 2. Bounded Contexts (Domain-Driven Design)

### Clear Module Boundaries

**Anti-Pattern**: Flat structure with no domain separation

```
src/
  utils.ts          # 5000 lines of "utility functions"
  helpers.ts        # More misc functions
  common.ts         # Even more
  types.ts          # All types in one file
```

**Pattern**: Domain-driven module organization

```
src/
  auth/
    index.ts        # Public API surface
    internal/       # Private implementation
      password.ts
      tokens.ts
      sessions.ts
    contracts.ts    # Type definitions
    errors.ts       # Domain-specific errors
  
  payments/
    index.ts
    internal/
      stripe.ts
      paypal.ts
    contracts.ts
    errors.ts
```

**Why This Works**:
- AI agents can **scope searches** to relevant domains
- **Smaller context windows** per module
- **Clear boundaries** prevent cross-domain coupling

---

## 3. Layered Architecture

### Three-Layer Pattern

```
┌─────────────────────────────────┐
│   Interface Layer               │  (API, CLI, webhooks)
│   - HTTP handlers               │  - Depends on: Domain
│   - Input validation            │  - Exports: Routes, commands
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│   Domain Layer                  │  (Business logic)
│   - Use cases                   │  - Depends on: Infrastructure abstractions
│   - Business rules              │  - Exports: Services, domain models
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│   Infrastructure Layer          │  (External systems)
│   - Database                    │  - Depends on: Nothing
│   - Cache                       │  - Exports: Repositories, clients
└─────────────────────────────────┘
```

**Constraint**: Flow is **always downward**. Interface → Domain → Infrastructure. Never reverse.

---

## 4. Dependency Inversion

### Pattern: Depend on Abstractions

```typescript
// ✅ GOOD: Domain depends on abstraction
// src/payments/contracts.ts
export interface PaymentGateway {
  charge(amount: Money, source: PaymentSource): Promise<Transaction>;
  refund(transactionId: string): Promise<void>;
}

// src/payments/service.ts
import { PaymentGateway } from './contracts';

export class PaymentService {
  constructor(private gateway: PaymentGateway) {}
  
  async processPayment(order: Order): Promise<Receipt> {
    // Domain logic uses abstraction
    const transaction = await this.gateway.charge(
      order.totalAmount,
      order.paymentSource
    );
    return this.createReceipt(transaction);
  }
}

// src/infrastructure/stripe.ts
import { PaymentGateway } from '@/payments/contracts';

export class StripeGateway implements PaymentGateway {
  async charge(amount: Money, source: PaymentSource): Promise<Transaction> {
    // Stripe-specific implementation
  }
}
```

**Why This Works**:
- AI agents can understand **domain logic independently** of infrastructure
- **Swappable implementations** (test doubles, different vendors)
- **Clear contracts** reduce ambiguity

---

## 5. Single Entry Point Per Module

### Pattern: index.ts as Public API

```typescript
// src/auth/index.ts - ONLY exports public API
export { authenticate, authorize } from './internal/service';
export { validateToken } from './internal/tokens';
export type { AuthToken, AuthUser } from './contracts';

// DO NOT export:
// - Internal implementation details
// - Helper functions
// - Private types
```

**Benefits**:
- AI agents know exactly what's **public vs internal**
- **Reduces search space** (only look at index.ts first)
- **Prevents coupling** to internal implementation

---

## 6. Explicit Over Implicit Dependencies

### Anti-Pattern: Hidden Global State

```typescript
// ❌ BAD: Implicit database dependency
import { db } from '@/globals';  // Hidden side effect

export function getUser(id: number) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}
```

### Pattern: Explicit Dependency Injection

```typescript
// ✅ GOOD: Explicit dependency
export function createUserRepository(db: Database) {
  return {
    async getUser(id: number): Promise<User> {
      const row = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      return UserSchema.parse(row);
    },
    // Other methods...
  };
}

export type UserRepository = ReturnType<typeof createUserRepository>;
```

**Why This Works**:
- AI agents can **trace dependencies** through type system
- **No hidden side effects**
- **Testable** (inject mock database)

---

## 7. Avoid Deep Nesting

### Research Finding

**"Rethinking Code Complexity"** (Xie et al., 2026): Semantic compositional depth has **-0.73 to -0.95 correlation** with AI performance.

Traditional cyclomatic complexity? **No significant correlation** after controlling for code length.

### Anti-Pattern: Deep Semantic Nesting

```typescript
// ❌ BAD: 6 levels of semantic nesting
async function createOrder(input: OrderInput) {
  return await db.transaction(async (tx) => {          // Level 1
    const user = await tx.users.findOne({              // Level 2
      where: {
        email: input.email.trim().toLowerCase()        // Level 3
      }
    });
    
    if (!user) {                                       // Level 2
      throw new Error(await getErrorMessage({          // Level 3
        code: 'USER_NOT_FOUND',
        context: { email: input.email }                // Level 4
      }));
    }
    
    const order = await tx.orders.create({             // Level 2
      userId: user.id,
      items: input.items.map(item => ({                // Level 3
        productId: item.id,
        quantity: item.quantity,
        price: getPrice(item.id, user.tier)            // Level 4
      }))
    });
    
    return order;
  });
}
```

### Pattern: Flat Semantic Structure

```typescript
// ✅ GOOD: Maximum 3 levels
async function createOrder(input: OrderInput): Promise<Order> {
  const normalizedEmail = normalizeEmail(input.email);      // Level 1
  const user = await findUserByEmail(normalizedEmail);      // Level 1
  
  if (!user) {
    throw new UserNotFoundError(normalizedEmail);           // Level 1
  }
  
  const orderItems = prepareOrderItems(input.items, user);  // Level 1
  const order = await saveOrder(user.id, orderItems);       // Level 1
  
  return order;
}

// Each helper is independently understandable
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email: string): Promise<User | null> {
  return db.users.findOne({ where: { email } });
}

function prepareOrderItems(items: OrderItemInput[], user: User): OrderItem[] {
  return items.map(item => ({
    productId: item.id,
    quantity: item.quantity,
    price: getPrice(item.id, user.tier),
  }));
}
```

**Guideline**: **Maximum 3-4 semantic levels** per function.

---

## 8. Context Optimization

### The Context Dilution Problem

**Research**: Chroma Research (2025) - "Context Rot"

- Models tested: GPT-4.1, Claude 4, Gemini 2.5
- Finding: **13.9-85% accuracy drop** as context grows
- **Middle-loss**: 20+ point performance drop when critical info is buried

### Pattern: Critical Code at Edges

```typescript
// ✅ GOOD: Important types at top
export interface UserService {
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: number, data: UpdateUserInput): Promise<User>;
}

export type User = {
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
};

// Implementation below (less critical)
export function createUserService(db: Database): UserService {
  return {
    async getUser(id) {
      // Implementation details...
    },
    // More implementation...
  };
}
```

**Guideline**: 
- **First 20% of file**: Public API, types, contracts
- **Middle 60%**: Implementation
- **Last 20%**: Helper functions, constants

---

## 9. File Size Limits

### Optimal File Length

**Finding**: LLMs process the 100th token more reliably than the 10,000th token.

**Guideline**:
- **Maximum 300-400 lines** per file
- **Target 150-250 lines** for most files
- Split large files into submodules

### When to Split

```typescript
// ❌ BAD: 1000-line service file
// src/users/service.ts (1000 lines)
export class UserService {
  // 50 methods crammed into one file
}

// ✅ GOOD: Split by domain
// src/users/service.ts (150 lines)
export { UserQueryService } from './query';
export { UserCommandService } from './commands';
export { UserAuthService } from './auth';
```

---

## 10. Model Context Protocol (MCP) Integration

### AI-Native Tool Interface

**Standard**: [Model Context Protocol](https://modelcontextprotocol.io/) (Anthropic)

Expose your codebase operations as **structured tools**:

```typescript
// .mcp/server.ts
import { McpServer } from '@modelcontextprotocol/sdk';
import { z } from 'zod';

const server = new McpServer({
  name: 'my-project',
  version: '1.0.0',
});

// Expose build as tool
server.tool({
  name: 'build',
  description: 'Build the project with type checking and tests',
  inputSchema: z.object({
    mode: z.enum(['development', 'production']),
    skipTests: z.boolean().default(false),
  }),
  handler: async ({ mode, skipTests }) => {
    const result = await runBuild({ mode, skipTests });
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      errors: result.stderr,
    };
  },
});

// Expose module search as tool
server.tool({
  name: 'find_module',
  description: 'Find a module by name and get its dependencies',
  inputSchema: z.object({
    name: z.string(),
  }),
  handler: async ({ name }) => {
    const architecture = await readArchitectureJson();
    const module = architecture.modules[name];
    
    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }
    
    return {
      entry: module.entry,
      dependencies: module.dependencies,
      exports: module.exports,
    };
  },
});

server.start();
```

**Benefits**:
- **Schema-driven**: AI knows exactly what inputs are valid
- **Self-documenting**: Tool descriptions + schemas = complete API docs
- **Transport-agnostic**: Works with any MCP client

---

## Summary: Architecture Checklist

- [ ] `.ai/architecture.json` exists with module dependencies
- [ ] Modules follow bounded context pattern
- [ ] Three-layer architecture (interface → domain → infrastructure)
- [ ] Dependencies point downward only
- [ ] Each module has single entry point (`index.ts`)
- [ ] No hidden global state (explicit DI)
- [ ] Functions have ≤ 4 semantic depth
- [ ] Files are 150-400 lines
- [ ] Critical code at top/bottom 20% of files
- [ ] (Optional) MCP server exposes key operations

---

**📌 Key Insight**: Traditional software architecture optimizes for *human comprehension* (modularity, abstraction). AI-native architecture optimizes for *agent navigation* (graph structure, explicit dependencies, shallow nesting).
