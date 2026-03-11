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

  it('should create all 4 files in empty directory', () => {
    const result = spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    expect(result.status).toBe(0);
    expect(existsSync(join(testDir, '.claude', 'rules', 'ai-native.md'))).toBe(true);
    expect(existsSync(join(testDir, '.cursor', 'rules', 'ai-native.mdc'))).toBe(true);
    expect(existsSync(join(testDir, '.windsurf', 'rules', 'ai-native.md'))).toBe(true);
    expect(existsSync(join(testDir, 'AGENTS.md'))).toBe(true);
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

  it('should create AGENTS.md with ai-native section when file does not exist', () => {
    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const agentsMdFile = join(testDir, 'AGENTS.md');
    const content = readFileSync(agentsMdFile, 'utf-8');
    
    expect(content).toContain('# AI-Native Coding Principles');
    expect(content).toContain('## Naming');
    expect(content).toContain('## Type Safety');
  });

  it('should append to existing AGENTS.md and preserve existing content', () => {
    const agentsMdFile = join(testDir, 'AGENTS.md');
    const existingContent = '# My Project\n\nExisting documentation here.';
    writeFileSync(agentsMdFile, existingContent, 'utf-8');

    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const content = readFileSync(agentsMdFile, 'utf-8');
    
    expect(content).toContain('# My Project');
    expect(content).toContain('Existing documentation here.');
    expect(content).toContain('# AI-Native Coding Principles');
    expect(content.indexOf('# My Project')).toBeLessThan(content.indexOf('# AI-Native Coding Principles'));
  });

  it('should be idempotent - running init twice does not duplicate AGENTS.md section', () => {
    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const agentsMdFile = join(testDir, 'AGENTS.md');
    const content = readFileSync(agentsMdFile, 'utf-8');
    
    const matches = content.match(/# AI-Native Coding Principles/g);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(1);
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

  it('should skip AGENTS.md append if section already exists', () => {
    const agentsMdFile = join(testDir, 'AGENTS.md');
    const existingContent = '# My Project\n\n# AI-Native Coding Principles\n\nAlready here.';
    writeFileSync(agentsMdFile, existingContent, 'utf-8');

    const result = spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    const content = readFileSync(agentsMdFile, 'utf-8');
    
    expect(result.stderr).toContain('already contains ai-native section, skipping');
    expect(content).toBe(existingContent);
  });

  it('should continue on error and create other files if one fails', () => {
    const claudeRulesDir = join(testDir, '.claude', 'rules');
    mkdirSync(claudeRulesDir, { recursive: true });
    const claudeRulesFile = join(claudeRulesDir, 'ai-native.md');
    writeFileSync(claudeRulesFile, '', 'utf-8');
    mkdirSync(join(testDir, '.readonly'), { recursive: true });
    const readonlyFile = join(testDir, '.readonly', 'test');
    writeFileSync(readonlyFile, '', 'utf-8');

    const result = spawnSync('node', [distPath, 'init'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    expect(result.status).toBe(0);
    expect(existsSync(join(testDir, '.cursor', 'rules', 'ai-native.mdc'))).toBe(true);
    expect(existsSync(join(testDir, '.windsurf', 'rules', 'ai-native.md'))).toBe(true);
    expect(existsSync(join(testDir, 'AGENTS.md'))).toBe(true);
  });
});
