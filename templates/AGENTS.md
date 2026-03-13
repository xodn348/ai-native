# AGENTS.md Template

Copy this file to your project root and customize for your tech stack.

---

# AGENTS.md

## Project Context
- **Framework**: [Your framework] (version) <!-- auto:framework -->
- **Database**: [Your database] (version)
- **Auth**: [Your auth solution] (version)
- **Styling**: [Your styling solution] (version)
- **Package Manager**: [npm/pnpm/yarn] (specify version) <!-- auto:package-manager -->
- **Node Version**: [Node version] (use `nvm use` or specify in `.nvmrc`) <!-- auto:node-version -->
- **Runtime**: [Node.js/Deno/Bun/Edge Runtime] <!-- auto:runtime -->

## Architecture

```
src/
  [module-1]/       # [Brief description]
    index.ts        # Public API
    internal/       # Private implementation
    contracts.ts    # Type definitions
    errors.ts       # Domain errors
  
  [module-2]/
    index.ts
    internal/
    contracts.ts
  
  lib/              # Shared utilities
  types/            # Shared types
```

## Development Workflow

```bash
# Install dependencies
[your install command]

# Development server
[your dev command]          <!-- auto:script-dev -->

# Build for production
[your build command]        <!-- auto:script-build -->

# Run tests
[your test command]           # All tests  <!-- auto:script-test -->
[your test:watch command]     # Watch mode
[your test:e2e command]       # E2E tests

# Linting and formatting
[your lint command]           # Check  <!-- auto:script-lint -->
[your lint:fix command]       # Auto-fix

# Database (if applicable)
[your db:migrate command]     # Run migrations
[your db:seed command]        # Seed data
```

## Code Style

### General Rules
- **Semicolons**: [Yes/No]
- **Quotes**: [Single/Double]
- **Indentation**: [2 spaces/4 spaces/tabs]
- **Max line length**: [80/100/120] characters
- **Trailing commas**: [Always/Never]

### Framework-Specific
- [List framework-specific conventions]
- [Import order, file naming, etc.]

### TypeScript (if applicable)
- **Strict mode**: [Enabled/Disabled] <!-- auto:ts-strict -->
- **NO `any` type** (use `unknown` and narrow)
- **Explicit return types** for exported functions
- **[Validation library] for all external data**

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Functions/Variables | camelCase | `getUserById` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `User`, `ApiResponse` |
| Database tables | snake_case | `user_profiles` |
| API routes | kebab-case | `/api/user-settings` |
| Filenames | [Your convention] | `get-user.ts` |

## Constraints (CRITICAL)

### NEVER
- **NEVER [constraint 1]** (reason)
- **NEVER [constraint 2]** (reason)
- **NEVER use `any` type** (use `unknown` and narrow)
- **NEVER commit secrets** (use environment variables)
- **NEVER use `eval()` or `Function()` constructor**

### ALWAYS
- **ALWAYS [requirement 1]** (reason)
- **ALWAYS [requirement 2]** (reason)
- **ALWAYS validate external data**
- **ALWAYS use prepared statements** for SQL
- **ALWAYS rate limit** API endpoints

## Common Patterns

### [Pattern Name 1]
```[language]
// Example code that is copy-paste ready
// Include imports, types, error handling
```

### [Pattern Name 2]
```[language]
// Another common pattern
// Make it production-ready
```

### Error Handling Pattern
```[language]
// Define your error hierarchy
class AppError extends Error {
  code: string;
  statusCode: number;
  retryable: boolean;
}

// Usage example
try {
  // operation
} catch (e) {
  if (e instanceof [YourError]) {
    // handle
  }
}
```

## Testing Requirements

### Coverage
- **Minimum [X]% coverage** for new code
- **[Y]% coverage** for critical paths

### Test Structure
```[language]
// Show your test structure
describe('[Component/Function]', () => {
  it('[does something]', () => {
    // test code
  });
});
```

## Performance Requirements

- **[Metric 1]**: [Target]
- **[Metric 2]**: [Target]
- **API response time**: [Target] (p95)
- **Bundle size**: [Target]

## Security Requirements

- **Input validation**: [How]
- **SQL injection prevention**: [How]
- **XSS prevention**: [How]
- **CSRF protection**: [How]
- **Rate limiting**: [Configuration]
- **Secrets management**: [How]

## AI Agent Hints

### When Adding New Features
1. **Search existing code** for similar patterns first
2. **Follow existing conventions** (don't invent new ones)
3. **Add tests** before or with implementation
4. **Update this file** if introducing new patterns

### When Debugging
1. **Read error messages completely** before attempting fixes
2. **Run type checker** before submitting
3. **Run tests** after each change
4. **Check for side effects** (cache, database, external APIs)

### When Refactoring
1. **Make changes incrementally** (small steps)
2. **Run tests after each step**
3. **Update documentation** if public APIs change
4. **Check for regressions** (run full test suite)

### Common Pitfalls
- [Common mistake 1] (how to avoid)
- [Common mistake 2] (how to avoid)
- [Common mistake 3] (how to avoid)

---

**Last Updated**: [YYYY-MM-DD]  
**Maintained By**: [Team/Person]  
**Questions**: [Contact/Issue tracker]
