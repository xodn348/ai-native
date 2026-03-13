## Task 4: Enhanced runSetup() with Global Rules File Creation

### Implementation Pattern
- Added `import os from 'node:os'` for cross-platform home directory resolution
- Used `os.homedir()` instead of `process.env.HOME` for better portability
- Followed existing fault-tolerant pattern: try/catch with stderr logging
- Placed new code BEFORE final "Done" message in `runSetup()`
- Used `mkdirSync({ recursive: true })` for safe directory creation
- Followed idempotent pattern: always overwrite file with current content

### Test Strategy
- Created comprehensive test suite in `src/__tests__/setup.test.ts`
- Used temp directories (not actual home directory) for test isolation
- Tested file creation, frontmatter format, content validation, and idempotency
- All 8 new tests pass, bringing total to 28 tests across 5 test files

### Code Structure
```typescript
// Claude Code global rules
try {
  const claudeRulesDir = path.join(os.homedir(), '.claude', 'rules');
  mkdirSync(claudeRulesDir, { recursive: true });
  const claudeRulesFile = path.join(claudeRulesDir, 'ai-native.md');
  writeFileSync(claudeRulesFile, generateClaudeRules(), 'utf-8');
  console.error(`[ai-native setup] Created global rules at ${claudeRulesFile}.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[ai-native setup] Warning: Failed to create global rules file: ${message}`);
}
```

### Verification Results
- ✅ File created at `~/.claude/rules/ai-native.md`
- ✅ Correct frontmatter format (unquoted, comma-separated paths)
- ✅ Line count: 39 (≤45 requirement)
- ✅ Idempotent: second run produces identical file
- ✅ All tests pass (28/28)
- ✅ Build succeeds with no errors
- ✅ LSP diagnostics clean

### Key Decisions
1. **os.homedir() vs process.env.HOME**: Used `os.homedir()` for better cross-platform support (works on Windows, macOS, Linux)
2. **Error handling**: Non-fatal - logs warning but continues setup if rules file creation fails
3. **Placement**: Added BEFORE final "Done" message to maintain logical flow
4. **Comment style**: Followed existing pattern (`// Claude Code global rules`) for consistency
