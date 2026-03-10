# Function Design for AI-Native Codebases

How to structure functions for maximum AI agent comprehension and effectiveness.

---

## Core Finding: Semantic Depth > Cyclomatic Complexity

**Research**: "Rethinking Code Complexity for LLMs" (Xie et al., 2026)

**Breakthrough Discovery**: After controlling for code length, **cyclomatic complexity shows NO significant correlation** with LLM performance.

- Zero-order correlation: -0.78
- **Partial correlation (length-controlled): non-significant**

**New Metric**: **LM-CC (LLM-perceived Code Complexity)**
- Measures **semantic compositional depth**, not branching paths
- Correlation with AI success: **-0.73 to -0.95**
- Reducing LM-CC improved performance by **up to 20.9%**

**Implication**: Traditional "good code" metrics (cyclomatic complexity, modularity) don't apply to AI agents.

---

## 1. Function Size: 20-50 Lines

**Research**: Lita: Light Agent (arXiv:2509.25873)

**Finding**: Functions should be **20-50 lines** for optimal AI comprehension.

**Guideline**:
- **Target: 30 lines**
- **Maximum: 50 lines** (split if longer)
- **Minimum: 5 lines** (consider inlining if shorter)

### Anti-Pattern: God Functions

```typescript
// ❌ BAD: 150-line function doing everything
async function handleCheckout(cartId: string, userId: string) {
  // 20 lines: Validate cart
  // 30 lines: Calculate total with discounts
  // 25 lines: Process payment
  // 30 lines: Create order records
  // 20 lines: Send confirmation email
  // 15 lines: Update inventory
  // 10 lines: Generate analytics events
  return order;
}
```

### Pattern: Single-Purpose Functions

```typescript
// ✅ GOOD: Each function has one job (20-40 lines each)
async function handleCheckout(
  cartId: string,
  userId: string
): Promise<Order> {
  const validatedCart = await validateCart(cartId, userId);
  const orderTotal = calculateOrderTotal(validatedCart);
  const payment = await processPayment(orderTotal, userId);
  const order = await createOrder(validatedCart, payment);
  await Promise.all([
    sendOrderConfirmation(order),
    updateInventory(order.items),
    trackCheckoutEvent(order),
  ]);
  return order;
}

// Each helper is independently understandable
async function validateCart(
  cartId: string,
  userId: string
): Promise<ValidatedCart> {
  const cart = await db.carts.findOne({ id: cartId });
  
  if (!cart) {
    throw new CartNotFoundError(cartId);
  }
  
  if (cart.userId !== userId) {
    throw new UnauthorizedError('Cart belongs to different user');
  }
  
  if (cart.items.length === 0) {
    throw new EmptyCartError(cartId);
  }
  
  // Validate item availability
  const unavailableItems = await checkItemAvailability(cart.items);
  if (unavailableItems.length > 0) {
    throw new UnavailableItemsError(unavailableItems);
  }
  
  return cart as ValidatedCart;
}
```

---

## 2. Semantic Depth: Maximum 4 Levels

**Critical**: Semantic depth is NOT the same as nesting depth or cyclomatic complexity.

**Semantic Level**: Each conceptual operation that requires understanding previous operation's result.

### Anti-Pattern: Deep Semantic Nesting

```typescript
// ❌ BAD: 6 levels of semantic nesting
async function processOrder(orderData) {
  return await db.transaction(async (tx) => {              // Level 1
    const user = await tx.users.findOne({                  // Level 2
      where: {
        email: orderData.email                             // Level 3
          .trim()                                          // Level 4
          .toLowerCase()                                   // Level 5
          .replace(/\+.*@/, '@')                           // Level 6
      }
    });
    
    if (!user) {                                           // Level 2
      const validatedEmail = validateEmail(                // Level 3
        parseEmailFormat(                                  // Level 4
          normalizeEmailString(orderData.email)            // Level 5
        )
      );
      // More nesting...
    }
  });
}
```

### Pattern: Flat Semantic Structure

```typescript
// ✅ GOOD: Maximum 3 levels
async function processOrder(orderData: OrderInput): Promise<Order> {
  const normalizedEmail = normalizeEmailForLookup(orderData.email);  // Level 1
  const user = await findUserByEmail(normalizedEmail);                // Level 1
  
  if (!user) {
    const validatedEmail = validateEmailFormat(normalizedEmail);      // Level 1
    throw new UserNotFoundError(validatedEmail);                      // Level 1
  }
  
  const orderItems = prepareOrderItems(orderData.items, user);        // Level 1
  const order = await saveOrder(user.id, orderItems);                 // Level 1
  
  return order;
}

// Each helper is one semantic level
function normalizeEmailForLookup(email: string): string {
  return email.trim().toLowerCase().replace(/\+.*@/, '@');
}

async function findUserByEmail(email: string): Promise<User | null> {
  return db.users.findOne({ where: { email } });
}

function validateEmailFormat(email: string): string {
  const schema = z.string().email();
  return schema.parse(email);
}
```

