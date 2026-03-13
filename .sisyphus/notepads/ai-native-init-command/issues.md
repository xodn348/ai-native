
## Test Flakiness Issue (Fixed)

### Problem
Tests were failing intermittently with "ENOENT: no such file or directory" errors when reading AGENTS.md after running init command.

### Root Cause
- Tests used `Date.now()` for temp directory names
- When tests run in parallel (vitest default), multiple tests could get the same timestamp
- Directory name collisions caused file operations to interfere with each other
- Test files were being deleted/overwritten by parallel test runs

### Solution
Changed directory naming from:
```typescript
testDir = join(tmpdir(), `ai-native-test-${Date.now()}`);
```

To:
```typescript
testDir = join(tmpdir(), `ai-native-test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
```

This adds a random 7-character suffix to ensure uniqueness even when tests run in parallel.

### Verification
- Ran tests 3 times consecutively - all passed (56/56)
- No more ENOENT errors
- Tests are now stable and reliable

