# Naming Conventions for AI-Native Codebases

How to name variables, functions, and types for maximum AI agent comprehension.

---

## Core Finding: Descriptive > Concise

**Research**: Yakubov (2025) - Controlled study with 500 Python examples, 7 naming schemes, 8 models (0.5B-8B parameters)

**Quantitative Results**:

| Naming Style | Semantic Similarity | vs Baseline |
|--------------|---------------------|-------------|
| **Descriptive** | **0.874** | **+9%** |
| Original | 0.850 | Baseline |
| snake_case | 0.845 | -0.6% |
| PascalCase | 0.840 | -1.2% |
| Minimal | 0.820 | -3.5% |
| **Obfuscated** | **0.802** | **-6%** |

**Key Finding**: Despite requiring more tokens, **descriptive names consistently outperform** across all model sizes (r=0.945 correlation between syntactic and semantic metrics).

**Implication**: Token cost is less important than semantic clarity for AI agents.

---

## 1. Variables: Answer Three Questions

Every variable name should answer:
1. **What** does it contain?
2. **Why** does it exist?
3. **When** is it valid?

### Anti-Pattern: Type-Only Names

```typescript
// ❌ BAD: Name only describes type, not content
const string = getUserEmail();
const number = calculateAge();
const array = getResults();
const data = fetchUser();
const obj = parseConfig();
```

### Pattern: Semantic Names

```typescript
// ✅ GOOD: Name describes what, why, and when
const userEmail = getUserEmail();
const currentUserAge = calculateAge();
const searchResults = getResults();
const authenticatedUser = fetchUser();
const validatedConfig = parseConfig();
```

---

## 2. Boolean Variables: Predicates

### Anti-Pattern: Noun-Based Booleans

```typescript
// ❌ BAD: Unclear what true/false means
const admin = checkPermissions();
const email = validateEmail(input);
const cache = shouldUseCache();
```

### Pattern: Predicate-Based Names

```typescript
// ✅ GOOD: Clear what true/false represents
const isAdmin = checkPermissions();
const hasValidEmail = validateEmail(input);
const shouldUseCache = checkCachePolicy();

// Alternative patterns
const canEdit = checkEditPermission();
const hasAccess = verifyAccess();
const wasSuccessful = executeTask();
```

**Prefixes for booleans**:
- `is` - State or property (isActive, isValid, isEmpty)
- `has` - Possession (hasPermission, hasError, hasChildren)
- `can` - Capability (canEdit, canDelete, canAccess)
- `should` - Recommendation (shouldRetry, shouldCache, shouldValidate)
- `was` - Past state (wasSuccessful, wasFound, wasModified)

---

## 3. Functions: Verb + Noun

### Anti-Pattern: Unclear Action

```typescript
// ❌ BAD: What does this function do?
function user(id: number) { }
function data() { }
function process(input: any) { }
function handle(event: Event) { }
```

### Pattern: Action + Subject

```typescript
// ✅ GOOD: Clear action and subject
function getUser(id: number): User { }
function fetchUserData(): UserData { }
function processPayment(input: PaymentInput): PaymentResult { }
function handleClickEvent(event: ClickEvent): void { }

// Alternative patterns
function createOrder(data: OrderInput): Order { }
function validateEmail(email: string): boolean { }
function calculateTotal(items: CartItem[]): number { }
function formatDate(date: Date): string { }
```

**Common verb prefixes**:
- `get` - Retrieve data (synchronous, may be cached)
- `fetch` - Retrieve data (asynchronous, from external source)
- `create` - Create new entity
- `update` - Modify existing entity
- `delete` - Remove entity
- `validate` - Check validity
- `calculate` - Compute value
- `format` - Transform representation
- `parse` - Convert from string/raw format
- `serialize` - Convert to string/raw format

---

## 4. Constants: Context + Value

### Anti-Pattern: Magic Values

```typescript
// ❌ BAD: What do these numbers mean?
const LIMIT = 100;
const TIMEOUT = 5000;
const RATE = 0.08;
```

### Pattern: Semantic Constants

