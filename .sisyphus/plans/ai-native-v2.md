# ai-native v2.0.0 — Stronger Constitution + Smart Init

## TL;DR

> **Quick Summary**: Upgrade ai-native to v2 with two major changes: (1) Expand Layer 1 Constitution from 40→70 lines to embed highest-impact checklist items directly so AI agents follow them WITHOUT calling Layer 2 MCP tools, (2) Add smart init that auto-fills AGENTS.md from package.json/tsconfig.json with accurate data, leaving uncertain fields as blanks.
> 
> **Deliverables**:
> - Expanded constitution with MUST/NEVER enforcement language
> - Smart init command parsing package.json + tsconfig.json
> - Version bump to 2.0.0
> - Updated README
> - npm publish (--tag next first, then promote)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 4 → Task 6 → Task 7 → Task 9

---

## Context

### Original Request
User wants ai-native v2 with:
1. Constitution강화 (Option B: expand to 60-80 lines with core checklist embedded)
2. Smart init (compromise: auto-fill only accurate data from package.json/tsconfig.json)
3. Version 2.0.0, README update, npm publish, git commit

### Interview Summary
**Key Discussions**:
- CodeSure project analysis revealed Layer 1 constitution was followed for coding style but Layer 2 tools were never called
- AGENTS.md, .ai/architecture.json, TSDoc, typed errors all missing despite active MCP
- Root cause: "call get_checklist()" is a soft suggestion AI agents ignore
- Solution: embed highest-impact items in Layer 1 + smart init for AGENTS.md generation

**Research Findings**:
- Current constitution: 40 lines, ~600 tokens at `getConstitution()` line 169 of src/index.ts
- `src/index.ts` is the single source file (444 lines)
- Templates at `templates/` directory
- Tests use vitest, current version 1.1.2

### Metis Review
**Identified Gaps** (addressed):
- tsconfig.json is JSONC (comments + trailing commas) — cannot use bare JSON.parse(). Will use strip-json-comments approach or regex-based cleanup
- npm publish tag strategy: publish --tag next first, then promote to latest
- Should create v1 branch before version bump for backport patches
- Constitution expansion must stay within ~1200 token budget

---

## Work Objectives

### Core Objective
Make ai-native's coding guidelines self-enforcing by embedding critical items in Layer 1, and auto-generate accurate AGENTS.md via smart init.

### Concrete Deliverables
- `src/index.ts`: Updated `getConstitution()` — 60-80 lines with MUST/NEVER language
- `src/index.ts`: Updated `runInit()` — smart init parsing package.json + tsconfig.json
- `src/index.ts`: New `parsePackageJson()` and `parseTsConfig()` helper functions
- `package.json`: version 2.0.0
- `README.md`: Updated for v2 features
- `templates/AGENTS.md`: Updated template reflecting smart init fields

### Definition of Done
- [ ] `bun run test` or `npx vitest run` → all tests pass
- [ ] `tsc --noEmit` → no type errors
- [ ] Constitution is 60-80 lines, includes MUST/NEVER enforcement for top 5 items
- [ ] `npx ai-native init` in a project with package.json auto-fills build/test commands in AGENTS.md
- [ ] `npx ai-native init` in a project without package.json falls back to template blanks gracefully

### Must Have
- Expanded constitution with embedded enforcement for: AGENTS.md existence check, typed errors, TSDoc on exports, no `any`, explicit return types
- Smart init reads `package.json` scripts and `tsconfig.json` settings
- JSONC-safe tsconfig parsing (handles comments and trailing commas)
- Graceful fallback when files don't exist
- Version 2.0.0
- Updated README documenting v2 changes
- All existing tests pass + new tests for smart init

### Must NOT Have (Guardrails)
- Do NOT auto-generate architecture.json (too inaccurate for automation)
- Do NOT guess project architecture description (leave as blanks)
- Do NOT add new runtime dependencies (use built-in regex/string stripping for JSONC)
- Do NOT break existing `setup` command behavior
- Do NOT change Layer 2 MCP tool content (docs/, templates/, research/ stay as-is)
- Do NOT exceed ~1200 tokens for constitution (~80 lines max)
- Do NOT use `JSON.parse()` on tsconfig.json directly

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: YES (tests-after)
- **Framework**: vitest
- **Test command**: `npx vitest run`

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Library/Module**: Use Bash (node/bun REPL) — Import, call functions, compare output
- **CLI**: Use Bash — Run commands, assert stdout/stderr

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately, 3 parallel):
├── Task 1: Expand constitution text [quick]
├── Task 2: Add JSONC-safe tsconfig parser helper [quick]
└── Task 3: Add package.json parser helper [quick]

