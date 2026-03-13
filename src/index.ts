#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import os from 'node:os';

const toolResponse = (text: string) => ({
  content: [{ type: 'text' as const, text }],
});

const contentRootCandidate = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const fallbackContentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const rootHasDocs = (() => {
  try {
    readFileSync(path.join(contentRootCandidate, 'checklist.md'), 'utf-8');
    return true;
  } catch {
    return false;
  }
})();

const contentRoot = rootHasDocs ? contentRootCandidate : fallbackContentRoot;

// Read version from package.json
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const version = packageJson.version;

const requiredContentFiles = [
  'docs/principles/architecture.md',
  'docs/principles/code-structure.md',
  'docs/principles/documentation.md',
  'docs/guides/naming.md',
  'docs/guides/error-handling.md',
  'docs/guides/function-design.md',
  'docs/guides/context-optimization.md',
  'docs/guides/development-methodology.md',
  'checklist.md',
  'templates/AGENTS.md',
  'templates/tsconfig.json',
  'templates/architecture.json',
  'research/papers.md',
  'BENCHMARKS.md',
  'experiments/naming-ab-test.md',
  'experiments/semantic-depth-ab-test.md',
];

type ScriptName = 'build' | 'test' | 'dev' | 'lint' | 'typecheck' | 'start';
type PackageManager = 'bun' | 'pnpm' | 'yarn' | 'npm';
type Runtime = 'bun' | 'node';
type Framework = 'next' | 'react' | 'express' | 'fastify' | 'hono' | 'nest';

export interface PackageInfo {
  scripts: Partial<Record<ScriptName, string>>;
  packageManager: PackageManager;
  runtime: Runtime;
  framework?: Framework;
  nodeVersion?: string;
}

export interface TsConfigInfo {
  strict?: boolean;
  target?: string;
}

const AI_NATIVE_MARKER = '<!-- ai-native:managed -->';

function readContent(relativePath: string): string {
  const filePath = path.resolve(contentRoot, relativePath);
  return readFileSync(filePath, 'utf-8');
}

function verifyContentFiles(): void {
  for (const relativePath of requiredContentFiles) {
    readContent(relativePath);
  }
}

function upsertJsonServer(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });

  let data: Record<string, unknown> = {};
  if (existsSync(filePath)) {
    const raw = readFileSync(filePath, 'utf-8').trim();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        data = parsed as Record<string, unknown>;
      }
    }
  }

  const existingServers = data.mcpServers;
  const servers =
    existingServers && typeof existingServers === 'object' && !Array.isArray(existingServers)
      ? (existingServers as Record<string, unknown>)
      : {};

  servers['ai-native'] = {
    command: 'npx',
    args: ['-y', 'ai-native'],
  };

  data.mcpServers = servers;
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function upsertCodexToml(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const sectionHeader = '[mcp_servers.ai-native]';
  const block = [sectionHeader, 'command = "npx"', 'args = ["-y", "ai-native"]', ''];

  const lines = existsSync(filePath) ? readFileSync(filePath, 'utf-8').split(/\r?\n/) : [];
  const start = lines.findIndex((line) => line.trim() === sectionHeader);

  if (start === -1) {
    if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
      lines.push('');
    }
    lines.push(...block);
  } else {
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^\s*\[/.test(lines[i])) {
        end = i;
        break;
      }
    }
    lines.splice(start, end - start, ...block);
  }

  writeFileSync(filePath, `${lines.join('\n').replace(/\n+$/, '\n')}`, 'utf-8');
}

function runSetup(): void {
  const home = process.env.HOME;
  if (!home) {
    throw new Error('HOME is not set. Cannot determine config directories.');
  }

  const claudeAdd = spawnSync('claude', ['mcp', 'add', 'ai-native', '--', 'npx', '-y', 'ai-native'], {
    stdio: 'ignore',
  });

  if (!claudeAdd.error && claudeAdd.status === 0) {
    console.error('[ai-native setup] Configured Claude Code via CLI.');
  } else {
    console.error('[ai-native setup] Claude CLI not found or add failed. Skipping Claude Code.');
  }

  const claudeDesktopConfig = path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  upsertJsonServer(claudeDesktopConfig);
  console.error(`[ai-native setup] Configured Claude Desktop MCP config at ${claudeDesktopConfig}.`);

  const cursorConfig = path.join(home, '.cursor', 'mcp.json');
  upsertJsonServer(cursorConfig);
  console.error(`[ai-native setup] Configured Cursor global MCP config at ${cursorConfig}.`);

  const codexConfig = path.join(home, '.codex', 'config.toml');
  upsertCodexToml(codexConfig);
  console.error(`[ai-native setup] Configured Codex CLI MCP config at ${codexConfig}.`);

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

  console.error('[ai-native setup] Done. Restart your AI clients to reload MCP configs.');
}

