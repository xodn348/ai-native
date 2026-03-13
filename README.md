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

## What's New in v2

- Layer 1 constitution expanded to 60-80 lines with stronger MUST/NEVER enforcement
- Top checklist rules now embedded directly in Layer 1 (AGENTS.md bootstrap, typed errors, TSDoc, explicit returns, no any)
- `init` now supports smart AGENTS generation from `package.json` and `tsconfig.json`
- Smart init auto-fills only high-confidence fields and leaves uncertain sections as placeholders

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

Creates 4 files in your project:

| Client | File | Features |
|--------|------|----------|
| Claude Code | `.claude/rules/ai-native.md` | `paths:` frontmatter (code-only) |
| Cursor | `.cursor/rules/ai-native.mdc` | `alwaysApply: true` |
| Windsurf | `.windsurf/rules/ai-native.md` | Plain markdown |
| OpenCode | `AGENTS.md` | Appended section (idempotent) |

Commit these files to share with your team.

### Two-Layer Architecture

**Layer 1 (Always-On)**: 60-80 line constitution in rules files (~900-1200 tokens/prompt)
- Auto-loaded by supported clients (Claude Code, Cursor, Windsurf, OpenCode) at session start
- Activates only for code files (via `paths:`/`globs:` frontmatter)
- Includes enforcement gates for naming, type safety, functions, errors, docs, architecture, verification
- **No MCP required** — works via native rules file support

**Layer 2 (On-Demand)**: 16 files (4000+ lines) via MCP tools
- **Requires MCP server** (configured via `setup` command)
- **Auto-triggered only in Claude Code** when creating new files/modules
- Other cases: Layer 1 applies automatically
- Comprehensive deep dives on specific topics
- Research citations, examples, benchmarks

### Why This Is Efficient

**Selective activation** = zero token waste:

- **Coding** (`.ts`, `.py`, `.java`, etc.) → constitution loads (~900-1200 tokens)
- **Everything else** (chat, docs, planning) → No constitution loaded (0 tokens)
- **New files/modules** (Claude Code only) → Layer 2 triggers for deep guidance

Traditional approach: Every prompt loads full guidelines (4000+ tokens), even for "fix this typo."

This approach: Guidelines activate only when writing code. Rest of the time, clean context.

### Updating

To get the latest constitution:

```bash
npx -y ai-native setup  # Updates global rules
npx -y ai-native init   # Updates project rules
```

### Smart Init Details

Running `npx -y ai-native init` now creates AGENTS.md in one of two modes:

- **Smart mode** (when `package.json` or `tsconfig.json` exists):
  - Auto-detects package manager, runtime, framework, and scripts
  - Parses JSONC-style `tsconfig.json` safely (comments and trailing commas)
  - Fills only reliable fields and keeps placeholders for uncertain project-specific details
- **Fallback mode** (when neither file exists):
  - Uses the AGENTS template with placeholders

This is backward compatible with existing `setup` and `init` workflows.

### Advanced: MCP Server

**Manual MCP Configuration** (if you prefer explicit config):

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

---

## Core Principles

> **"AI agents don't fail at coding — they fail at search, context management, and iterative refinement."**

| Principle | Implementation |
|---|---|
| **Navigation > Generation** | Explicit dependency graphs + LSP-aware tooling reduce search time |
| **Explicit > Implicit** | Descriptive names + typed errors eliminate semantic guessing |
| **Documentation = Code** | Agent-facing docs (AGENTS.md, schemas) reduce retries |

---

## Research & Evidence

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

---

## Documentation

- [Implementation Checklist](./checklist.md)
- [Architecture Principles](./docs/principles/architecture.md)
- [Development Methodology](./docs/guides/development-methodology.md)
- [Contributing Guide](./CONTRIBUTING.md)

**Evidence-informed, not prompt folklore.** Treat headline metrics as directional until replicated in your codebase.
