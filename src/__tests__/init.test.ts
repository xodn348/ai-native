import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

describe('init command', () => {
  let testDir: string;
  const distPath = join(process.cwd(), 'dist', 'index.js');

  beforeEach(() => {
    testDir = join(tmpdir(), `ai-native-test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should create all 4 rules files in empty directory', () => {
    const result = spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    expect(result.status).toBe(0);
    expect(existsSync(join(testDir, '.claude', 'rules', 'ai-native.md'))).toBe(true);
    expect(existsSync(join(testDir, '.cursor', 'rules', 'ai-native.mdc'))).toBe(true);
    expect(existsSync(join(testDir, '.windsurf', 'rules', 'ai-native.md'))).toBe(true);
    expect(existsSync(join(testDir, '.codex', 'ai-native.md'))).toBe(true);
    expect(existsSync(join(testDir, 'AGENTS.md'))).toBe(false);
  });

  it('should create .cursor/rules/ai-native.mdc with alwaysApply: true', () => {
    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const cursorRulesFile = join(testDir, '.cursor', 'rules', 'ai-native.mdc');
    const content = readFileSync(cursorRulesFile, 'utf-8');
    
    expect(content).toContain('alwaysApply: true');
    expect(content).toContain('description: AI-native coding principles for optimal AI agent interaction');
    expect(content).toContain('globs:');
  });

  it('should create .claude/rules/ai-native.md with paths frontmatter', () => {
    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const claudeRulesFile = join(testDir, '.claude', 'rules', 'ai-native.md');
    const content = readFileSync(claudeRulesFile, 'utf-8');
    
    expect(content).toMatch(/^---\npaths:/);
    expect(content).toContain('# AI-Native Coding Principles');
  });

  it('should create .windsurf/rules/ai-native.md without frontmatter', () => {
    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const windsurfRulesFile = join(testDir, '.windsurf', 'rules', 'ai-native.md');
    const content = readFileSync(windsurfRulesFile, 'utf-8');
    
    expect(content).not.toMatch(/^---/);
    expect(content).toMatch(/^# AI-Native Coding Principles/);
  });

  it('should create .codex/ai-native.md with constitution (no frontmatter)', () => {
    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const codexRulesFile = join(testDir, '.codex', 'ai-native.md');
    const content = readFileSync(codexRulesFile, 'utf-8');

    expect(content).not.toMatch(/^---/);
    expect(content).toMatch(/^# AI-Native Coding Principles/);
  });

  it('should overwrite existing rules files with current content', () => {
    const claudeRulesDir = join(testDir, '.claude', 'rules');
    mkdirSync(claudeRulesDir, { recursive: true });
    const claudeRulesFile = join(claudeRulesDir, 'ai-native.md');
    writeFileSync(claudeRulesFile, 'old content', 'utf-8');

    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const content = readFileSync(claudeRulesFile, 'utf-8');
    
    expect(content).not.toContain('old content');
    expect(content).toContain('# AI-Native Coding Principles');
  });

  it('should continue on error and create other files if one fails', () => {
    const result = spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    expect(result.status).toBe(0);
    expect(existsSync(join(testDir, '.cursor', 'rules', 'ai-native.mdc'))).toBe(true);
    expect(existsSync(join(testDir, '.windsurf', 'rules', 'ai-native.md'))).toBe(true);
    expect(existsSync(join(testDir, '.codex', 'ai-native.md'))).toBe(true);
  });
});
