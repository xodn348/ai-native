## Task 5: Init Command Implementation

### Implementation Pattern
- Followed fault-tolerant pattern from `runSetup()`: try/catch per file operation
- Used `mkdirSync({ recursive: true })` for directory creation
- Logged to stderr for all operations (success and warnings)
- Used `path.relative(cwd, file)` for cleaner output paths

### AGENTS.md Idempotency
- Detection: Check if content includes `'# AI-Native Coding Principles'` header
- If exists: skip append, log message
- If not exists: append with `\n\n` separator
- Preserves existing content by reading first, then appending

### Test Strategy
- Used temp directories (`tmpdir()` + timestamp) to avoid conflicts
- Spawned actual CLI process with `spawnSync` for integration testing
- Tested all 4 files creation, content validation, idempotency, overwrite behavior
- Error handling test simplified to avoid race conditions

### CLI Argument Parsing
- Added `'init'` case before help check in `main()` function
- Updated `printUsage()` with clear description
- Follows existing pattern: check command, run function, return early

### Home Directory Warning
- Used `os.homedir()` (not `process.env.HOME`)
- Warning logged to stderr but doesn't block execution
- Helps prevent accidental global rules file creation
