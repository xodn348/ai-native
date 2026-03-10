# AI-Native Codebase Framework

> **Evidence-based guidelines for building codebases optimized for AI agent interaction**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Research Papers](https://img.shields.io/badge/Research-25%2B%20Papers-blue)](./research/papers.md)
[![Industry Validated](https://img.shields.io/badge/Industry-Production%20Proven-green)](./BENCHMARKS.md)

**Give this URL to any AI agent** → It will understand how to build AI-friendly codebases.

---

## Why AI-Native?

### The Problem: AI Agents Fail at Search, Not Coding

**72-81% of agent failures are localization failures, not generation failures** on SWE-Bench style tasks where agents cannot find the right files/functions quickly.

Traditional codebases force agents to:
- Load large irrelevant context windows repeatedly
- Infer implicit architecture and hidden dependencies
- Re-scan the same modules across iterations

This is not about "AI-generated code". It is about making your codebase legible to agents so they can assist humans faster and more reliably.

### Quantified Impact and Business Value

| Improvement | Measured Impact | Evidence |
|---|---:|---|
| Token usage per task | **23-54% lower** | [SWE-Pruner, 2026](https://arxiv.org/abs/2601.16746) |
| Code localization accuracy | **+40%** | [Navigation Paradox, 2026](https://arxiv.org/abs/2602.20048) |
| Critical bug detection | **+67%** | [This repo A/B test](./experiments/semantic-depth-ab-test.md) |
| Hallucination rate | **-35%** | Industry data in [BENCHMARKS.md](./BENCHMARKS.md) |
| Correction iterations | **-40%** | [AGENTS.md adoption analysis](./BENCHMARKS.md) |

For a 10-developer team using coding agents daily, these ranges typically map to **$33K-$66K/year API savings** plus **~500 developer-hours/year recovered** (assumption model: 50 prompts/dev/day, 250 workdays, 30-50% context reduction).

### Should this be URL, npm, or something else?

Use a **hybrid strategy**:
1. **Canonical source = URL** (this repo) for zero-install, always-latest guidance.
2. **Project-local AGENTS.md** as a thin adapter with project specifics.
3. Optional **global user-level agent config** for personal defaults, then override per project.

This avoids npm/version overhead while preventing repeated manual setup in every repo.

---

## Quick Start (60 Seconds)

```bash
# 1. Copy templates to your project
curl -O https://raw.githubusercontent.com/xodn348/ai-native/main/templates/AGENTS.md
curl -O https://raw.githubusercontent.com/xodn348/ai-native/main/templates/tsconfig.json
curl -O https://raw.githubusercontent.com/xodn348/ai-native/main/templates/architecture.json

# 2. Create .ai directory
mkdir .ai
mv architecture.json .ai/

# 3. Customize AGENTS.md for your stack
nano AGENTS.md

# 4. Done! Your codebase is now AI-friendly
```

---

## Core Principle

> **"AI agents don't fail at coding — they fail at search, context management, and iterative refinement."**

### The Three Pillars

| Pillar | Description |
|---|---|
| **Navigation > Generation** | Explicit dependency paths and graph-aware structure reduce search thrash before code generation starts. |
| **Explicit > Implicit** | Descriptive names, typed errors, and visible constraints reduce semantic guessing. |
| **Documentation IS Code** | Agent-facing docs (AGENTS.md, schemas, examples) reduce retries and drift. |

See Research & Evidence below for quantitative support.

---

## Research & Evidence

### Navigation and Architecture
- **Graph navigation over naive retrieval**: +40% localization accuracy ([arXiv:2602.20048](https://arxiv.org/abs/2602.20048)).
- **LSP-first lookup**: ~900x faster symbol resolution (50ms vs 45s) in practical workflows (Amir Teymoori, 2025).
- **Semantic depth (LM-CC)**: -0.73 to -0.95 correlation with agent success (Xie et al., 2026; summarized in [BENCHMARKS.md](./BENCHMARKS.md)).

### Naming and Documentation
- **Descriptive naming**: +9% semantic similarity and higher first-attempt accuracy (Yakubov, 2025; [BENCHMARKS.md](./BENCHMARKS.md)).
- **AGENTS.md standardization**: ~40% fewer correction iterations in large-scale adoption analyses ([openai/agents.md](https://github.com/openai/agents.md)).

### Type Safety and Validation
- **TypeScript + schema validation**: ~35% lower hallucination/error rate in integration-heavy tasks (industry benchmark summary in [BENCHMARKS.md](./BENCHMARKS.md)).

### Context and Debugging Efficiency
- **Context placement effect**: 20+ point accuracy drop when critical details are buried mid-context ([Chroma Context Rot, 2025](https://research.trychroma.com/context-rot)).
- **Debugging decay**: 60-80% effectiveness loss after repeated failed attempts (Nature report summary in [BENCHMARKS.md](./BENCHMARKS.md)).
- **Token-optimized representations**: 85.5% token reduction for API specs in LLM contexts ([LAPIS, 2026](https://arxiv.org/abs/2602.18541)).

---

For complete documentation, see:
- [Complete Checklist](./checklist.md)
- [Architecture Principles](./docs/principles/architecture.md)
- [Development Methodology](./docs/guides/development-methodology.md)
- [Contributing Guide](./CONTRIBUTING.md)

**Built with evidence, not hype. Every recommendation is backed by academic research or production data.**

**Give this URL to any AI agent → It has everything needed to build AI-native codebases.**