export function getConstitution(): string {
  return `# AI-Native Coding Principles
# Generated by ai-native (https://github.com/xodn348/ai-native)
# Research-backed guidelines for AI-optimized code.

## Naming
- MUST use descriptive names that reveal intent: getUserById, not get, data, tmp, result
- MUST match name length to scope: short in lambdas, descriptive in public APIs
- NEVER use ambiguous names for exported APIs when intent can be explicit
- Research: +9% semantic similarity (Yakubov 2025)

## Type Safety
- NEVER use \`any\` in production code; use \`unknown\` and narrow with type guards
- MUST validate ALL external inputs at system boundaries (Zod, Pydantic, JSON Schema)
- MUST declare explicit return types for every exported function
- MUST define interfaces/types before implementation for public contracts
- Research: -35% hallucination rate with typed + validated stacks

## Functions
- MUST keep functions under 50 lines (target 30); split if longer
- MUST keep one function = one responsibility; if you need "and", split it
- MUST use guard clauses (early returns) instead of deep nesting
- NEVER hide side effects in utility functions; be explicit in names and signatures
- Research: semantic depth correlates -0.73 to -0.95 with AI success rate

## Error Handling
- NEVER throw generic \`new Error(...)\` for domain failures
- MUST create typed domain errors with \`code\` (string), \`retryable\` (boolean), \`userMessage\`
- MUST include diagnostic context for recoverable failures
- NEVER swallow errors; catch only to add context or recover explicitly
- Handle errors at the right abstraction level, never catch-and-ignore

## Architecture
- MUST use explicit dependency injection and avoid hidden global state
- MUST keep dependencies one-directional (no circular imports)
- MUST give each module a single entry point (index.ts or equivalent)
- MUST keep files in 150-400 lines when feasible; split if larger
- MUST put public contracts (types/APIs) near the top of files
- Research: +40% code localization improvement (LocAgent, ACL 2025)

## Documentation
- MUST add TSDoc to ALL exported functions
- MUST include \`@param\` with constraints, \`@returns\` with format, \`@throws\` with conditions
- MUST include \`@example\` for non-trivial exported functions
- NEVER write comments that restate obvious code; explain intent and constraints
- MUST use \`<details>\` in README for secondary sections (changelog, internal architecture, advanced config); keep install, usage, and core features visible

## Verification
- MUST run typecheck and tests before claiming completion
- MUST verify changed files compile in strict mode before final output
- NEVER claim "done" without command evidence when tooling is available
- MUST keep fixes reversible and scoped to requested changes

## Security Baseline
- MUST validate untrusted input at boundaries before business logic
- NEVER hardcode secrets; use environment variables or secret managers
- MUST use safe defaults for auth, permissions, and data exposure
- NEVER bypass sanitization or schema validation in production paths

## Context Discipline
- MUST keep critical contracts near top of files for faster retrieval
- MUST keep related code close to reduce context dilution
- NEVER bury public APIs in long files without section markers
- MUST prefer explicit over clever abstractions for maintainability

## When Creating New Files or Modules
If this project has no AGENTS.md, you MUST create one before writing code.
Call get_template("AGENTS.md") from ai-native MCP tools and fill project-specific sections.
Before writing new files or modules, you MUST call get_checklist() from ai-native MCP tools.
For deeper guidance, call get_guide("naming"), get_guide("error-handling"), etc.`;
}

export function generateClaudeRules(): string {
  const constitution = getConstitution();
  return `---
paths: **/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.py, **/*.go, **/*.rs, **/*.java, **/*.kt, **/*.rb, **/*.php, **/*.cs, **/*.cpp, **/*.c, **/*.swift
---

${constitution}`;
}

export function generateCursorRules(): string {
  const constitution = getConstitution();
  return `---
description: AI-native coding principles for optimal AI agent interaction
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.py", "**/*.go", "**/*.rs", "**/*.java", "**/*.kt", "**/*.rb", "**/*.php", "**/*.cs", "**/*.cpp", "**/*.c", "**/*.swift"]
alwaysApply: true
---

${constitution}`;
}

