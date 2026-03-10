#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

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

async function main(): Promise<void> {
  if (process.stdin.isTTY || process.stdout.isTTY) {
    console.error(`ai-native MCP Server

This is an MCP server. Add it to your AI editor:

Claude Code:   claude mcp add ai-native npx ai-native
Claude Desktop: Add to claude_desktop_config.json
Cursor:        Add to .cursor/mcp.json

Config: { "mcpServers": { "ai-native": { "command": "npx", "args": ["-y", "ai-native"] } } }`);
    return;
  }

  verifyContentFiles();

  const server = new McpServer({
    name: 'ai-native',
    version: '1.0.0',
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
