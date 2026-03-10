# Error Handling for AI-Native Codebases

How to structure error handling for AI agent comprehension and effective debugging.

---

## Core Finding: Debugging Has Exponential Decay

**Research**: "Debugging Decay Index" (Adnan & Kuhn, Nature Scientific Reports 2025)

**Key Discovery**: AI debugging effectiveness follows exponential decay pattern: `E(t) = E₀ e^(-λt)`

| Model | Effectiveness Lost By | Decay Rate |
|-------|----------------------|------------|
| GPT-4 | **3rd attempt** | 60-80% |
| Claude | **3rd attempt** | 60-80% |
| Qwen2.5-coder | **5th attempt** | 60-80% |

**Implication**: After 3 failed debugging attempts, **fresh restart** outperforms continued iteration.

**Strategic Pattern**: Design error handling that enables **first-attempt success**, not iterative debugging.

---

## 1. Typed Error Hierarchies

### Anti-Pattern: Generic Error Throwing

```typescript
// ❌ BAD: Undifferentiated errors
function processPayment(order: Order) {
  if (!order.paymentMethod) {
    throw new Error('Payment method missing');
  }
  
  if (order.amount <= 0) {
    throw new Error('Invalid amount');
  }
  
  const balance = getBalance(order.userId);
  if (balance < order.amount) {
    throw new Error('Insufficient funds');
  }
  
  // ...
}

// Caller can't distinguish error types
try {
  await processPayment(order);
} catch (e) {
  // Is this validation, insufficient funds, or network error?
  console.error(e.message);
}
```

### Pattern: Typed Error Hierarchy

```typescript
// ✅ GOOD: Typed error hierarchy
abstract class PaymentError extends Error {
  abstract code: string;
  abstract statusCode: number;
  abstract retryable: boolean;
  abstract userMessage: string;
  
  constructor(message: string, public context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

class InvalidPaymentMethodError extends PaymentError {
  code = 'INVALID_PAYMENT_METHOD' as const;
  statusCode = 400;
  retryable = false;
  userMessage = 'Please provide a valid payment method';
}

class InsufficientFundsError extends PaymentError {
  code = 'INSUFFICIENT_FUNDS' as const;
  statusCode = 402;
  retryable = false;
  userMessage = 'Your account balance is too low';
  
  constructor(
    public required: Money,
    public available: Money
  ) {
    super(
      `Insufficient funds: need ${required}, have ${available}`,
      { required, available }
    );
  }
}

class PaymentGatewayError extends PaymentError {
  code = 'PAYMENT_GATEWAY_ERROR' as const;
  statusCode = 502;
  retryable = true;
  userMessage = 'Payment processing temporarily unavailable';
  
  constructor(public gatewayCode: string, cause: Error) {
    super(`Payment gateway error: ${gatewayCode}`, { gatewayCode });
    this.cause = cause;
  }
}

// Categorical error handling
try {
  await processPayment(order);
} catch (e) {
  if (e instanceof InvalidPaymentMethodError) {
    return res.status(400).json({ error: e.userMessage });
  }
  
  if (e instanceof InsufficientFundsError) {
    return res.status(402).json({
      error: e.userMessage,
      required: e.required,
      available: e.available,
    });
  }
  
  if (e instanceof PaymentGatewayError && e.retryable) {
    return retry(() => processPayment(order), { maxAttempts: 3 });
  }
  
  throw e;  // Unknown error, propagate
}
```

---

## 2. Error Taxonomy: 8 Systematic Patterns

**Research**: AgentRx (Microsoft Research, 2026) + Augment Code (2026)

### The 8 Failure Patterns

1. **Hallucinated APIs** - AI invents non-existent functions/methods
2. **Security vulnerabilities** - SQL injection, XSS, insecure crypto
3. **Performance anti-patterns** - N+1 queries, unnecessary loops
4. **Missing edge cases** - Null handling, empty arrays, boundary conditions
5. **Context length degradation** - Critical info lost in long context
6. **Recursion limits** - Stack overflow, infinite loops
7. **State update loops** - Cascading mutations, circular dependencies
8. **Bundle size issues** - Importing entire libraries for single function

### Pattern-Based Error Messages

