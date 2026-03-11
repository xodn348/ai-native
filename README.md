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

---

## How to Use

### Quick Start: One-Time Setup (Recommended)

Run once to configure AI clients globally:

```bash
npx -y ai-native setup
```

This command:
- Registers `ai-native` MCP server with Claude Code, Claude Desktop, Cursor, and Codex CLI
- Creates `~/.claude/rules/ai-native.md` (global rules for Claude Code, code-files-only)

After setup, restart your AI clients. The constitution applies automatically when working with code files.

Requires Node.js 18+.

### Per-Project Setup (Optional)

For team sharing or Cursor/Windsurf/OpenCode users:

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

**Layer 1 (Always-On)**: 40-line constitution in rules files (~600 tokens/prompt)
- Auto-loaded by AI clients at session start
- Activates only for code files (via `paths:`/`globs:` frontmatter)
- 5 highest-impact principles: naming, type safety, functions, errors, architecture

**Layer 2 (On-Demand)**: 16 files (4000+ lines) via MCP tools
- Called when triggered by constitution (e.g., `get_checklist()` before creating new modules)
- Comprehensive deep dives on specific topics
- Research citations, examples, benchmarks

### Updating

To get the latest constitution:

```bash
npx -y ai-native setup  # Updates global rules
npx -y ai-native init   # Updates project rules
```

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
