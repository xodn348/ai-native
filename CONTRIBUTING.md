# Contributing to AI-Native Framework

Thank you for contributing! This guide ensures all documentation follows consistent patterns optimized for AI agent consumption.

---

## Document Format Standards

All documentation in this repository follows these standards to maximize AI agent comprehension.

---

## 1. File Structure Template

Every documentation file MUST follow this structure:

```markdown
# [Title]

[One-sentence description]

---

## [Section 1: Core Concept]

**Research/Evidence**: [Citation with link]

**Key Finding**: [One-sentence finding with quantitative data]

### Pattern: [Pattern Name]

```[language]
// Code example with comments
// Must be copy-paste ready
```

**Why This Works**:
- [Reason 1 with evidence]
- [Reason 2 with evidence]

### Anti-Pattern: [What Not To Do]

```[language]
// Example of wrong approach
// Explain WHY it fails
```

**Impact**: [Quantitative impact if available]

---

## [Section 2: Next Concept]

[Repeat structure above]

---

## Summary: [Topic] Checklist

- [ ] Checkbox item 1
- [ ] Checkbox item 2

**📌 Key Insight**: [One-sentence takeaway]
```

---

## 2. Writing Style Guidelines

### For Principles Documents (docs/principles/)

**Purpose**: Establish evidence-based architectural decisions.

**Structure**:
1. Core principle statement
2. Research citation
3. Quantitative evidence
4. Pattern with code example
5. Anti-pattern with code example
6. Impact measurement
7. Checklist

**Example**: See `docs/principles/architecture.md`

### For Guide Documents (docs/guides/)

**Purpose**: Actionable how-to instructions.

**Structure**:
1. Goal statement
2. Step-by-step instructions
3. Code examples (working, not pseudo)
4. Common pitfalls
5. Verification steps

**Example**: See `docs/guides/naming.md`

### For Templates (templates/)

**Purpose**: Copy-paste ready files.

**Requirements**:
- **NO placeholders** that require explanation
- Include inline comments explaining each section
- Provide sensible defaults
- Link to relevant guides

**Example**: See `templates/AGENTS.md`

### For Examples (examples/)

**Purpose**: Reference implementations.

**Requirements**:
- **Complete working code** (can run as-is)
- Include package.json/requirements.txt
- Include README.md with setup instructions
- Follow all AI-native principles from this repo

---

## 3. Code Example Standards

### All Code Examples Must Be:

1. **Complete** - No `...` or pseudo-code
2. **Runnable** - Copy-paste works without modification
3. **Typed** - Include all type annotations
4. **Commented** - Explain WHY, not WHAT
5. **Real** - Use realistic domain examples (not foo/bar)

### Good Example:

```typescript
/**
 * Calculate order total with tax and discounts.
 * 
 * @param items - Cart items with prices
 * @param taxRate - Tax rate (0.0 to 1.0, e.g., 0.08 for 8%)
 * @param discountCode - Optional discount code
 * @returns Total amount in cents
 * 
 * @example
 * const total = calculateOrderTotal(
 *   [{ name: 'Book', price: 1500 }],
 *   0.08,
 *   'SAVE10'
 * );
 * // Returns: 1458 (1500 * 0.9 * 1.08)
 */
function calculateOrderTotal(
  items: CartItem[],
  taxRate: number,
  discountCode?: string
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discountMultiplier = discountCode === 'SAVE10' ? 0.9 : 1.0;
  const taxMultiplier = 1 + taxRate;
  
  return Math.round(subtotal * discountMultiplier * taxMultiplier);
}
```

### Bad Example (DO NOT DO THIS):

```typescript
// ❌ Incomplete, pseudo-code, no types
function calculate(items, rate) {
  // Calculate total
  // ... apply discount
  return total;
}
```

---

## 4. Evidence Requirements

Every claim MUST be backed by evidence:

### Acceptable Evidence:

1. **Academic papers** - Include arxiv/DOI link
2. **Industry reports** - Link to official source
3. **Benchmark results** - Link to methodology
4. **Production case studies** - Link to blog/docs

### Evidence Format:

```markdown
**Research**: [Paper Title] ([Author], [Year])
**Link**: [URL]
**Key Finding**: [Specific quantitative result]
**Implication**: [How this applies to AI-native design]
```

### Example:

```markdown
**Research**: "Variable Naming Impact on Code Generation" (Yakubov, 2025)
**Link**: https://arxiv.org/abs/...
**Key Finding**: Descriptive naming achieved +9% semantic similarity vs. minimal names
**Implication**: Use explicit names despite higher token cost
```

---

## 5. Quantitative Data Standards

When citing performance improvements:

- **Always include baseline** - "40% improvement" requires stating baseline
- **Specify measurement** - What metric? (accuracy, speed, tokens, errors)
- **Include sample size** - How many examples/repos/models tested?
- **State confidence** - Is this from one study or multiple?

