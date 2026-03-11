import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateClaudeRules } from '../index.js';

describe('Setup - Global Rules File Creation', () => {
  let testDir: string;
  let claudeRulesDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `ai-native-test-${Date.now()}`);
    claudeRulesDir = join(testDir, '.claude', 'rules');
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('File Creation', () => {
    it('should create directory structure if it does not exist', () => {
      expect(existsSync(claudeRulesDir)).toBe(false);

      mkdirSync(claudeRulesDir, { recursive: true });

      expect(existsSync(claudeRulesDir)).toBe(true);
    });

    it('should create ai-native.md with correct content', () => {
      mkdirSync(claudeRulesDir, { recursive: true });
      const content = generateClaudeRules();
      
      expect(content).toContain('---');
      expect(content).toContain('paths: **/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.py, **/*.go, **/*.rs, **/*.java, **/*.kt, **/*.rb, **/*.php, **/*.cs, **/*.cpp, **/*.c, **/*.swift');
      expect(content).toContain('# AI-Native Coding Principles');
    });
  });

  describe('Frontmatter Format', () => {
    it('should have correct paths frontmatter with unquoted comma-separated values', () => {
      const content = generateClaudeRules();
      const lines = content.split('\n');

      expect(lines[0]).toBe('---');
      expect(lines[1]).toBe('paths: **/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.py, **/*.go, **/*.rs, **/*.java, **/*.kt, **/*.rb, **/*.php, **/*.cs, **/*.cpp, **/*.c, **/*.swift');
      expect(lines[2]).toBe('---');
      expect(lines[3]).toBe('');
    });

    it('should not have quoted paths or array syntax', () => {
      const content = generateClaudeRules();

      expect(content).not.toMatch(/paths:\s*\[/);
      expect(content).not.toMatch(/paths:.*".*\*/);
    });

    it('should have paths on a single line', () => {
      const content = generateClaudeRules();
      const lines = content.split('\n');
      const pathsLine = lines.find((line) => line.startsWith('paths:'));

      expect(pathsLine).toBeDefined();
      expect(pathsLine).toContain('**/*.ts');
      expect(pathsLine).toContain('**/*.swift');
      expect(pathsLine).not.toMatch(/\\\s*$/);
    });
  });

  describe('Content Validation', () => {
    it('should have total line count ≤45', () => {
      const content = generateClaudeRules();
      const lines = content.split('\n');

      expect(lines.length).toBeLessThanOrEqual(45);
    });

    it('should contain all main sections', () => {
      const content = generateClaudeRules();

      expect(content).toContain('## Naming');
      expect(content).toContain('## Type Safety');
      expect(content).toContain('## Functions');
      expect(content).toContain('## Error Handling');
      expect(content).toContain('## Architecture');
    });
  });

  describe('Idempotency', () => {
    it('should produce identical content on multiple calls', () => {
      const firstRun = generateClaudeRules();
      const secondRun = generateClaudeRules();

      expect(firstRun).toBe(secondRun);
    });
  });
});