```typescript
// ✅ GOOD: Error messages map to failure patterns
class HallucinatedApiError extends Error {
  code = 'HALLUCINATED_API';
  pattern = 'PATTERN_1_HALLUCINATED_API';
  
  constructor(functionName: string) {
    super(
      `Function '${functionName}' does not exist. ` +
      `Check API documentation or available exports.`
    );
  }
}

class EdgeCaseError extends Error {
  code = 'EDGE_CASE_NOT_HANDLED';
  pattern = 'PATTERN_4_MISSING_EDGE_CASE';
  
  constructor(condition: string, value: unknown) {
    super(
      `Edge case not handled: ${condition}. ` +
      `Received: ${JSON.stringify(value)}`
    );
  }
}

// Usage guides AI to fix category
function getUserById(id: number): User {
  if (!Number.isInteger(id) || id <= 0) {
    throw new EdgeCaseError('id must be positive integer', id);
  }
  
  const user = db.users.find(id);
  
  if (!user) {
    throw new EdgeCaseError('user not found', id);
  }
  
  return user;
}
```

---

## 3. Defensive Programming: Fail Fast

**Research**: SWE-agent case study - "Defensive programming succeeds even when agents lack deep domain knowledge"

### Pattern: Explicit Validation at Boundaries

```typescript
// ✅ GOOD: Validate at every boundary
function calculateOrderTotal(
  items: CartItem[],
  taxRate: number,
  discountCode?: string
): number {
  // Validate inputs explicitly
  if (!Array.isArray(items)) {
    throw new ValidationError('items must be an array', { items });
  }
  
  if (items.length === 0) {
    throw new ValidationError('items cannot be empty', { items });
  }
  
  if (typeof taxRate !== 'number' || taxRate < 0 || taxRate > 1) {
    throw new ValidationError('taxRate must be between 0 and 1', { taxRate });
  }
  
  if (discountCode !== undefined && typeof discountCode !== 'string') {
    throw new ValidationError('discountCode must be string', { discountCode });
  }
  
  // Business logic only executes with valid inputs
  const subtotal = items.reduce((sum, item) => {
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new ValidationError('item.price must be non-negative number', { item });
    }
    return sum + item.price;
  }, 0);
  
  const discount = discountCode === 'SAVE10' ? 0.1 : 0;
  const total = subtotal * (1 - discount) * (1 + taxRate);
  
  return Math.round(total);
}
```

---

## 4. Error Context: Preserve Diagnostic Information

### Anti-Pattern: Losing Context

```typescript
// ❌ BAD: Context lost
try {
  await saveUser(userData);
} catch (e) {
  throw new Error('Failed to save user');
}
```

### Pattern: Preserve Full Context

```typescript
// ✅ GOOD: Context preserved
class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public data: unknown,
    public cause?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      operation: this.operation,
      data: this.data,
      cause: this.cause?.message,
      stack: this.stack,
    };
  }
}

try {
  await db.users.create(userData);
} catch (e) {
  throw new DatabaseError(
    'Failed to create user',
    'users.create',
    userData,
    e as Error
  );
}

// Caller sees full diagnostic context
try {
  await saveUser(userData);
} catch (e) {
  if (e instanceof DatabaseError) {
    logger.error('Database operation failed', {
      operation: e.operation,
      data: e.data,
      cause: e.cause,
    });
  }
}
```

---

## 5. Retry Policies: Explicit and Bounded

### Anti-Pattern: Implicit Retry Logic

```typescript
// ❌ BAD: Hidden retry logic
async function fetchData() {
  // Retry logic buried in implementation
  for (let i = 0; i < 3; i++) {
    try {
      return await fetch('/api/data');
    } catch (e) {
      if (i === 2) throw e;
    }
  }
}
```

### Pattern: Explicit Retry Configuration

```typescript
// ✅ GOOD: Explicit retry policy
interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableErrors: Array<new (...args: any[]) => Error>;
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryableErrors: [NetworkError, TimeoutError, RateLimitError],
};

async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      
      // Check if error is retryable
      const isRetryable = policy.retryableErrors.some(
        ErrorType => e instanceof ErrorType
      );
      
      if (!isRetryable || attempt === policy.maxAttempts) {
        throw e;
      }
      
      // Exponential backoff
      const delay = policy.delayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

// Usage is explicit and configurable
const userData = await withRetry(
  () => fetchUserData(userId),
  {
    maxAttempts: 5,
    delayMs: 2000,
    backoffMultiplier: 1.5,
    retryableErrors: [NetworkError, TimeoutError],
  }
);
```

---

## 6. Error Boundaries: Layered Defense

**Research**: "Error Propagation Bottleneck" (Zylos Research, 2026)

**Finding**: Single failures cascade through planning, memory, and action modules. **Layered defenses** (retries → fallbacks → circuit breakers) achieved **24%+ improvement** in task success rates.

### Pattern: Defense in Depth

