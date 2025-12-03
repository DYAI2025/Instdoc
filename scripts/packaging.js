import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import AdmZip from 'adm-zip';

const defaultExcludes = new Set(['.git', '.github', 'node_modules', 'out']);
const excludedTopLevel = new Set(['tests', 'scripts']);
const excludedFiles = new Set([
  'package-lock.json',
  'vitest.config.js',
  '.gitignore',
  'README.md',
  'TESTING.md',
  'PRODUCTION-READY.md',
  'SMOKE-TESTS.md',
  'AGENTS.md',
  'test-flashdoc.html',
  'create-icons.html'
]);
const requiredFiles = [
  'manifest.json',
  'service-worker.js',
  'content.js',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'icon16.png',
  'icon48.png',
  'icon128.png'
];

export function buildExtension({ projectRoot = process.cwd(), outputDir } = {}) {
  const targetDir = outputDir ?? resolve(projectRoot, 'out/build');

  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  readdirSync(projectRoot, { withFileTypes: true }).forEach(entry => {
    if (defaultExcludes.has(entry.name) || excludedTopLevel.has(entry.name)) {
      return;
    }

    if (excludedFiles.has(entry.name)) {
      return;
    }

    const source = resolve(projectRoot, entry.name);
    const destination = resolve(targetDir, entry.name);

    cpSync(source, destination, { recursive: true });
  });

  requiredFiles.forEach(file => {
    const candidate = resolve(targetDir, file);
    if (!existsSync(candidate)) {
      throw new Error(`Missing required file in build output: ${file}`);
    }
  });

  return targetDir;
}

export function packageExtension({ projectRoot = process.cwd(), buildDir, outputPath } = {}) {
  const buildPath = buildDir ?? buildExtension({ projectRoot });
  const zipOutput = outputPath ?? resolve(projectRoot, 'out/flashdoc.zip');

  mkdirSync(dirname(zipOutput), { recursive: true });

  if (existsSync(zipOutput)) {
    rmSync(zipOutput);
  }

  const zip = new AdmZip();
  zip.addLocalFolder(buildPath);
  zip.writeZip(zipOutput);

  return zipOutput;
}