```typescript
// ✅ GOOD: Name explains context and unit
const MAX_ITEMS_PER_PAGE = 100;
const API_REQUEST_TIMEOUT_MS = 5000;
const SALES_TAX_RATE = 0.08;  // 8% tax

// With units in name
const SESSION_DURATION_SECONDS = 3600;  // 1 hour
const FILE_SIZE_LIMIT_BYTES = 5_242_880;  // 5 MB
const RETRY_DELAY_MS = 1000;  // 1 second

// With business context
const FREE_SHIPPING_THRESHOLD_CENTS = 5000;  // $50.00
const PASSWORD_MIN_LENGTH = 8;
const RATE_LIMIT_REQUESTS_PER_MINUTE = 60;
```

**Rule**: Any number that isn't `0`, `1`, or `-1` should be a named constant.

---

## 5. Types & Interfaces: Domain Language

### Anti-Pattern: Generic Technical Names

```typescript
// ❌ BAD: Technical jargon, not domain language
interface Data {
  props: Record<string, any>;
  meta: object;
}

type Response = {
  result: unknown;
  status: number;
};

class Handler { }
class Manager { }
class Service { }
```

### Pattern: Domain-Driven Names

```typescript
// ✅ GOOD: Uses ubiquitous language from domain
interface Product {
  sku: string;
  price: Money;
  inventory: InventoryLevel;
}

type OrderResult = {
  order: Order;
  confirmation: OrderConfirmation;
};

class PaymentProcessor { }
class InventoryManager { }
class EmailNotificationService { }
```

**Guidelines**:
- Use terms from business domain
- Match language stakeholders use
- Avoid generic suffixes unless meaningful (Handler, Manager, Service)
- Prefer specific nouns (PaymentProcessor > PaymentHandler)

---

## 6. Abbreviations: Industry-Standard Only

### Anti-Pattern: Custom Abbreviations

```typescript
// ❌ BAD: Non-standard abbreviations
const usrCfg = getUserConfiguration();
const authTkn = generateAuthToken();
const tmpData = processTemporaryData();
const errMsg = getErrorMessage();
```

### Pattern: Full Words or Standard Abbreviations

```typescript
// ✅ GOOD: Full words
const userConfiguration = getUserConfiguration();
const authenticationToken = generateAuthToken();
const temporaryData = processTemporaryData();
const errorMessage = getErrorMessage();

// ✅ ACCEPTABLE: Industry-standard abbreviations
const userId = getUserId();        // id, uid
const apiKey = getApiKey();        // api
const htmlContent = getHtml();     // html, css, js, sql
const urlPath = getUrl();          // url, uri
const jsonData = parseJson();      // json, xml, yaml
const httpRequest = makeHttp();    // http, https, ftp
```

**Acceptable abbreviations** (recognized industry-wide):
- `id`, `uid` - Identifier
- `url`, `uri` - Uniform Resource Locator/Identifier
- `api` - Application Programming Interface
- `html`, `css`, `js` - Web technologies
- `json`, `xml`, `yaml` - Data formats
- `http`, `https`, `ftp` - Protocols
- `sql` - Structured Query Language
- `ui`, `ux` - User Interface/Experience
- `db` - Database (in limited contexts)

---

## 7. Temporal Context: State vs Action

### Anti-Pattern: Ambiguous Timing

```typescript
// ❌ BAD: When is this from/for?
const date = new Date();
const data = fetchData();
const user = getUser();
```

### Pattern: Explicit Temporal Context

```typescript
// ✅ GOOD: Clear when this represents
const currentTimestamp = new Date();
const previousLoginDate = user.lastLoginAt;
const scheduledPublishDate = post.publishAt;

const cachedData = getCachedData();
const freshData = fetchFreshData();
const staleData = getExpiredData();

const authenticatedUser = getCurrentUser();
const targetUser = getUserById(id);
const originalUser = user.clone();
```

---

## 8. Scope Indicators: Visibility in Name

### Anti-Pattern: Unclear Scope

```typescript
// ❌ BAD: Is this local, global, or parameter?
function process(data) {
  const result = transform(data);
  const value = calculate(result);
  return value;
}
```

### Pattern: Scope-Appropriate Specificity

```typescript
// ✅ GOOD: Specificity matches scope
function processOrder(orderInput: OrderInput): ProcessedOrder {
  // Scoped to function - can be brief but clear
  const validatedOrder = validateOrderInput(orderInput);
  const calculatedTotal = calculateOrderTotal(validatedOrder);
  return createProcessedOrder(calculatedTotal);
}

// Global/module scope - be more descriptive
const APPLICATION_CONFIG = loadConfig();
const SHARED_DATABASE_CONNECTION = connectToDatabase();
```

