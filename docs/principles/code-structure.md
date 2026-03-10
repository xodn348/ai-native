# Code Structure Principles for AI-Native Codebases

## Core Finding: Traditional Metrics Don't Apply

**Research**: "Rethinking Code Complexity" (Xie et al., 2026)

- **Cyclomatic complexity**: NO significant correlation with AI performance (after controlling for code length)
- **Modularity**: NO proven benefit for AI understanding (Kang et al., 2024)
- **Semantic depth**: **-0.73 to -0.95 correlation** with AI success

**Paradigm shift**: Optimize for semantic clarity, not human-centric abstractions.

---

## 1. Semantic Depth Over Cyclomatic Complexity

### The LM-CC Metric

**LM-CC** (LLM-perceived Code Complexity) measures **semantic compositional depth**, not branching paths.

**Impact**: Reducing LM-CC through semantics-preserving rewrites improved AI performance by **up to 20.9%**.

### Anti-Pattern: Deep Semantic Nesting

```python
# ❌ BAD: 6 levels of semantic nesting
def process_order(order_data):
    result = db.transaction(lambda tx:           # Level 1
        tx.orders.create({                       # Level 2
            'user_id': (lambda:                  # Level 3
                tx.users.find_one({              # Level 4
                    'email': order_data['email']
                        .strip()                 # Level 5
                        .lower()                 # Level 6
                })['id']
            )(),
            'items': [
                {**item, 'price': get_price(item['id'])}
                for item in order_data['items']
            ]
        })
    )
    return result
```

### Pattern: Flat Semantic Structure

```python
# ✅ GOOD: Maximum 3 levels
def process_order(order_data: OrderData) -> Order:
    normalized_email = normalize_email(order_data['email'])   # Level 1
    user = find_user_by_email(normalized_email)               # Level 1
    
    if not user:
        raise UserNotFoundError(normalized_email)             # Level 1
    
    items_with_prices = add_prices_to_items(order_data['items'])  # Level 1
    order = create_order(user['id'], items_with_prices)           # Level 1
    
    return order

# Each helper is independently understandable
def normalize_email(email: str) -> str:
    return email.strip().lower()

def find_user_by_email(email: str) -> Optional[User]:
    return db.users.find_one({'email': email})

def add_prices_to_items(items: List[OrderItem]) -> List[OrderItemWithPrice]:
    return [
        {**item, 'price': get_price(item['id'])}
        for item in items
    ]
```

**Guideline**: **Maximum 3-4 semantic levels** per function. Each level should represent a single conceptual operation.

---

## 2. Function Size & Single Responsibility

### Optimal Function Length

**Research**: Lita: Light Agent (arXiv:2509.25873)

**Finding**: Functions should be **20-50 lines** for best AI comprehension.

### Anti-Pattern: God Functions

```typescript
// ❌ BAD: 300-line function doing everything
async function handleUserSignup(data: any) {
  // Validation (30 lines)
  // Password hashing (20 lines)
  // Database insertion (40 lines)
  // Email sending (50 lines)
  // Logging (20 lines)
  // Analytics tracking (30 lines)
  // Welcome gift creation (40 lines)
  // Notification setup (30 lines)
  // Session creation (40 lines)
  return user;
}
```

### Pattern: Single-Purpose Functions

```typescript
// ✅ GOOD: Each function has one job
async function handleUserSignup(data: SignupInput): Promise<User> {
  const validated = validateSignupInput(data);
  const user = await createUserAccount(validated);
  await sendWelcomeEmail(user);
  await trackSignupEvent(user);
  return user;
}

function validateSignupInput(data: SignupInput): ValidatedSignupData {
  const schema = SignupInputSchema;
  return schema.parse(data);  // Throws if invalid
}

async function createUserAccount(data: ValidatedSignupData): Promise<User> {
  const passwordHash = await hashPassword(data.password);
  const user = await db.users.create({
    email: data.email,
    passwordHash,
    createdAt: new Date(),
  });
  return user;
}

async function sendWelcomeEmail(user: User): Promise<void> {
  await emailService.send({
    to: user.email,
    template: 'welcome',
    data: { name: user.name },
  });
}
```

**Guideline**:
- **Target: 20-30 lines** per function
- **Maximum: 50 lines** (split if longer)
- **One conceptual operation** per function

---

## 3. Explicit State Management

### Anti-Pattern: Implicit State Mutations

```javascript
// ❌ BAD: Hidden state mutations
let totalPrice = 0;  // Shared mutable state

function addToCart(item) {
  totalPrice += item.price;  // Side effect
  cart.push(item);           // Another side effect
  updateUI();                // Yet another side effect
}

function applyDiscount(percent) {
  totalPrice *= (1 - percent / 100);  // Mutates global
}
```

### Pattern: Explicit State Transformations

```typescript
// ✅ GOOD: Pure functions with explicit returns
interface CartState {
  items: CartItem[];
  totalPrice: number;
}

function addToCart(state: CartState, item: CartItem): CartState {
  return {
    items: [...state.items, item],
    totalPrice: state.totalPrice + item.price,
  };
}

function applyDiscount(state: CartState, percent: number): CartState {
  return {
    ...state,
    totalPrice: state.totalPrice * (1 - percent / 100),
  };
}

// Usage makes state flow explicit
let cart = { items: [], totalPrice: 0 };
cart = addToCart(cart, newItem);
cart = applyDiscount(cart, 10);
```

