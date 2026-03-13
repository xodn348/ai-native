import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parsePackageJson, parseTsConfig, stripJsonComments } from '../index.js';

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = join(tmpdir(), `ai-native-parsers-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('stripJsonComments', () => {
  it('removes line comments and block comments', () => {
    const raw = `{
  // line comment
  "name": "ai-native", /* block comment */
  "value": 1
}`;

    const cleaned = stripJsonComments(raw);
    expect(cleaned).not.toContain('// line comment');
    expect(cleaned).not.toContain('/* block comment */');
    expect(cleaned).toContain('"name": "ai-native"');
  });

  it('preserves URL strings with // inside literals', () => {
    const raw = '{"url":"https://example.com", "ok": true}';
    const cleaned = stripJsonComments(raw);
    expect(cleaned).toContain('https://example.com');
  });

  it('strips trailing commas before object and array closers', () => {
    const raw = '{"a": 1, "b": [1,2,],}';
    const cleaned = stripJsonComments(raw);
    expect(() => JSON.parse(cleaned)).not.toThrow();
  });
});

describe('parseTsConfig', () => {
  it('returns strict and target from tsconfig with comments and trailing commas', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'tsconfig.json'),
      `{
  "compilerOptions": {
    // strict is enabled
    "strict": true,
    "target": "ES2022",
  }
}`,
      'utf-8',
    );

    expect(parseTsConfig(dir)).toEqual({ strict: true, target: 'ES2022' });
  });

  it('returns null when tsconfig is missing', () => {
    const dir = makeTempDir();
    expect(parseTsConfig(dir)).toBeNull();
  });
});

describe('parsePackageJson', () => {
  it('extracts scripts, package manager, runtime, and framework', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify(
        {
          scripts: {
            build: 'pnpm build',
            test: 'pnpm test',
            dev: 'pnpm dev',
            lint: 'pnpm lint',
            typecheck: 'pnpm typecheck',
          },
          packageManager: 'pnpm@9.0.0',
          engines: { node: '>=20' },
          dependencies: { next: '^15.0.0', react: '^19.0.0' },
        },
        null,
        2,
      ),
      'utf-8',
    );

    const parsed = parsePackageJson(dir);
    expect(parsed?.scripts.build).toBe('pnpm build');
    expect(parsed?.packageManager).toBe('pnpm');
    expect(parsed?.runtime).toBe('node');
    expect(parsed?.framework).toBe('next');
    expect(parsed?.nodeVersion).toBe('>=20');
  });

  it('detects bun runtime and package manager from lock + bun-types', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify(
        {
          scripts: { test: 'bun test' },
          devDependencies: { 'bun-types': 'latest' },
        },
        null,
        2,
      ),
      'utf-8',
    );
    writeFileSync(join(dir, 'bun.lockb'), '', 'utf-8');

    const parsed = parsePackageJson(dir);
    expect(parsed?.runtime).toBe('bun');
    expect(parsed?.packageManager).toBe('bun');
  });

  it('returns null when package.json is missing', () => {
    const dir = makeTempDir();
    expect(parsePackageJson(dir)).toBeNull();
  });
});
