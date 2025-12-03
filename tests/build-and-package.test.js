import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import AdmZip from 'adm-zip';
import { buildExtension, packageExtension } from '../scripts/packaging.js';

describe('Build and packaging', () => {
  const projectRoot = resolve(process.cwd());
  const buildDir = resolve(projectRoot, 'out/test-build');
  const zipPath = resolve(projectRoot, 'out/test-flashdoc.zip');

  afterEach(() => {
    rmSync(buildDir, { recursive: true, force: true });
    rmSync(zipPath, { recursive: true, force: true });
  });

  it('builds extension assets without dev artifacts', () => {
    const builtPath = buildExtension({ projectRoot, outputDir: buildDir });

    expect(builtPath).toBe(buildDir);
    expect(existsSync(resolve(buildDir, 'manifest.json'))).toBe(true);
    expect(existsSync(resolve(buildDir, 'service-worker.js'))).toBe(true);
    expect(existsSync(resolve(buildDir, 'tests'))).toBe(false);
    expect(existsSync(resolve(buildDir, 'node_modules'))).toBe(false);
  });

  it('packages build into zip with required files', () => {
    const builtPath = buildExtension({ projectRoot, outputDir: buildDir });
    const zipOutput = packageExtension({ projectRoot, buildDir: builtPath, outputPath: zipPath });

    expect(zipOutput).toBe(zipPath);
    expect(existsSync(zipPath)).toBe(true);
    expect(statSync(zipPath).size).toBeGreaterThan(0);

    const zip = new AdmZip(zipPath);
    const entryNames = zip.getEntries().map(entry => entry.entryName);

    expect(entryNames).toContain('manifest.json');
    expect(entryNames).toContain('service-worker.js');
    expect(entryNames).toContain('icon128.png');
    expect(entryNames.some(name => name.startsWith('tests/'))).toBe(false);
  });
});
