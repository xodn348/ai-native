# AI-Native Codebase Framework

> **Evidence-based guidelines for building codebases optimized for AI agent interaction**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/ai-native)](https://www.npmjs.com/package/ai-native)
[![Research Papers](https://img.shields.io/badge/Research-25%2B%20Papers-blue)](./research/papers.md)
[![Industry Validated](https://img.shields.io/badge/Industry-Production%20Proven-green)](./BENCHMARKS.md)

**Give this URL to any AI agent** for practical project guardrails.

---

## Why AI-Native?

**Many AI failures are localization failures, not generation failures.** Agents miss the right files/functions more often than syntax.

Traditional codebases force agents to repeatedly load large contexts, infer implicit dependencies, and re-scan modules. **AI-native structure eliminates this waste.**

### Reported Impact (Context-Dependent)

| Improvement | Range | Source |
|---|---|---|
| Token usage per task | **-23 to -54%** | [SWE-Pruner](https://arxiv.org/abs/2601.16746) |
| Code localization | **+40%** | [Navigation Paradox](https://arxiv.org/abs/2602.20048) |
| Critical bug detection | **0 to +67%** (internal replication) | [Our A/B test](./experiments/semantic-depth-ab-test.md) |
| Hallucination rate | **up to -35%** (typed/validated stacks) | [Industry benchmarks](./BENCHMARKS.md) |
| Correction iterations | **-20 to -40%** (with agent docs) | [AGENTS.md analysis](./BENCHMARKS.md) |

**Illustrative ROI (10 developers)**: $33K–$66K/year API savings + ~500 hours/year recovered.

<details>
<summary><strong>What's New in v2</strong></summary>

### Constitution Strengthened (40 → 66 lines)

v1 constitution was soft suggestion — AI agents frequently ignored Layer 2 MCP tool calls. v2 embeds critical rules directly in Layer 1 with MUST/NEVER enforcement language:

- **MUST**: `AGENTS.md` bootstrap, typed domain errors, explicit return types, TSDoc on public APIs
- **NEVER**: `any` type, `@ts-ignore`, empty catch blocks, `console.log` in production
- New sections: Documentation Gates, Verification Gates, Security Gates, Context Optimization

### Breaking Changes

- Constitution line count increased (40 → 66) — slightly higher per-prompt token cost (~900 → ~1100 tokens)
- `getConstitution()` return value changed — if you consume the API directly, update accordingly

</details>

---

## How to Use

### Quick Start: One-Time Setup (Recommended)

Run once to configure AI clients globally:

```bash
npx -y ai-native setup
```

This command:
- Registers `ai-native` MCP server with Claude Code, Claude Desktop, Cursor, and Codex CLI
- Creates `~/.claude/rules/ai-native.md` (global rules for **Claude Code only**, code-files-only)

**After setup:**
- **Claude Code users**: Restart Claude Code. Constitution applies automatically to all projects.
- **Cursor/Windsurf/OpenCode users**: Run `init` in each project (see below).

Requires Node.js 18+.

### Per-Project Setup

**Required for**: Cursor, Windsurf, OpenCode  
**Optional for**: Claude Code (for team sharing via git)

Run in your project directory:

```bash
npx -y ai-native init
```

Creates per-project rules files:

| Client | File | Features |
|--------|------|----------|
| Claude Code / Claude Desktop | `.claude/rules/ai-native.md` | `paths:` frontmatter (code-only) |
| Cursor | `.cursor/rules/ai-native.mdc` | `alwaysApply: true` |
| Windsurf | `.windsurf/rules/ai-native.md` | Plain markdown |
| Codex | `.codex/ai-native.md` | Plain markdown |

Commit these files to share with your team.

<details>
<summary><strong>Two-Layer Architecture</strong></summary>

**Layer 1 (Always-On)**: 60-80 line constitution in rules files (~900-1200 tokens/prompt)
- Auto-loaded by supported clients at session start
- Activates only for code files (via `paths:`/`globs:` frontmatter)
- Includes enforcement gates for naming, type safety, functions, errors, docs, architecture, verification
- **No MCP required** — works via native rules file support

**Layer 2 (On-Demand)**: 16 files (4000+ lines) via MCP tools
- **Requires MCP server** (configured via `setup` command)
- **Auto-triggered only in Claude Code** when creating new files/modules
- Comprehensive deep dives on specific topics
- Research citations, examples, benchmarks

**Selective activation** = zero token waste:

- **Coding** (`.ts`, `.py`, `.java`, etc.) → constitution loads (~900-1200 tokens)
- **Everything else** (chat, docs, planning) → No constitution loaded (0 tokens)
- **New files/modules** (Claude Code only) → Layer 2 triggers for deep guidance

</details>

<details>
<summary><strong>Init Details</strong></summary>

`npx -y ai-native init` creates 4 rules files with the latest constitution. Existing files are overwritten with the current version.

| File | Content |
|------|---------|
| `.claude/rules/ai-native.md` | Constitution + `paths:` frontmatter (code-only activation) |
| `.cursor/rules/ai-native.mdc` | Constitution + `alwaysApply: true` frontmatter |
| `.windsurf/rules/ai-native.md` | Constitution, plain markdown |
| `.codex/ai-native.md` | Constitution, plain markdown |

To update to the latest constitution:

```bash
npx -y ai-native setup  # Updates global rules
npx -y ai-native init   # Updates project rules
```

</details>

<details>
<summary><strong>Manual MCP Configuration</strong></summary>

**Claude Code:**
```bash
claude mcp add ai-native -- npx -y ai-native
```

**Claude Desktop / Cursor (`mcpServers` JSON):**
```json
{
  "mcpServers": {
    "ai-native": {
      "command": "npx",
      "args": ["-y", "ai-native"]
    }
  }
}
```

**Codex CLI (`~/.codex/config.toml`):**
```toml
[mcp_servers.ai-native]
command = "npx"
args = ["-y", "ai-native"]
```

Common config locations:
- Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Cursor (global): `~/.cursor/mcp.json`
- Codex CLI: `~/.codex/config.toml`

**Alternative: URL-Only** (per-project, no installation):

Give your AI agent this URL: `https://github.com/xodn348/ai-native`

</details>

---

## Core Principles

> **"AI agents don't fail at coding — they fail at search, context management, and iterative refinement."**

| Principle | Implementation |
|---|---|
| **Navigation > Generation** | Explicit dependency graphs + LSP-aware tooling reduce search time |
| **Explicit > Implicit** | Descriptive names + typed errors eliminate semantic guessing |
| **Documentation = Code** | Agent-facing docs (AGENTS.md, schemas) reduce retries |

---

<details>
<summary><strong>Research & Evidence</strong></summary>

**Navigation & Architecture**
- Graph navigation: +40% localization vs retrieval ([arXiv:2602.20048](https://arxiv.org/abs/2602.20048))
- LSP-first lookup: up to 900× faster in controlled comparisons (50ms vs 45s)
- Semantic depth: -0.73 to -0.95 correlation with success (Xie et al. 2026)

**Naming & Documentation**
- Descriptive naming: +9% semantic similarity (Yakubov 2025)
- AGENTS.md: -40% correction iterations (60K+ repos)

**Type Safety & Context**
- TypeScript + Zod: -35% hallucinations ([BENCHMARKS.md](./BENCHMARKS.md))
- Context placement: -20+ points when info buried mid-context ([Chroma 2025](https://research.trychroma.com/context-rot))
- Token optimization: -85.5% for API specs ([LAPIS](https://arxiv.org/abs/2602.18541))

</details>

---

## Documentation

- [Implementation Checklist](./checklist.md)
- [Architecture Principles](./docs/principles/architecture.md)
- [Development Methodology](./docs/guides/development-methodology.md)
- [Contributing Guide](./CONTRIBUTING.md)

**Evidence-informed, not prompt folklore.** Treat headline metrics as directional until replicated in your codebase.

<details>
<summary><strong>Changelog</strong></summary>

### 2.3.5

- feat: ai-native setup now installs codesure automatically

### 2.3.4

- fix: remove AGENTS.md instruction from constitution, atomic upsert for shared JSON configs

### 2.3.3

- docs: remove outdated Smart Init section from What's New in v2

### 2.3.2

- docs: fix Smart Init Details — remove outdated AGENTS.md reference

### 2.3.1

- feat: automate README changelog on npm version
- feat!: remove AGENTS.md generation from init
- feat: remove constitution from AGENTS.md to eliminate triple injection
- feat: add README collapsible sections rule to constitution
- docs: collapse secondary sections with details tags, update init client table
- feat: add Codex and Claude Desktop support to init command
- Merge feat/v2: ai-native v2.0.0 — strengthened constitution + smart init
- docs: add detailed v2 changelog and smart init documentation
- feat!: strengthen constitution and add smart init for AGENTS.md

### 2.3.0

- feat!: remove AGENTS.md generation from init
- feat: remove constitution from AGENTS.md to eliminate triple injection
- feat: add README collapsible sections rule to constitution
- docs: collapse secondary sections with details tags, update init client table
- feat: add Codex and Claude Desktop support to init command
- Merge feat/v2: ai-native v2.0.0 — strengthened constitution + smart init
- docs: add detailed v2 changelog and smart init documentation
- feat!: strengthen constitution and add smart init for AGENTS.md

### 2.1.0

- **feat**: Add Codex and Claude Desktop support to `init` command (`.codex/ai-native.md`)
- **test**: 74 tests

### 2.0.0

- **breaking**: Constitution expanded from 40 to 66 lines with MUST/NEVER enforcement gates
- **feat**: Smart init — auto-detect package manager, runtime, framework, scripts from `package.json` and `tsconfig.json`
- **feat**: JSONC-safe `tsconfig.json` parsing (comments, trailing commas, URL `//` preservation)
- **feat**: Idempotency marker (`<!-- ai-native:managed -->`) prevents duplicate AGENTS.md sections
- **feat**: Auto-fill AGENTS.md template with detected project metadata
- **test**: 72 tests (parsers, constitution, init E2E)

### 1.1.2

- **docs**: Explain selective activation efficiency (Layer 1 code-only, Layer 2 on-demand)

### 1.1.1

- **docs**: README clarifications

### 1.0.0

- Initial release. Two-layer architecture, MCP server, setup/init commands, 16 guideline files.

</details>