export function generateWindsurfRules(): string {
  return getConstitution();
}

export function generateCodexRules(): string {
  return getConstitution();
}

export function generateAgentsMdSection(): string {
  const constitution = getConstitution();
  return constitution;
}

export function stripJsonComments(text: string): string {
  let result = '';
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const current = text[index] ?? '';
    const next = text[index + 1] ?? '';

    if (inLineComment) {
      if (current === '\n') {
        inLineComment = false;
        result += current;
      }
      continue;
    }

    if (inBlockComment) {
      if (current === '*' && next === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (!inString && current === '/' && next === '/') {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (!inString && current === '/' && next === '*') {
      inBlockComment = true;
      index += 1;
      continue;
    }

    result += current;

    if (current === '"' && !escaped) {
      inString = !inString;
    }

    escaped = current === '\\' && !escaped;
    if (current !== '\\') {
      escaped = false;
    }
  }

  return result.replace(/,(\s*[}\]])/g, '$1');
}

function detectPackageManager(projectDir: string, packageManagerField: unknown): PackageManager {
  if (typeof packageManagerField === 'string' && packageManagerField.length > 0) {
    const normalized = packageManagerField.split('@')[0]?.toLowerCase();
    if (normalized === 'bun' || normalized === 'pnpm' || normalized === 'yarn' || normalized === 'npm') {
      return normalized;
    }
  }

  if (existsSync(path.join(projectDir, 'bun.lockb'))) return 'bun';
  if (existsSync(path.join(projectDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(path.join(projectDir, 'yarn.lock'))) return 'yarn';
  if (existsSync(path.join(projectDir, 'package-lock.json'))) return 'npm';

  return 'npm';
}

function detectFramework(dependencies: Record<string, unknown>, devDependencies: Record<string, unknown>): Framework | undefined {
  const allDeps = { ...dependencies, ...devDependencies };

  if ('next' in allDeps) return 'next';
  if ('react' in allDeps) return 'react';
  if ('express' in allDeps) return 'express';
  if ('fastify' in allDeps) return 'fastify';
  if ('hono' in allDeps) return 'hono';
  if ('@nestjs/core' in allDeps) return 'nest';

  return undefined;
}

export function parsePackageJson(projectDir: string): PackageInfo | null {
  try {
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
      return null;
    }

    const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts?: Record<string, string>;
      packageManager?: string;
      engines?: { node?: string };
      dependencies?: Record<string, unknown>;
      devDependencies?: Record<string, unknown>;
    };

    const scripts = parsed.scripts ?? {};
    const dependencies = parsed.dependencies ?? {};
    const devDependencies = parsed.devDependencies ?? {};
    const runtime: Runtime = ('bun-types' in devDependencies || existsSync(path.join(projectDir, 'bun.lockb'))) ? 'bun' : 'node';

    return {
      scripts: {
        build: scripts.build,
        test: scripts.test,
        dev: scripts.dev,
        lint: scripts.lint,
        typecheck: scripts.typecheck,
        start: scripts.start,
      },
      packageManager: detectPackageManager(projectDir, parsed.packageManager),
      runtime,
      framework: detectFramework(dependencies, devDependencies),
      nodeVersion: parsed.engines?.node,
    };
  } catch {
    return null;
  }
}

export function parseTsConfig(projectDir: string): TsConfigInfo | null {
  try {
    const tsconfigPath = path.join(projectDir, 'tsconfig.json');
    if (!existsSync(tsconfigPath)) {
      return null;
    }

    const rawTsconfig = readFileSync(tsconfigPath, 'utf-8');
    const cleanedTsconfig = stripJsonComments(rawTsconfig);
    const parsed = JSON.parse(cleanedTsconfig) as {
      compilerOptions?: { strict?: boolean; target?: string };
    };

    return {
      strict: parsed.compilerOptions?.strict,
      target: parsed.compilerOptions?.target,
    };
  } catch {
    return null;
  }
}

function safeValue(value: string | undefined, fallback: string): string {
  if (value === undefined || value.trim().length === 0) {
    return fallback;
  }
  return value;
}