### Good Quantitative Claim:

> Graph-based navigation improved code localization accuracy by 40% (from 50% to 70%) across 1,000 test cases using LocAgent (ACL 2025).

### Bad Quantitative Claim:

> Graph-based navigation is better. (No numbers, no source)

---

## 6. Checklist Requirements

Every guide/principle document MUST end with a checklist.

**Format**:
```markdown
## Summary: [Topic] Checklist

- [ ] Item phrased as verification step
- [ ] Item includes quantitative target if applicable
- [ ] Item is binary (yes/no, not subjective)

**📌 Key Insight**: [One-sentence main takeaway]
```

**Good Checklist Item**:
- [ ] Functions are 20-50 lines (target 30)

**Bad Checklist Item**:
- [ ] Functions are reasonably sized (What does "reasonable" mean?)

---

## 7. Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `docs`: Documentation only
- `feat`: New feature/guide
- `fix`: Fix error in existing content
- `refactor`: Restructure without changing content
- `test`: Add examples or verification
- `chore`: Maintenance tasks

### Examples:

```
docs(principles): add semantic depth guidelines

- Add LM-CC metric explanation
- Include code examples for flat vs nested
- Cite Xie et al. 2026 research

Closes #42
```

```
feat(templates): add Python project template

- Add pyproject.toml with strict mypy config
- Include Pydantic schemas example
- Add pytest configuration

See docs/guides/python-setup.md for usage
```

---

## 8. Pull Request Requirements

### Before Submitting PR:

- [ ] All code examples are complete and runnable
- [ ] All claims have citations with links
- [ ] All quantitative data includes source and baseline
- [ ] Document follows template structure
- [ ] Checklist included at end
- [ ] Spell-check completed
- [ ] Links tested (no 404s)

### PR Title Format:

Same as commit messages: `<type>(<scope>): <subject>`

### PR Description Template:

```markdown
## What

[Brief description of changes]

## Why

[Evidence/motivation for changes]

## Evidence

[Links to research/sources]

## Checklist

- [ ] Code examples tested
- [ ] Citations verified
- [ ] Follows CONTRIBUTING.md format
- [ ] Links checked

## Related Issues

Closes #[issue number]
```

---

## 9. File Naming Conventions

### Documents:
- **Lowercase with hyphens**: `semantic-depth.md` (NOT `Semantic_Depth.md`)
- **Descriptive names**: `error-handling-patterns.md` (NOT `patterns.md`)
- **No dates in filenames**: Content is versioned by git

### Code Examples:
- **Match language convention**: `UserService.ts` for TypeScript, `user_service.py` for Python
- **Include extension**: Always use file extensions

### Directories:
- **Lowercase, plural**: `docs/guides/`, `examples/typescript/`
- **No nesting beyond 3 levels**: `docs/guides/advanced/` is max depth

---

## 10. Language & Tone

### Technical Writing Guidelines:

- **Use active voice**: "AI agents navigate via graphs" (not "Graphs are navigated by AI agents")
- **Be concise**: Remove filler words ("basically", "actually", "just")
- **Use examples**: Show, don't just tell
- **Avoid jargon**: Explain technical terms on first use
- **Be prescriptive**: "Use X" not "You might want to consider X"

### Markdown Formatting:

- **Bold** for emphasis: `**NEVER use any type**`
- **Code** for literals: `const`, `AGENTS.md`, `.ai/architecture.json`
- **Italics** for citations: `*GraphCodeBERT (2020)*`
- **Lists** for sequences: Use numbered lists for steps, bullets for features
- **Tables** for comparisons: Use tables for "before/after", "pattern vs anti-pattern"

---

## 11. Maintenance Responsibilities

### When Adding New Content:

1. Check if existing document covers the topic (avoid duplication)
2. Link from README.md if adding new guide
3. Update checklist.md if adding verification step
4. Cross-reference related documents

### When Updating Existing Content:

1. Keep quantitative data current (cite latest research)
2. Update examples to match latest language versions
3. Preserve historical context (don't delete, show evolution)
4. Note breaking changes in PR description

---

## 12. Questions?

- **For formatting questions**: See this document
- **For content questions**: Open a discussion
- **For bugs/errors**: Open an issue
- **For major changes**: Open an issue first to discuss

---

## Quick Reference: Document Checklist

Before submitting any documentation:

- [ ] Follows template structure (title, research, pattern, anti-pattern, checklist)
- [ ] All code examples are complete and tested
- [ ] All claims have citations with links
- [ ] Quantitative data includes baseline and source
- [ ] Ends with actionable checklist
- [ ] Uses active voice and concrete language
- [ ] File named with lowercase and hyphens
- [ ] Linked from README.md or parent document
- [ ] No broken links (tested all URLs)
- [ ] Spell-checked

---

**Thank you for maintaining high standards! AI agents (and human readers) will appreciate it.**