Wave 2 (Integration — after Wave 1, 3 parallel):
├── Task 4: Update runInit() with smart init logic [deep]
├── Task 5: Update AGENTS.md template for smart init [quick]
└── Task 6: Write tests for new functionality [unspecified-high]

Wave 3 (Release — after Wave 2, 3 parallel):
├── Task 7: Version bump + README update [quick]
├── Task 8: v1 branch creation + npm publish [quick]
└── Task 9: Git commit [quick]

Wave FINAL (Verification — after ALL, 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: CLI QA — run init in test project (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 4 → Task 6 → Task 7 → Task 9
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 3 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 4, 6 |
| 2 | — | 4, 6 |
| 3 | — | 4, 6 |
| 4 | 1, 2, 3 | 6, 7 |
| 5 | — | 4 |
| 6 | 1, 2, 3, 4 | 7 |
| 7 | 4, 6 | 8, 9 |
| 8 | 7 | 9 |
| 9 | 7, 8 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 3 — T1 `quick`, T2 `quick`, T3 `quick`
- **Wave 2**: 3 — T4 `deep`, T5 `quick`, T6 `unspecified-high`
- **Wave 3**: 3 — T7 `quick`, T8 `quick`, T9 `quick`
- **FINAL**: 4 — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [ ] 1. Expand Constitution Text

  **What to do**:
  - Edit `getConstitution()` in `src/index.ts` (line 169-206)
  - Expand from ~40 lines to 60-80 lines
  - Add MUST/NEVER enforcement language to existing sections
  - Embed these NEW items directly (highest-impact from checklist):
    - **AGENTS.md check**: "If the project has no AGENTS.md, create one BEFORE writing any code. Use get_template('AGENTS.md') from ai-native MCP."
    - **Typed errors enforcement**: "NEVER throw generic `Error`. ALWAYS create domain-specific error classes with: code (string), retryable (boolean), context."
    - **TSDoc enforcement**: "MUST add TSDoc to ALL exported functions: @param with constraints, @returns with format, @throws with conditions."
    - **Explicit return types**: "MUST declare explicit return types on all exported functions."
  - Keep total ≤ ~80 lines / ~1200 tokens
  - Preserve existing sections (Naming, Type Safety, Functions, Error Handling, Architecture)

  **Must NOT do**:
  - Do NOT change Layer 2 content (docs/, research/)
  - Do NOT exceed 1200 tokens
  - Do NOT add lengthy examples (keep concise enforcement style)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
    - Pure text editing task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 6
  - **Blocked By**: None

  **References**:
  - `src/index.ts:169-206` — Current `getConstitution()` function to expand
  - `checklist.md` — Full checklist with 10 categories; pick top 5 enforcement items
  - `docs/guides/error-handling.md` — Typed error hierarchy patterns for reference
  - `docs/principles/documentation.md` — TSDoc requirements for reference

  **Acceptance Criteria**:
  - [ ] `getConstitution()` returns 60-80 lines
  - [ ] Contains MUST/NEVER language for typed errors, TSDoc, return types, AGENTS.md
  - [ ] Token count ≤ 1200 (verify: `getConstitution().length / 4 <= 1200`)

  **QA Scenarios**:
  ```
  Scenario: Constitution line count within range
    Tool: Bash
    Steps:
      1. Run: node -e "import('./dist/index.js').then(m => { const lines = m.getConstitution().split('\n').length; console.log('Lines:', lines); process.exit(lines >= 60 && lines <= 80 ? 0 : 1) })"
    Expected Result: Exit code 0, lines between 60-80
    Evidence: .sisyphus/evidence/task-1-constitution-linecount.txt

  Scenario: Constitution contains enforcement keywords
    Tool: Bash
    Steps:
      1. Run: node -e "import('./dist/index.js').then(m => { const c = m.getConstitution(); const has = ['MUST', 'NEVER', 'AGENTS.md', 'typed error', 'TSDoc'].every(k => c.includes(k)); console.log('Has all keywords:', has); process.exit(has ? 0 : 1) })"
    Expected Result: Exit code 0, all keywords present
    Evidence: .sisyphus/evidence/task-1-constitution-keywords.txt

  Scenario: Constitution token budget
    Tool: Bash
    Steps:
      1. Run: node -e "import('./dist/index.js').then(m => { const tokens = Math.ceil(m.getConstitution().length / 4); console.log('Approx tokens:', tokens); process.exit(tokens <= 1200 ? 0 : 1) })"
    Expected Result: Exit code 0, tokens ≤ 1200
    Evidence: .sisyphus/evidence/task-1-constitution-tokens.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `feat!: expand constitution with enforcement language`
  - Files: `src/index.ts`

- [ ] 2. Add JSONC-Safe tsconfig Parser Helper

  **What to do**:
  - Add a `stripJsonComments(text: string): string` helper function in `src/index.ts`
  - Strips `//` single-line comments and `/* */` block comments from JSON text
  - Strips trailing commas before `}` and `]`
  - Add a `parseTsConfig(projectDir: string): { strict?: boolean; target?: string } | null` function
  - Reads `tsconfig.json` from projectDir, strips comments, then JSON.parse
  - Returns null if file doesn't exist or parse fails (graceful fallback)
  - Extracts only `compilerOptions.strict` and `compilerOptions.target`

  **Must NOT do**:
  - Do NOT add external dependencies (no jsonc-parser)
  - Do NOT attempt to resolve `extends` chains (too complex, out of scope)
  - Do NOT crash on malformed tsconfig

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 6
  - **Blocked By**: None

  **References**:
  - `src/index.ts:70-97` — Existing `upsertJsonServer()` for JSON file handling patterns
  - `tsconfig.json` in ai-native project itself — Example of JSONC with comments
  - Metis finding: tsconfig.json allows `//` comments and trailing commas

  **Acceptance Criteria**:
  - [ ] `stripJsonComments()` handles `//` and `/* */` comments
  - [ ] `stripJsonComments()` handles trailing commas
  - [ ] `parseTsConfig()` returns null on missing file
  - [ ] `parseTsConfig()` returns `{ strict: true, target: "ES2022" }` for typical tsconfig

  **QA Scenarios**:
  ```
  Scenario: Parse tsconfig with comments
    Tool: Bash
    Preconditions: tmp dir with tsconfig containing // comments
    Steps:
      1. Create temp dir with tsconfig.json: { "compilerOptions": { "strict": true, /* enforced */ "target": "ES2022" // latest } }
      2. Call parseTsConfig(tmpDir)
    Expected Result: Returns { strict: true, target: "ES2022" }
    Evidence: .sisyphus/evidence/task-2-parse-tsconfig-comments.txt

  Scenario: Graceful fallback on missing tsconfig
    Tool: Bash
    Steps:
      1. Call parseTsConfig("/tmp/nonexistent-dir")
    Expected Result: Returns null, no throw
    Evidence: .sisyphus/evidence/task-2-parse-tsconfig-missing.txt

  Scenario: Handles trailing commas
    Tool: Bash
    Steps:
      1. Create tsconfig: { "compilerOptions": { "strict": true, } }
      2. Call parseTsConfig(tmpDir)
    Expected Result: Returns { strict: true }, no crash
    Evidence: .sisyphus/evidence/task-2-parse-tsconfig-trailing.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Files: `src/index.ts`

- [ ] 3. Add package.json Parser Helper

  **What to do**:
  - Add `parsePackageJson(projectDir: string)` function in `src/index.ts`
  - Returns `{ scripts?: Record<string, string>; packageManager?: string; dependencies?: string[]; devDependencies?: string[] } | null`
  - Reads `package.json` from projectDir, JSON.parse (standard JSON, no JSONC needed)
  - Extracts: scripts (build, test, dev, lint, typecheck, start), dependencies list, devDependencies list
  - Detects package manager from: `packageManager` field, or lock file existence (bun.lockb → bun, pnpm-lock.yaml → pnpm, yarn.lock → yarn, package-lock.json → npm)
  - Detects runtime: presence of `bun-types` in devDeps → bun, otherwise node
  - Returns null if file doesn't exist

  **Must NOT do**:
  - Do NOT crash on malformed package.json
  - Do NOT read node_modules

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 6
  - **Blocked By**: None

  **References**:
  - `src/index.ts:36-38` — Existing package.json reading pattern (createRequire)
  - `/Users/jnnj92/codesure/package.json` — Example package.json with bun-types in devDeps

  **Acceptance Criteria**:
  - [ ] Extracts scripts correctly from package.json
  - [ ] Detects package manager from lock files
  - [ ] Detects bun runtime from bun-types
  - [ ] Returns null on missing file

  **QA Scenarios**:
  ```
  Scenario: Parse package.json with scripts
    Tool: Bash
    Steps:
      1. Create temp dir with package.json: { "scripts": { "build": "tsc", "test": "vitest" } }
      2. Call parsePackageJson(tmpDir)
    Expected Result: Returns object with scripts.build="tsc", scripts.test="vitest"
    Evidence: .sisyphus/evidence/task-3-parse-pkg-scripts.txt

  Scenario: Detect bun runtime
    Tool: Bash
    Steps:
      1. Create temp dir with package.json having "bun-types" in devDependencies
      2. Also create bun.lockb file
      3. Call parsePackageJson(tmpDir)
    Expected Result: runtime="bun", packageManager="bun"
    Evidence: .sisyphus/evidence/task-3-detect-bun.txt

  Scenario: Graceful fallback on missing package.json
    Tool: Bash
    Steps:
      1. Call parsePackageJson("/tmp/nonexistent")
    Expected Result: Returns null, no throw
    Evidence: .sisyphus/evidence/task-3-missing-pkg.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Files: `src/index.ts`

- [ ] 4. Update runInit() with Smart Init Logic

  **What to do**:
  - Modify `runInit()` in `src/index.ts` (line 237-304) to use new parser helpers
  - After creating rules files, call `parsePackageJson(cwd)` and `parseTsConfig(cwd)`
  - Generate AGENTS.md content with auto-filled fields:
    - **From package.json**: build/test/dev/lint commands, package manager, runtime, framework detection (react/next/express from dependencies)
    - **From tsconfig.json**: strict mode status, target
  - Fields that CAN'T be auto-detected: leave as `[description]` template blanks
  - Use a new `generateSmartAgentsMd(pkgInfo, tsInfo)` function
  - Keep existing behavior for projects without package.json (fall back to current template)
  - Maintain idempotency: if AGENTS.md already has ai-native section, skip

  **Must NOT do**:
  - Do NOT auto-generate architecture description
  - Do NOT guess code style beyond what tsconfig tells us
  - Do NOT break existing init behavior for projects without package.json

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
    - Integrates multiple helpers, needs careful logic

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential dependency)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Tasks 1, 2, 3, 5

  **References**:
  - `src/index.ts:237-304` — Current `runInit()` function to modify
  - `src/index.ts:232-235` — Current `generateAgentsMdSection()` to extend/replace
  - `templates/AGENTS.md` — Template structure to follow for field layout
  - `/Users/jnnj92/codesure/package.json` — Real-world package.json for testing assumptions

  **Acceptance Criteria**:
  - [ ] `runInit()` reads package.json and tsconfig.json from cwd
  - [ ] Generated AGENTS.md contains auto-filled build/test commands when available
  - [ ] Generated AGENTS.md contains `[placeholder]` blanks for unknown fields
  - [ ] Falls back to plain template when no package.json exists
  - [ ] Idempotent (running twice doesn't duplicate content)

  **QA Scenarios**:
  ```
  Scenario: Smart init with full project context
    Tool: Bash
    Preconditions: Temp dir with package.json (scripts: build, test, dev) + tsconfig.json (strict: true)
    Steps:
      1. cd to temp dir
      2. Run: node /path/to/dist/index.js init
      3. cat AGENTS.md
    Expected Result: AGENTS.md contains "tsc" in build command, "vitest" in test command, "Strict mode: Enabled"
    Failure Indicators: AGENTS.md has [your build command] instead of actual command
    Evidence: .sisyphus/evidence/task-4-smart-init-full.txt

  Scenario: Smart init without package.json
    Tool: Bash
    Preconditions: Empty temp dir
    Steps:
      1. cd to empty temp dir
      2. Run: node /path/to/dist/index.js init
      3. cat AGENTS.md
    Expected Result: AGENTS.md contains template placeholders like [Your framework]
    Evidence: .sisyphus/evidence/task-4-smart-init-empty.txt

  Scenario: Idempotent init
    Tool: Bash
    Steps:
      1. Run init once
      2. Run init again
      3. grep -c "AI-Native Coding Principles" AGENTS.md
    Expected Result: Count is 1 (not 2)
    Evidence: .sisyphus/evidence/task-4-smart-init-idempotent.txt
  ```

  **Commit**: YES
  - Message: `feat!: expand constitution with enforcement language and add smart init`
  - Files: `src/index.ts`, `templates/AGENTS.md`
  - Pre-commit: `npx vitest run`

- [ ] 5. Update AGENTS.md Template for Smart Init

  **What to do**:
  - Update `templates/AGENTS.md` to serve as the "fallback template" when no package.json is detected
  - Add comment markers like `<!-- auto:scripts -->` at positions where smart init would inject data
  - Ensure template works both as standalone template AND as smart-init target
  - Template should clearly indicate which fields are auto-detectable vs manual

  **Must NOT do**:
  - Do NOT change the overall template structure significantly
  - Do NOT add fields that can never be auto-detected

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6 — but no hard dependency)
  - **Blocks**: Task 4 (soft — template structure reference)
  - **Blocked By**: None

  **References**:
  - `templates/AGENTS.md` — Current template to update
  - `src/index.ts:281-301` — Where AGENTS.md is generated in init

  **Acceptance Criteria**:
  - [ ] Template clearly separates auto-fillable vs manual fields
  - [ ] Template is valid markdown
  - [ ] Compatible with `generateSmartAgentsMd()` function

  **QA Scenarios**:
  ```
  Scenario: Template renders as valid markdown
    Tool: Bash
    Steps:
      1. cat templates/AGENTS.md
      2. Verify no broken markdown syntax
    Expected Result: Clean markdown with placeholder fields
    Evidence: .sisyphus/evidence/task-5-template-valid.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Files: `templates/AGENTS.md`

- [ ] 6. Write Tests for New Functionality

  **What to do**:
  - Add tests in `src/__tests__/` for:
    - `stripJsonComments()` — comments, trailing commas, edge cases
    - `parseTsConfig()` — with comments, without file, with extends
    - `parsePackageJson()` — normal, missing, detecting pm/runtime
    - `getConstitution()` — line count, keyword presence, token budget
    - `generateSmartAgentsMd()` — with full info, partial info, no info
  - Use vitest with temp directories for file system tests
  - Follow existing test patterns in `src/__tests__/`

  **Must NOT do**:
  - Do NOT add external test dependencies
  - Do NOT skip edge cases (null inputs, malformed JSON)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on implementation being done)
  - **Parallel Group**: Wave 2 (after Tasks 1-4)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:
  - `src/__tests__/` — Existing test files for patterns
  - `vitest.config.ts` — Vitest configuration

  **Acceptance Criteria**:
  - [ ] `npx vitest run` → all tests pass including new ones
  - [ ] Minimum 10 new test cases covering happy path + edge cases
  - [ ] Tests for JSONC parsing edge cases (comments, trailing commas)

  **QA Scenarios**:
  ```
  Scenario: All tests pass
    Tool: Bash
    Steps:
      1. Run: npx vitest run
    Expected Result: All tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-6-tests-pass.txt

  Scenario: New test count
    Tool: Bash
    Steps:
      1. Run: npx vitest run --reporter=verbose 2>&1 | grep -c "✓"
    Expected Result: At least 10 more tests than baseline
    Evidence: .sisyphus/evidence/task-6-test-count.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Files: `src/__tests__/*.test.ts`

- [ ] 7. Version Bump + README Update

  **What to do**:
  - Update `package.json` version to `"2.0.0"`
  - Update `README.md`:
    - Add "What's New in v2" section near top
    - Document constitution expansion (Layer 1 now self-sufficient for top items)
    - Document smart init feature (auto-fills from package.json/tsconfig.json)
    - Update "Quick Start" if needed
    - Add migration note: "v2 is backward compatible. `setup` and `init` commands work the same."
  - Update version string in `src/index.ts` if hardcoded anywhere (check `McpServer` name/version)

  **Must NOT do**:
  - Do NOT change the Two-Layer Architecture documentation section
  - Do NOT remove any existing README sections

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Tasks 4, 6

  **References**:
  - `package.json:3` — Current version "1.1.2"
  - `README.md` — Current README to update
  - `src/index.ts:348-351` — McpServer version field

  **Acceptance Criteria**:
  - [ ] `package.json` version is "2.0.0"
  - [ ] README has "What's New in v2" section
  - [ ] README documents smart init and constitution changes

  **QA Scenarios**:
  ```
  Scenario: Version is 2.0.0
    Tool: Bash
    Steps:
      1. Run: node -e "console.log(require('./package.json').version)"
    Expected Result: "2.0.0"
    Evidence: .sisyphus/evidence/task-7-version.txt
  ```

  **Commit**: YES
  - Message: `chore: bump version to 2.0.0 and update README`
  - Files: `package.json`, `README.md`, `src/index.ts`

- [ ] 8. v1 Branch Creation + npm Publish

  **What to do**:
  - Create `v1` branch from the commit BEFORE version bump (for backport patches)
  - Run `npm run build` to compile
  - Run `npm publish --tag next` (NOT latest — protect existing ^1.x users)
  - Log the instruction: `npm dist-tag add ai-native@2.0.0 latest` for manual promotion later

  **Must NOT do**:
  - Do NOT publish directly to `latest` tag
  - Do NOT delete or modify v1 branch after creation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 7

  **References**:
  - Metis finding: npm publish --tag next first, promote later
  - `package.json:19` — Build script

  **Acceptance Criteria**:
  - [ ] `git branch -a` shows `v1` branch
  - [ ] `npm info ai-native dist-tags` shows `next: 2.0.0`
  - [ ] `latest` tag still points to 1.1.2

  **QA Scenarios**:
  ```
  Scenario: v1 branch exists
    Tool: Bash
    Steps:
      1. Run: git branch | grep v1
    Expected Result: v1 branch listed
    Evidence: .sisyphus/evidence/task-8-v1-branch.txt

  Scenario: npm publish succeeded
    Tool: Bash
    Steps:
      1. Run: npm info ai-native dist-tags
    Expected Result: next tag shows 2.0.0
    Evidence: .sisyphus/evidence/task-8-npm-tags.txt
  ```

  **Commit**: NO (publish only, no code changes)

- [ ] 9. Git Commit + Cleanup

  **What to do**:
  - Ensure all changes are committed with proper messages
  - Verify git status is clean
  - Push to remote

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 7, 8

  **References**:
  - Commit strategy section above

  **Acceptance Criteria**:
  - [ ] `git status` shows clean working tree
  - [ ] `git log --oneline -5` shows proper commit messages

  **QA Scenarios**:
  ```
  Scenario: Clean git status
    Tool: Bash
    Steps:
      1. Run: git status --porcelain
    Expected Result: Empty output (clean tree)
    Evidence: .sisyphus/evidence/task-9-git-clean.txt
  ```

  **Commit**: N/A (this IS the commit task)

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `npx vitest run`. Review changed files for: `as any`, empty catches, console.log in prod, dead code. Check constitution token count ≤ 1200.
  Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **CLI QA** — `unspecified-high`
  Create temp directory with sample package.json + tsconfig.json. Run `npx ai-native init`. Verify AGENTS.md has auto-filled fields. Run again without package.json — verify graceful fallback. Test idempotency (run init twice).
  Output: `Scenarios [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | VERDICT`

---

## Commit Strategy

- **Wave 2 complete**: `feat!: expand constitution with enforcement language and add smart init` — src/index.ts, templates/AGENTS.md, src/__tests__/*
- **Wave 3 complete**: `chore: bump version to 2.0.0 and update README` — package.json, README.md

---

## Success Criteria

### Verification Commands
```bash
npx vitest run              # Expected: all tests pass
tsc --noEmit                # Expected: no errors
node -e "const {getConstitution} = await import('./dist/index.js'); const c = getConstitution(); console.log(c.split('\n').length)"  # Expected: 60-80
```

### Final Checklist
- [ ] Constitution is 60-80 lines with MUST/NEVER enforcement
- [ ] Smart init auto-fills from package.json
- [ ] Smart init handles JSONC tsconfig safely
- [ ] Graceful fallback when files missing
- [ ] All existing tests pass
- [ ] New tests for smart init + constitution
- [ ] Version is 2.0.0
- [ ] README documents v2 changes
- [ ] v1 branch created
- [ ] Published to npm with --tag next