**Counting Semantic Levels**:
```typescript
// Example: How many semantic levels?
const result = transform(                    // Level 1: Transform takes raw input
  validate(                                  // Level 2: Validate needs transform result
    parse(                                   // Level 3: Parse needs validate result
      input                                  // Level 0: Input is given
    )
  )
);

// This is 3 semantic levels (each depends on previous)
```

---

## 3. Single Responsibility Principle

### Anti-Pattern: Multiple Responsibilities

```typescript
// ❌ BAD: Function does validation + transformation + side effects
async function saveUser(userData: any) {
  // Responsibility 1: Validation
  if (!userData.email || !userData.name) {
    throw new Error('Missing required fields');
  }
  
  // Responsibility 2: Transformation
  const normalizedData = {
    email: userData.email.toLowerCase(),
    name: userData.name.trim(),
    age: parseInt(userData.age),
  };
  
  // Responsibility 3: Database operation
  const user = await db.users.create(normalizedData);
  
  // Responsibility 4: Side effects
  await sendWelcomeEmail(user.email);
  await trackSignupEvent(user.id);
  
  // Responsibility 5: Response formatting
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
```

### Pattern: Single Purpose per Function

```typescript
// ✅ GOOD: Each function has one responsibility
function validateUserInput(input: unknown): ValidatedUserInput {
  return UserInputSchema.parse(input);  // Only validation
}

function normalizeUserData(input: ValidatedUserInput): NormalizedUser {
  return {  // Only transformation
    email: input.email.toLowerCase(),
    name: input.name.trim(),
    age: input.age,
  };
}

async function createUserRecord(data: NormalizedUser): Promise<User> {
  return db.users.create(data);  // Only database operation
}

async function triggerUserOnboarding(user: User): Promise<void> {
  await Promise.all([  // Only side effects
    sendWelcomeEmail(user.email),
    trackSignupEvent(user.id),
  ]);
}

function formatUserResponse(user: User): UserResponse {
  return {  // Only response formatting
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

// Orchestrator composes single-purpose functions
async function registerUser(input: unknown): Promise<UserResponse> {
  const validated = validateUserInput(input);
  const normalized = normalizeUserData(validated);
  const user = await createUserRecord(normalized);
  await triggerUserOnboarding(user);
  return formatUserResponse(user);
}
```

---

## 4. Guard Clauses: Fail Fast

### Anti-Pattern: Deeply Nested Ifs