**Benefits**:
- AI agents can **trace state flow** without hidden side effects
- **Deterministic** behavior (same input → same output)
- **Easier to test** (no setup/teardown of global state)

---

## 4. Type-Driven Development

### Pattern: Types as Contracts

```typescript
// Define types BEFORE implementation
export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: number, data: UpdateUserInput): Promise<User>;
  delete(id: number): Promise<void>;
}

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export type CreateUserInput = Pick<User, 'email' | 'name'> & {
  password: string;
  role?: UserRole;
};

export type UpdateUserInput = Partial<Pick<User, 'email' | 'name' | 'role'>>;
```

**Benefits**:
- AI agents know **exact contracts** before seeing implementation
- **Type errors caught at compile time** (not runtime)
- **Self-documenting** (types explain intent)

---

## 5. Guard Clauses Over Nested Ifs

### Anti-Pattern: Deeply Nested Conditionals

```typescript
// ❌ BAD: Deep nesting
function processPayment(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.totalAmount > 0) {
        if (order.paymentMethod) {
          if (order.paymentMethod.isValid()) {
            // Actual logic buried 5 levels deep
            return chargePayment(order);
          } else {
            throw new Error('Invalid payment method');
          }
        } else {
          throw new Error('No payment method');
        }
      } else {
        throw new Error('Invalid amount');
      }
    } else {
      throw new Error('No items');
    }
  } else {
    throw new Error('No order');
  }
}
```

### Pattern: Early Returns with Guard Clauses

```typescript
// ✅ GOOD: Flat structure with early returns
function processPayment(order: Order): PaymentResult {
  // Guard clauses at top
  if (!order) {
    throw new InvalidOrderError('Order is required');
  }
  
  if (order.items.length === 0) {
    throw new InvalidOrderError('Order must have items');
  }
  
  if (order.totalAmount <= 0) {
    throw new InvalidOrderError(`Invalid amount: ${order.totalAmount}`);
  }
  
  if (!order.paymentMethod) {
    throw new MissingPaymentMethodError('Payment method is required');
  }
  
  if (!order.paymentMethod.isValid()) {
    throw new InvalidPaymentMethodError('Payment method is invalid');
  }
  
  // Happy path at end (not buried)
  return chargePayment(order);
}
```

**Benefits**:
- **Flat semantic structure** (max 2 levels)
- **Happy path at end** (not buried in nesting)
- **Explicit error conditions** (AI knows all failure modes)

---

## 6. Named Constants Over Magic Numbers

### Anti-Pattern: Magic Numbers

```typescript
// ❌ BAD: What do these numbers mean?
function processOrder(order: Order) {
  if (order.totalAmount > 1000) {
    applyFreeShipping(order);
  }
  
  if (order.items.length > 50) {
    throw new Error('Too many items');
  }
  
  const discount = order.totalAmount * 0.15;
  
  setTimeout(() => cancelOrder(order), 86400000);
}
```

### Pattern: Named Constants

```typescript
// ✅ GOOD: Self-documenting constants
const FREE_SHIPPING_THRESHOLD = 1000;  // dollars
const MAX_ITEMS_PER_ORDER = 50;
const VIP_DISCOUNT_RATE = 0.15;  // 15%
const ORDER_CANCELLATION_DELAY = 24 * 60 * 60 * 1000;  // 24 hours in ms

function processOrder(order: Order): void {
  if (order.totalAmount >= FREE_SHIPPING_THRESHOLD) {
    applyFreeShipping(order);
  }
  
  if (order.items.length > MAX_ITEMS_PER_ORDER) {
    throw new TooManyItemsError(MAX_ITEMS_PER_ORDER);
  }
  
  const discount = order.totalAmount * VIP_DISCOUNT_RATE;
  
  setTimeout(() => cancelOrder(order), ORDER_CANCELLATION_DELAY);
}
```

**Guideline**: Any number that isn't `0`, `1`, or `-1` should be a named constant.

---

## 7. Explicit Error Types

### Anti-Pattern: Generic Error Throwing

```typescript
// ❌ BAD: Undifferentiated errors
function getUser(id: number) {
  if (id <= 0) {
    throw new Error('Invalid ID');
  }
  
  const user = db.users.find(id);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

// Caller has no way to distinguish error types
try {
  const user = getUser(-1);
} catch (e) {
  // Is this "invalid ID" or "not found"?
  console.error(e.message);
}
```

### Pattern: Typed Error Hierarchy

