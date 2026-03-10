# TypeScript AI-Native Example

Complete reference implementation demonstrating all AI-native principles.

---

## Overview

This example implements a user management service following all AI-native guidelines:
- ✅ Semantic depth ≤ 4
- ✅ Functions 20-50 lines
- ✅ Typed error hierarchies
- ✅ Zod schema validation
- ✅ TSDoc with examples
- ✅ Descriptive naming
- ✅ Context-optimized structure

---

## Setup

\`\`\`bash
# Install dependencies
npm install

# Run type check
npm run typecheck

# Run tests
npm test

# Run linter
npm run lint
\`\`\`

---

## Structure

\`\`\`
src/
  users/
    index.ts          # Public API (56 lines)
    service.ts        # Service implementation (120 lines)
    repository.ts     # Data access (90 lines)
    validation.ts     # Input validation (70 lines)
    errors.ts         # Error hierarchy (80 lines)
    types.ts          # Type definitions (60 lines)
\`\`\`

**Total**: ~476 lines across 6 files (average 79 lines per file)

---

## Key Features

### 1. Graph-Structured Dependencies

\`\`\`
index.ts → service.ts → repository.ts
               ↓
          validation.ts
               ↓
           types.ts
\`\`\`

Maximum depth: 3 levels

### 2. Typed Error Hierarchy

\`\`\`typescript
AppError
  ├── ValidationError
  ├── NotFoundError
  └── DatabaseError
\`\`\`

### 3. Zod Schema Validation

All external data validated with runtime type checking.

### 4. TSDoc with Examples

Every public function documented with multiple `@example` blocks.

---

## Running the Example

\`\`\`bash
# Install
npm install

# Type check
npm run typecheck  # Should pass with no errors

# Run tests
npm test  # All tests should pass

# Lint
npm run lint  # No warnings or errors
\`\`\`

---

## Learning Points

1. **Semantic Depth**: Notice how `service.ts` never nests operations more than 3 levels deep
2. **Function Size**: All functions are 20-50 lines
3. **Error Handling**: Categorical error handling with typed exceptions
4. **Validation**: Zod schemas catch errors at runtime
5. **Documentation**: TSDoc includes why, not just what

---

## What Makes This AI-Native?

| Principle | Implementation |
|-----------|----------------|
| **Navigation** | Clear module boundaries, dependency graph |
| **Explicit** | Typed errors, Zod validation, no implicit behavior |
| **Documentation** | TSDoc with examples, inline rationale comments |
| **Context** | Files < 150 lines, related code colocated |
| **Semantic Depth** | Maximum 3-4 levels per function |

---

## Adapting This Example

1. Copy the structure to your project
2. Replace `User` with your domain model
3. Update validation schemas for your inputs
4. Customize error types for your domain
5. Keep the same structural patterns

---

**This is a working example.** All code is runnable and passes type checking, tests, and linting.
