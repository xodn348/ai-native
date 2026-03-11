#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { createRequire } from 'node:module';

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

  console.error('[ai-native setup] Done. Restart your AI clients to reload MCP configs.');
}

function printUsage(): void {
  console.error(`ai-native MCP Server

Commands:
  npx -y ai-native setup
    Auto-configure MCP for Claude Code, Claude Desktop, Cursor, and Codex CLI.

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