**Rule**: The wider the scope, the more descriptive the name.

---

## 9. Collections: Plural Nouns

### Anti-Pattern: Singular for Collections

```typescript
// ❌ BAD: Singular name for array/collection
const user = getAllUsers();
const item = cart.getItem();
const result = queryDatabase();
```

### Pattern: Plural Names

```typescript
// ✅ GOOD: Plural indicates collection
const users = getAllUsers();
const items = cart.getItems();
const results = queryDatabase();

// Explicit collection types
const userList = getUserList();
const itemSet = new Set(items);
const userMap = new Map(users.map(u => [u.id, u]));

// Count variables
const userCount = users.length;
const totalItems = items.length;
```

---

## 10. Context Objects: Group Related Data

### Anti-Pattern: Parameter Explosion

```typescript
// ❌ BAD: Too many parameters, unclear relationship
function createUser(
  name: string,
  email: string,
  age: number,
  street: string,
  city: string,
  state: string,
  zip: string
) { }
```

### Pattern: Contextual Grouping

```typescript
// ✅ GOOD: Related parameters grouped
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface CreateUserInput {
  name: string;
  email: string;
  age: number;
  address: Address;
}

function createUser(input: CreateUserInput): User { }

// Usage is self-documenting
const newUser = createUser({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
  },
});
```

---

## 11. Error Variables: Descriptive, Not Generic

### Anti-Pattern: Generic Error Names

```typescript
// ❌ BAD: What kind of error?
try {
  await processPayment();
} catch (e) {
  console.error(e);
}

try {
  await fetchData();
} catch (error) {
  throw error;
}
```

### Pattern: Specific Error Names

```typescript
// ✅ GOOD: Error name indicates source
try {
  await processPayment(order);
} catch (paymentError) {
  logger.error('Payment processing failed', { paymentError, orderId: order.id });
  throw new PaymentProcessingError('Failed to charge card', { cause: paymentError });
}

try {
  const userData = await fetchUserData(userId);
} catch (fetchError) {
  if (fetchError instanceof NetworkError) {
    return retry(() => fetchUserData(userId));
  }
  throw fetchError;
}
```

---

## 12. Single-Letter Variables: Only for Loops

### Anti-Pattern: Single Letters Everywhere

```typescript
// ❌ BAD: What are a, b, c?
function calc(a: number, b: number): number {
  const c = a + b;
  return c * 2;
}

const u = getUser();
const d = new Date();
```

### Pattern: Descriptive Names

```typescript
// ✅ GOOD: Descriptive names
function calculateDiscountedTotal(
  originalPrice: number,
  discountRate: number
): number {
  const discountedPrice = originalPrice * (1 - discountRate);
  return discountedPrice * TAX_MULTIPLIER;
}

const authenticatedUser = getUser();
const currentTimestamp = new Date();

// ✅ ACCEPTABLE: Single letters in short loops
for (let i = 0; i < items.length; i++) {
  processItem(items[i]);
}

items.map((item, index) => ({ ...item, order: index }));
```

**Acceptable single-letter names**:
- `i`, `j`, `k` - Loop indices (short loops only)
- `x`, `y`, `z` - Coordinates
- `n` - Count (in mathematical contexts)
- `t` - Time/timestamp (in mathematical contexts)

---

## Summary: Naming Checklist

- [ ] Variables answer: what, why, when
- [ ] Booleans use predicates (is, has, can, should, was)
- [ ] Functions use verb + noun
- [ ] Constants explain context and unit
- [ ] Types use domain language (not technical jargon)
- [ ] Abbreviations are industry-standard only
- [ ] Temporal context is explicit (current, previous, cached, fresh)
- [ ] Scope matches specificity (wider scope = more descriptive)
- [ ] Collections use plural nouns
- [ ] Related data grouped in context objects
- [ ] Error variables are specific (not generic `e` or `error`)
- [ ] Single letters only in short loops

---

**📌 Key Insight**: For humans, concise names save typing. For AI agents, descriptive names are the primary data source for understanding intent. The +9% semantic similarity improvement from descriptive naming is worth the token cost.

---

**References**:
- Yakubov (2025): "Effect of Variable Names on Code Generation Quality"
- "When Names Disappear" (ICLR 2026): Variable names critical for intent-level understanding