```typescript
// ✅ GOOD: Layered error handling
class PaymentService {
  constructor(
    private primaryGateway: PaymentGateway,
    private fallbackGateway: PaymentGateway,
    private circuitBreaker: CircuitBreaker
  ) {}
  
  async processPayment(order: Order): Promise<PaymentResult> {
    // Layer 1: Circuit breaker (prevent cascade)
    if (this.circuitBreaker.isOpen()) {
      throw new ServiceUnavailableError('Payment service circuit open');
    }
    
    try {
      // Layer 2: Primary gateway with retry
      return await withRetry(
        () => this.primaryGateway.charge(order),
        { maxAttempts: 3, delayMs: 1000 }
      );
    } catch (primaryError) {
      logger.warn('Primary gateway failed, trying fallback', { primaryError });
      
      try {
        // Layer 3: Fallback gateway
        return await this.fallbackGateway.charge(order);
      } catch (fallbackError) {
        // Layer 4: Circuit breaker opens
        this.circuitBreaker.recordFailure();
        
        throw new PaymentProcessingError(
          'All payment gateways failed',
          { primaryError, fallbackError }
        );
      }
    }
  }
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeoutMs = 60000;  // 1 minute
  
  isOpen(): boolean {
    if (this.failures < this.threshold) return false;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    if (timeSinceLastFailure > this.timeoutMs) {
      this.reset();
      return false;
    }
    
    return true;
  }
  
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
  
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}
```

---

## 7. User-Facing vs Technical Messages

### Anti-Pattern: Technical Errors to Users

```typescript
// ❌ BAD: Technical details exposed to users
try {
  await processPayment(order);
} catch (e) {
  return res.status(500).json({
    error: e.message,  // "Connection to pg://localhost:5432 failed"
    stack: e.stack,     // Full stack trace
  });
}
```

### Pattern: Separate User and Technical Messages

```typescript
// ✅ GOOD: User-friendly messages, technical logging
class AppError extends Error {
  constructor(
    message: string,  // Technical message (for logs)
    public userMessage: string,  // User-friendly message
    public statusCode: number,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
  }
}

class InsufficientFundsError extends AppError {
  constructor(required: Money, available: Money) {
    super(
      `Insufficient funds: need ${required}, have ${available}`,  // Technical
      'Your account balance is too low for this purchase',         // User-facing
      402,
      'INSUFFICIENT_FUNDS',
      { required, available }
    );
  }
}

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    // Log technical details
    logger.error('Application error', {
      message: err.message,
      code: err.code,
      context: err.context,
      stack: err.stack,
    });
    
    // Return user-friendly message
    return res.status(err.statusCode).json({
      error: err.userMessage,
      code: err.code,
    });
  }
  
  // Unknown error - don't expose details
  logger.error('Unknown error', { err });
  return res.status(500).json({
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  });
});
```

---

## 8. Fresh Restart After 3 Failures

**Critical Pattern**: Implement automatic fresh restart after debugging threshold.

```typescript
// ✅ GOOD: Fresh restart after threshold
class DebugSession {
  private attempts = 0;
  private readonly maxAttempts = 3;
  
  async attemptFix(task: Task, error: Error): Promise<Result> {
    this.attempts++;
    
    if (this.attempts > this.maxAttempts) {
      logger.warn('Debugging threshold exceeded, triggering fresh restart', {
        task: task.id,
        attempts: this.attempts,
        error,
      });
      
      // Fresh restart: new context, new approach
      return this.freshRestart(task);
    }
    
    // Continue debugging
    return this.debugFix(task, error);
  }
  
  private async freshRestart(task: Task): Promise<Result> {
    // Reset context
    this.attempts = 0;
    
    // Different approach (e.g., consult Oracle, try alternative implementation)
    return this.alternativeApproach(task);
  }
}
```

---

## Summary: Error Handling Checklist

- [ ] Typed error hierarchy (not generic `Error`)
- [ ] Each error has `code`, `statusCode`, `retryable` properties
- [ ] Error messages map to failure patterns
- [ ] Validation at all boundaries (fail fast)
- [ ] Full diagnostic context preserved
- [ ] Retry policies are explicit and configurable
- [ ] Layered defenses (retry → fallback → circuit breaker)
- [ ] Separate user-facing and technical messages
- [ ] Fresh restart after 3 debugging attempts
- [ ] Errors are categorical (instanceof checks)
- [ ] No empty catch blocks
- [ ] No silent error suppression

---

**📌 Key Insight**: AI debugging follows exponential decay. Design error handling for **first-attempt success** through explicit types, defensive validation, and categorical handling. After 3 failures, fresh restart outperforms continued iteration.

---

**References**:
- Adnan & Kuhn (Nature, 2025): "Debugging Decay Index"
- AgentRx (Microsoft Research, 2026): "Systematic Failure Pattern Analysis"
- Zylos Research (2026): "Error Propagation Bottleneck"
- Augment Code (2026): "8 Systematic AI Code Failure Patterns"