```typescript
// ❌ BAD: Happy path buried 5 levels deep
function processPayment(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.amount > 0) {
        if (order.paymentMethod) {
          if (order.paymentMethod.isValid()) {
            // Happy path buried here
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

### Pattern: Guard Clauses with Early Returns

```typescript
// ✅ GOOD: Happy path at end, max 2 nesting levels
function processPayment(order: Order): PaymentResult {
  // Guard clauses at top (flat)
  if (!order) {
    throw new InvalidOrderError('Order is required');
  }
  
  if (order.items.length === 0) {
    throw new InvalidOrderError('Order must have items');
  }
  
  if (order.amount <= 0) {
    throw new InvalidOrderError(`Invalid amount: ${order.amount}`);
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

---

## 5. Parameter Count: Maximum 4

**Guideline**: If function needs > 4 parameters, use a parameter object.

### Anti-Pattern: Parameter Explosion

```typescript
// ❌ BAD: 8 parameters
function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  age: number,
  street: string,
  city: string,
  country: string
) {
  // ...
}

// Usage is error-prone
createUser(
  'user@example.com',
  'password123',
  'John',
  'Doe',
  30,
  '123 Main St',  // Easy to mix up order
  'Springfield',
  'USA'
);
```

### Pattern: Parameter Objects

```typescript
// ✅ GOOD: Single parameter object
interface CreateUserInput {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    age: number;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
}

function createUser(input: CreateUserInput): User {
  // ...
}

// Usage is self-documenting
createUser({
  email: 'user@example.com',
  password: 'password123',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
  },
  address: {
    street: '123 Main St',
    city: 'Springfield',
    country: 'USA',
  },
});
```

---

## 6. Pure Functions: Prefer Immutability

### Anti-Pattern: Hidden Mutations

```typescript
// ❌ BAD: Function mutates input
function applyDiscount(order: Order, percent: number) {
  order.total *= (1 - percent / 100);  // Mutation
  order.discountApplied = true;         // Mutation
  return order;
}

// Caller doesn't expect mutation
const order = { total: 100, discountApplied: false };
const discountedOrder = applyDiscount(order, 10);
console.log(order.total);  // 90 (unexpected!)
```

### Pattern: Pure Functions

```typescript
// ✅ GOOD: Pure function returns new object
function applyDiscount(order: Order, percent: number): Order {
  return {
    ...order,
    total: order.total * (1 - percent / 100),
    discountApplied: true,
  };
}

// Caller's original object unchanged
const order = { total: 100, discountApplied: false };
const discountedOrder = applyDiscount(order, 10);
console.log(order.total);  // 100 (original unchanged)
console.log(discountedOrder.total);  // 90 (new object)
```

---

## 7. Function Naming: Action + Subject

### Pattern: Verb + Noun

```typescript
// ✅ GOOD: Clear action and subject
function getUser(id: number): User { }
function createOrder(input: OrderInput): Order { }
function validateEmail(email: string): boolean { }
function calculateTotal(items: Item[]): number { }
function formatDate(date: Date): string { }

// Return type indicates query vs command
function getUserById(id: number): User { }         // Query (no side effects)
async function saveUser(user: User): Promise<void> { }  // Command (side effects)
```

**Naming conventions**:
- `get` - Synchronous retrieval (may be cached)
- `fetch` - Asynchronous retrieval (from external source)
- `find` - Search operation (may return null)
- `create` - Create new entity
- `update` - Modify existing entity
- `delete` - Remove entity
- `save` - Persist to storage
- `load` - Load from storage
- `calculate` - Compute value
- `validate` - Check validity
- `format` - Transform representation
- `parse` - Convert from string

---

## 8. Early Returns: Reduce Nesting

### Anti-Pattern: Deep Nesting with Else Blocks

```typescript
// ❌ BAD: Deep nesting
function getDiscount(user: User): number {
  if (user.isPremium) {
    if (user.orders.length > 10) {
      return 0.20;
    } else {
      return 0.10;
    }
  } else {
    if (user.orders.length > 10) {
      return 0.10;
    } else {
      return 0.05;
    }
  }
}
```

### Pattern: Early Returns

```typescript
// ✅ GOOD: Flat structure with early returns
function getDiscount(user: User): number {
  if (user.isPremium && user.orders.length > 10) {
    return 0.20;
  }
  
  if (user.isPremium) {
    return 0.10;
  }
  
  if (user.orders.length > 10) {
    return 0.10;
  }
  
  return 0.05;
}
```

---

## 9. Avoid Clever Code: Explicit > Implicit

### Anti-Pattern: "Smart" One-Liners

```typescript
// ❌ BAD: Clever but opaque
const grouped = items.reduce((acc, item) => ({
  ...acc,
  [item.category]: [...(acc[item.category] || []), item]
}), {} as Record<string, Item[]>);
```

### Pattern: Explicit Steps

```typescript
// ✅ GOOD: Explicit and understandable
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

// Or use descriptive helper
const grouped = _.groupBy(items, item => item.category);
```

---

## 10. Composition Over Loops

### Anti-Pattern: Imperative Loops

```typescript
// ❌ BAD: Manual loop logic
function getActiveUserEmails(users: User[]): string[] {
  const emails: string[] = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].isActive) {
      emails.push(users[i].email);
    }
  }
  return emails;
}
```

### Pattern: Functional Composition

```typescript
// ✅ GOOD: Declarative pipeline
function getActiveUserEmails(users: User[]): string[] {
  return users
    .filter(user => user.isActive)
    .map(user => user.email);
}

// More complex example
function calculateOrderTotals(orders: Order[]): number[] {
  return orders
    .filter(order => order.status === 'completed')
    .map(order => order.items)
    .flat()
    .map(item => item.price * item.quantity)
    .reduce((totals, price) => [...totals, price], []);
}
```

---

## Summary: Function Design Checklist

- [ ] Functions are 20-50 lines (target 30)
- [ ] Semantic depth ≤ 4 levels
- [ ] Single responsibility per function
- [ ] Guard clauses for validation (fail fast)
- [ ] Maximum 4 parameters (use objects for more)
- [ ] Pure functions (no hidden mutations)
- [ ] Clear naming (verb + noun)
- [ ] Early returns (reduce nesting)
- [ ] Explicit code (no clever one-liners)
- [ ] Functional composition over loops
- [ ] One conceptual operation per function
- [ ] Happy path at end (not buried)

---

**📌 Key Insight**: Traditional complexity metrics (cyclomatic complexity, modularity) don't correlate with AI performance. **Semantic depth** is what matters — each function should be a flat sequence of single-level operations, not nested conceptual hierarchies.

---

**References**:
- Xie et al. (2026): "Rethinking Code Complexity for LLMs" - LM-CC metric
- Lita: Light Agent (arXiv:2509.25873) - Optimal function length
- Kang et al. (2024): "Revisiting Modularity for Code Generation"