export function generateSmartAgentsMd(packageInfo: PackageInfo | null, tsConfigInfo: TsConfigInfo | null): string {
  if (packageInfo === null && tsConfigInfo === null) {
    return `${AI_NATIVE_MARKER}\n${readContent('templates/AGENTS.md')}`;
  }

  const framework = packageInfo?.framework ?? '[Your framework]';
  const packageManager = packageInfo?.packageManager ?? '[npm/pnpm/yarn]';
  const runtime = packageInfo?.runtime ?? '[Node.js/Deno/Bun/Edge Runtime]';
  const nodeVersion = packageInfo?.nodeVersion ?? '[Node version]';
  const strictMode = tsConfigInfo?.strict === undefined ? '[Enabled/Disabled]' : tsConfigInfo.strict ? 'Enabled' : 'Disabled';

  return `${AI_NATIVE_MARKER}
# AGENTS.md

## Project Context
- **Framework**: ${framework}
- **Database**: [Your database] (version)
- **Auth**: [Your auth solution] (version)
- **Styling**: [Your styling solution] (version)
- **Package Manager**: ${packageManager}
- **Node Version**: ${nodeVersion}
- **Runtime**: ${runtime}

## Development Workflow

\`\`\`bash
# Install dependencies
${packageManager} install

# Development server
${safeValue(packageInfo?.scripts.dev, '[your dev command]')}

# Build for production
${safeValue(packageInfo?.scripts.build, '[your build command]')}

# Run tests
${safeValue(packageInfo?.scripts.test, '[your test command]')}           # All tests
[your test:watch command]     # Watch mode
[your test:e2e command]       # E2E tests

# Linting and formatting
${safeValue(packageInfo?.scripts.lint, '[your lint command]')}           # Check
[your lint:fix command]       # Auto-fix

# Type checking
${safeValue(packageInfo?.scripts.typecheck, '[your typecheck command]')}
\`\`\`

## TypeScript (if applicable)
- **Strict mode**: ${strictMode}
- **Target**: ${tsConfigInfo?.target ?? '[ES2022/ESNext/etc]'}
- **NO \`any\` type** (use \`unknown\` and narrow)
- **Explicit return types** for exported functions

${getConstitution()}`;
}