```typescript
// ✅ GOOD: Explicit error types
class UserError extends Error {
  code: string;
  retryable: boolean;
}

class InvalidUserIdError extends UserError {
  constructor(id: number) {
    super(`Invalid user ID: ${id}`);
    this.code = 'INVALID_USER_ID';
    this.retryable = false;
  }
}

class UserNotFoundError extends UserError {
  constructor(id: number) {
    super(`User not found: ${id}`);
    this.code = 'USER_NOT_FOUND';
    this.retryable = false;
  }
}

class DatabaseConnectionError extends UserError {
  constructor(cause: Error) {
    super('Database connection failed');
    this.code = 'DB_CONNECTION_ERROR';
    this.retryable = true;
    this.cause = cause;
  }
}

function getUser(id: number): User {
  if (id <= 0) {
    throw new InvalidUserIdError(id);
  }
  
  try {
    const user = db.users.find(id);
    
    if (!user) {
      throw new UserNotFoundError(id);
    }
    
    return user;
  } catch (e) {
    if (e instanceof DatabaseConnectionError) {
      throw e;
    }
    throw new DatabaseConnectionError(e as Error);
  }
}

// Caller can handle errors categorically
try {
  const user = getUser(userId);
} catch (e) {
  if (e instanceof InvalidUserIdError) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  if (e instanceof UserNotFoundError) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (e instanceof DatabaseConnectionError && e.retryable) {
    return retry(() => getUser(userId));
  }
  
  throw e;  // Unknown error, propagate
}
```

**Benefits**:
- AI agents learn **error taxonomy** (not just error messages)
- **Categorical error handling** (retry vs fail vs log)
- **Type-safe error checks** (instanceof, not string matching)

---

## 8. Avoid Clever Code

### Anti-Pattern: "Smart" One-Liners

```typescript
// ❌ BAD: Clever but opaque
const result = items.reduce((acc, item) => ({
  ...acc,
  [item.category]: [...(acc[item.category] || []), item]
}), {} as Record<string, Item[]>);

// What does this do? AI has to reverse-engineer it.
```

### Pattern: Explicit Step-by-Step

```typescript
// ✅ GOOD: Obvious intent
function groupItemsByCategory(items: Item[]): Record<string, Item[]> {
  const grouped: Record<string, Item[]> = {};
  
  for (const item of items) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  }
  
  return grouped;
}

// Or use a helper with a descriptive name
const grouped = _.groupBy(items, item => item.category);
```

**Guideline**: If a one-liner requires a comment to explain it, break it into multiple lines with descriptive names.

---

## 9. Composition Over Inheritance

### Anti-Pattern: Deep Inheritance Hierarchies

```typescript
// ❌ BAD: 5-level inheritance
class Entity { }
class User extends Entity { }
class Customer extends User { }
class PremiumCustomer extends Customer { }
class EnterpriseCustomer extends PremiumCustomer { }

// AI agent has to traverse entire hierarchy to understand behavior
```

### Pattern: Composition with Interfaces

```typescript
// ✅ GOOD: Flat structure with composition
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User extends Entity {
  email: string;
  name: string;
}

interface CustomerFeatures {
  tier: 'free' | 'premium' | 'enterprise';
  subscriptionId: string;
  billingAddress: Address;
}

interface EnterpriseFeatures {
  accountManager: string;
  customContract: boolean;
  ssoEnabled: boolean;
}

// Compose features as needed
type PremiumCustomer = User & CustomerFeatures;
type EnterpriseCustomer = User & CustomerFeatures & EnterpriseFeatures;
```

**Benefits**:
- **Flat type hierarchy** (no deep traversal)
- **Explicit feature sets** (know exactly what's included)
- **Flexible composition** (mix and match as needed)

---

## 10. Immutability by Default

### Anti-Pattern: Mutable Data Structures

```typescript
// ❌ BAD: Mutations everywhere
function processOrder(order: Order) {
  order.status = 'processing';  // Mutation
  order.items.forEach(item => {
    item.price = calculatePrice(item);  // More mutation
  });
  order.totalAmount = order.items.reduce((sum, item) => sum + item.price, 0);
  return order;  // Modified in place
}
```

### Pattern: Immutable Transformations

```typescript
// ✅ GOOD: Pure transformations
function processOrder(order: Order): ProcessedOrder {
  const itemsWithPrices = order.items.map(item => ({
    ...item,
    price: calculatePrice(item),
  }));
  
  const totalAmount = itemsWithPrices.reduce((sum, item) => sum + item.price, 0);
  
  return {
    ...order,
    status: 'processing',
    items: itemsWithPrices,
    totalAmount,
  };
}
```

**Benefits**:
- **Predictable behavior** (no hidden mutations)
- **Easier debugging** (state doesn't change unexpectedly)
- **Safer concurrency** (no race conditions from shared mutable state)

---

## Summary: Code Structure Checklist

- [ ] Functions have ≤ 4 semantic depth
- [ ] Functions are 20-50 lines (target 30)
- [ ] Each function has single responsibility
- [ ] State transformations are explicit (pure functions)
- [ ] Types defined before implementation
- [ ] Guard clauses instead of nested ifs
- [ ] Named constants for magic numbers
- [ ] Typed error hierarchy (not generic Error)
- [ ] Clear, explicit code over clever one-liners
- [ ] Composition over inheritance
- [ ] Immutability by default

---

**📌 Key Insight**: AI agents struggle with the same things humans do (deep nesting, hidden side effects, clever code), but they struggle **more**. Optimize for clarity, not cleverness.
