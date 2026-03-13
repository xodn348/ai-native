import { describe, expect, it } from 'vitest';
import {
  generateAgentsMdSection,
  generateClaudeRules,
  generateCursorRules,
  generateSmartAgentsMd,
  generateWindsurfRules,
  getConstitution,
} from '../index.js';

describe('constitution and rules generation', () => {
  it('keeps constitution in 60-80 line range with enforcement keywords', () => {
    const constitution = getConstitution();
    const lines = constitution.split('\n').length;
    const estimatedTokens = Math.ceil(constitution.length / 4);

    expect(lines).toBeGreaterThanOrEqual(60);
    expect(lines).toBeLessThanOrEqual(80);
    expect(estimatedTokens).toBeLessThanOrEqual(1200);
    expect(constitution).toContain('MUST');
    expect(constitution).toContain('NEVER');
    expect(constitution).toContain('AGENTS.md');
    expect(constitution).toContain('TSDoc');
    expect(constitution).toContain('typed domain errors');
  });

  it('preserves five core sections', () => {
    const constitution = getConstitution();
    expect(constitution).toContain('## Naming');
    expect(constitution).toContain('## Type Safety');
    expect(constitution).toContain('## Functions');
    expect(constitution).toContain('## Error Handling');
    expect(constitution).toContain('## Architecture');
  });

  it('creates Claude rules with frontmatter paths', () => {
    const content = generateClaudeRules();
    expect(content).toMatch(/^---\npaths:/);
    expect(content).toContain('# AI-Native Coding Principles');
  });

  it('creates Cursor rules with alwaysApply', () => {
    const content = generateCursorRules();
    expect(content).toContain('alwaysApply: true');
    expect(content).toContain('# AI-Native Coding Principles');
  });

  it('creates Windsurf rules without frontmatter', () => {
    const content = generateWindsurfRules();
    expect(content).not.toMatch(/^---/);
    expect(content).toContain('# AI-Native Coding Principles');
  });

  it('generateAgentsMdSection returns constitution for backward compatibility', () => {
    const content = generateAgentsMdSection();
    expect(content).toContain('# AI-Native Coding Principles');
    expect(content).toContain('## Documentation');
  });

  it('generateSmartAgentsMd falls back to template when no project metadata', () => {
    const content = generateSmartAgentsMd(null, null);
    expect(content).toContain('# AGENTS.md Template');
    expect(content).toContain('<!-- auto:script-build -->');
  });

  it('generateSmartAgentsMd injects detected values when metadata exists', () => {
    const content = generateSmartAgentsMd(
      {
        scripts: {
          build: 'pnpm build',
          test: 'pnpm test',
          dev: 'pnpm dev',
          lint: 'pnpm lint',
          typecheck: 'pnpm typecheck',
        },
        packageManager: 'pnpm',
        runtime: 'node',
        framework: 'next',
        nodeVersion: '>=20',
      },
      {
        strict: true,
        target: 'ES2022',
      },
    );

    expect(content).toContain('<!-- ai-native:managed -->');
    expect(content).toContain('**Framework**: next');
    expect(content).toContain('pnpm build');
    expect(content).toContain('**Strict mode**: Enabled');
    expect(content).toContain('# AI-Native Coding Principles');
  });
});
