# AI-Native Codebase Framework

> **Evidence-based guidelines for building codebases optimized for AI agent interaction**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Research Papers](https://img.shields.io/badge/Research-25%2B%20Papers-blue)](./research/papers.md)
[![Industry Validated](https://img.shields.io/badge/Industry-Production%20Proven-green)](./BENCHMARKS.md)

**Give this URL to any AI agent** — It will understand how to build AI-friendly codebases.

---

## Why AI-Native?

**72-81% of AI agent failures are localization failures, not generation failures.** Agents struggle to find the right files and functions, not write code.

Traditional codebases force agents to repeatedly load large contexts, infer implicit dependencies, and re-scan modules. **AI-native structure eliminates this waste.**

### Quantified Impact

| Improvement | Impact | Source |
|---|---:|---|
| Token usage per task | **-23 to -54%** | [SWE-Pruner](https://arxiv.org/abs/2601.16746) |
| Code localization | **+40%** | [Navigation Paradox](https://arxiv.org/abs/2602.20048) |
| Critical bug detection | **+67%** | [Our A/B test](./experiments/semantic-depth-ab-test.md) |
| Hallucination rate | **-35%** | [Industry benchmarks](./BENCHMARKS.md) |
| Correction iterations | **-40%** | [AGENTS.md analysis](./BENCHMARKS.md) |

**ROI for 10-developer team**: $33K–$66K/year API savings + ~500 hours/year recovered.

---

## How to Use

**Default (simplest): URL-only**
- Give your AI agent this URL.
- Start coding immediately.
- This is enough for short tasks and experiments.

**Optional (recommended for long-term projects): Quick Start**
- Run setup once to add local agent context files.
- Then collaborate with your AI agent to optimize `AGENTS.md` and architecture layout for your real stack.

## Quick Start

```bash
# Download templates
curl -fsSL -o AGENTS.md https://raw.githubusercontent.com/xodn348/ai-native/main/templates/AGENTS.md
curl -fsSL -o tsconfig.json https://raw.githubusercontent.com/xodn348/ai-native/main/templates/tsconfig.json
curl -fsSL -o architecture.json https://raw.githubusercontent.com/xodn348/ai-native/main/templates/architecture.json

# Organize files
mkdir -p .ai && mv -f architecture.json .ai/

# Verify setup
test -f AGENTS.md && test -f tsconfig.json && test -f .ai/architecture.json && echo "✓ Setup complete"

# Ask your AI agent to optimize AGENTS.md for your stack and constraints
# Example prompt:
# "Read AGENTS.md and this repo. Rewrite AGENTS.md for Next.js + pnpm + PostgreSQL.
# Add exact build/test/lint commands and non-negotiable architecture constraints."
```

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
- LSP-first lookup: 900× faster (50ms vs 45s, Teymoori 2025)
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

**Built with evidence, not hype.** Every recommendation is backed by peer-reviewed research or production data.