function runInit(): void {
  const cwd = process.cwd();
  
  // Warn if running in home directory
  if (cwd === os.homedir()) {
    console.error('[ai-native init] Warning: Running in home directory. This will create rules files in ~/ which is probably not intended.');
  }

  // 1. Create .claude/rules/ai-native.md (Claude Code + Claude Desktop)
  try {
    const claudeRulesDir = path.join(cwd, '.claude', 'rules');
    mkdirSync(claudeRulesDir, { recursive: true });
    const claudeRulesFile = path.join(claudeRulesDir, 'ai-native.md');
    writeFileSync(claudeRulesFile, generateClaudeRules(), 'utf-8');
    console.error(`[ai-native init] Created ${path.relative(cwd, claudeRulesFile)} (Claude Code / Claude Desktop)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ai-native init] Warning: Failed to create .claude/rules/ai-native.md: ${message}`);
  }

  // 2. Create .cursor/rules/ai-native.mdc
  try {
    const cursorRulesDir = path.join(cwd, '.cursor', 'rules');
    mkdirSync(cursorRulesDir, { recursive: true });
    const cursorRulesFile = path.join(cursorRulesDir, 'ai-native.mdc');
    writeFileSync(cursorRulesFile, generateCursorRules(), 'utf-8');
    console.error(`[ai-native init] Created ${path.relative(cwd, cursorRulesFile)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ai-native init] Warning: Failed to create .cursor/rules/ai-native.mdc: ${message}`);
  }

  // 3. Create .windsurf/rules/ai-native.md
  try {
    const windsurfRulesDir = path.join(cwd, '.windsurf', 'rules');
    mkdirSync(windsurfRulesDir, { recursive: true });
    const windsurfRulesFile = path.join(windsurfRulesDir, 'ai-native.md');
    writeFileSync(windsurfRulesFile, generateWindsurfRules(), 'utf-8');
    console.error(`[ai-native init] Created ${path.relative(cwd, windsurfRulesFile)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ai-native init] Warning: Failed to create .windsurf/rules/ai-native.md: ${message}`);
  }

  // 4. Create .codex/ai-native.md (Codex CLI)
  try {
    const codexRulesDir = path.join(cwd, '.codex');
    mkdirSync(codexRulesDir, { recursive: true });
    const codexRulesFile = path.join(codexRulesDir, 'ai-native.md');
    writeFileSync(codexRulesFile, generateCodexRules(), 'utf-8');
    console.error(`[ai-native init] Created ${path.relative(cwd, codexRulesFile)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ai-native init] Warning: Failed to create .codex/ai-native.md: ${message}`);
  }

  // 5. Append to AGENTS.md (idempotent)
  try {
    const agentsMdFile = path.join(cwd, 'AGENTS.md');
    const packageInfo = parsePackageJson(cwd);
    const tsConfigInfo = parseTsConfig(cwd);
    const section = generateSmartAgentsMd(packageInfo, tsConfigInfo);
    
    if (existsSync(agentsMdFile)) {
      const content = readFileSync(agentsMdFile, 'utf-8');
      if (content.includes('# AI-Native Coding Principles') || content.includes(AI_NATIVE_MARKER)) {
        console.error('[ai-native init] AGENTS.md already contains ai-native section, skipping.');
      } else {
        writeFileSync(agentsMdFile, content + '\n\n' + section, 'utf-8');
        console.error(`[ai-native init] Appended ai-native section to ${path.relative(cwd, agentsMdFile)}`);
      }
    } else {
      writeFileSync(agentsMdFile, section, 'utf-8');
      console.error(`[ai-native init] Created ${path.relative(cwd, agentsMdFile)}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ai-native init] Warning: Failed to update AGENTS.md: ${message}`);
  }

  console.error('[ai-native init] Done. Per-project rules files created for Claude Code, Claude Desktop, Cursor, Windsurf, Codex, and OpenCode.');
}

function printUsage(): void {
  console.error(`ai-native MCP Server

Commands:
  npx -y ai-native setup
    Auto-configure MCP for Claude Code, Claude Desktop, Cursor, and Codex CLI.

  npx -y ai-native init
    Create per-project rules files (.claude/rules, .cursor/rules, .windsurf/rules, .codex, AGENTS.md).

  npx -y ai-native
    Run stdio MCP server (used by AI clients).

Manual config value:
  { "mcpServers": { "ai-native": { "command": "npx", "args": ["-y", "ai-native"] } } }`);
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (command === 'setup') {
    runSetup();
    return;
  }

  if (command === 'init') {
    runInit();
    return;
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  if (process.stdin.isTTY || process.stdout.isTTY) {
    printUsage();
    return;
  }

  verifyContentFiles();

  const server = new McpServer({
    name: 'ai-native',
    version,
  });

  server.registerTool(
    'get_principles',
    {
      description:
        'Get core architectural principles. Use when designing system structure, module boundaries, or documentation strategy.',
      inputSchema: {
        topic: z.enum(['architecture', 'code-structure', 'documentation']),
      },
    },
    async ({ topic }) => toolResponse(readContent(`docs/principles/${topic}.md`)),
  );

  server.registerTool(
    'get_guide',
    {
      description:
        'Get practical implementation guides. Use when writing code, naming variables/functions, handling errors, or optimizing for AI agents.',
      inputSchema: {
        topic: z.enum([
          'naming',
          'error-handling',
          'function-design',
          'context-optimization',
          'development-methodology',
        ]),
      },
    },
    async ({ topic }) => toolResponse(readContent(`docs/guides/${topic}.md`)),
  );

  server.registerTool(
    'get_checklist',
    {
      description:
        'Get the AI-native codebase implementation checklist. Use to audit existing code or plan new projects.',
      inputSchema: {},
    },
    async () => toolResponse(readContent('checklist.md')),
  );

  server.registerTool(
    'get_template',
    {
      description: 'Get project template files. Use when setting up a new AI-native project.',
      inputSchema: {
        name: z.enum(['AGENTS.md', 'tsconfig.json', 'architecture.json']),
      },
    },
    async ({ name }) => toolResponse(readContent(`templates/${name}`)),
  );

  server.registerTool(
    'get_research',
    {
      description:
        'Get research paper citations and findings. Use when validating approaches or citing evidence.',
      inputSchema: {},
    },
    async () => toolResponse(readContent('research/papers.md')),
  );

  server.registerTool(
    'get_benchmarks',
    {
      description:
        'Get benchmark data and A/B test results. Use when evaluating impact or comparing approaches.',
      inputSchema: {},
    },
    async () => toolResponse(readContent('BENCHMARKS.md')),
  );

  server.registerTool(
    'get_experiment',
    {
      description:
        'Get detailed experiment methodology and results. Use when replicating studies or understanding test design.',
      inputSchema: {
        name: z.enum(['naming-ab-test', 'semantic-depth-ab-test']),
      },
    },
    async ({ name }) => toolResponse(readContent(`experiments/${name}.md`)),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
