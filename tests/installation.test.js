import { describe, expect, it, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Installation Tests', () => {
  const projectRoot = resolve(process.cwd());

  describe('Required Files', () => {
    it('should have manifest.json', () => {
      const manifestPath = resolve(projectRoot, 'manifest.json');
      expect(existsSync(manifestPath)).toBe(true);
    });

    it('should have valid manifest.json', () => {
      const manifestPath = resolve(projectRoot, 'manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

      expect(manifest.manifest_version).toBe(3);
      expect(manifest.name).toBeTruthy();
      expect(manifest.version).toBeTruthy();
      expect(manifest.description).toBeTruthy();
    });

    it('should have service-worker.js', () => {
      const workerPath = resolve(projectRoot, 'service-worker.js');
      expect(existsSync(workerPath)).toBe(true);
    });

    it('should have content.js', () => {
      const contentPath = resolve(projectRoot, 'content.js');
      expect(existsSync(contentPath)).toBe(true);
    });

    it('should have popup.html', () => {
      const popupPath = resolve(projectRoot, 'popup.html');
      expect(existsSync(popupPath)).toBe(true);
    });

    it('should have popup.js', () => {
      const popupJsPath = resolve(projectRoot, 'popup.js');
      expect(existsSync(popupJsPath)).toBe(true);
    });

    it('should have options.html', () => {
      const optionsPath = resolve(projectRoot, 'options.html');
      expect(existsSync(optionsPath)).toBe(true);
    });

    it('should have options.js', () => {
      const optionsJsPath = resolve(projectRoot, 'options.js');
      expect(existsSync(optionsJsPath)).toBe(true);
    });
  });

  describe('Icon Files', () => {
    it('should have icon16.png', () => {
      const iconPath = resolve(projectRoot, 'icon16.png');
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should have icon48.png', () => {
      const iconPath = resolve(projectRoot, 'icon48.png');
      expect(existsSync(iconPath)).toBe(true);
    });

    it('should have icon128.png', () => {
      const iconPath = resolve(projectRoot, 'icon128.png');
      expect(existsSync(iconPath)).toBe(true);
    });
  });

  describe('Manifest Validation', () => {
    let manifest;

    beforeAll(() => {
      const manifestPath = resolve(projectRoot, 'manifest.json');
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    });

    it('should declare required permissions', () => {
      const requiredPermissions = ['contextMenus', 'downloads', 'storage', 'notifications'];
      requiredPermissions.forEach(permission => {
        expect(manifest.permissions).toContain(permission);
      });
    });

    it('should have valid background service worker', () => {
      expect(manifest.background).toBeTruthy();
      expect(manifest.background.service_worker).toBe('service-worker.js');
    });

    it('should have content scripts configuration', () => {
      expect(manifest.content_scripts).toBeTruthy();
      expect(Array.isArray(manifest.content_scripts)).toBe(true);
      expect(manifest.content_scripts.length).toBeGreaterThan(0);
      expect(manifest.content_scripts[0].js).toContain('content.js');
    });

    it('should have keyboard commands', () => {
      expect(manifest.commands).toBeTruthy();
      expect(manifest.commands['save-smart']).toBeTruthy();
      expect(manifest.commands['save-txt']).toBeTruthy();
      expect(manifest.commands['save-md']).toBeTruthy();
      expect(manifest.commands['save-pdf']).toBeTruthy();
    });

    it('should have action with popup', () => {
      expect(manifest.action).toBeTruthy();
      expect(manifest.action.default_popup).toBe('popup.html');
    });

    it('should have options page', () => {
      expect(manifest.options_page).toBe('options.html');
    });

    it('should have valid icons configuration', () => {
      expect(manifest.icons).toBeTruthy();
      expect(manifest.icons['16']).toBe('icon16.png');
      expect(manifest.icons['48']).toBe('icon48.png');
      expect(manifest.icons['128']).toBe('icon128.png');
    });
  });

  describe('HTML Files Validation', () => {
    it('popup.html should reference popup.js', () => {
      const popupHtml = readFileSync(resolve(projectRoot, 'popup.html'), 'utf8');
      expect(popupHtml).toContain('popup.js');
    });

    it('options.html should reference options.js', () => {
      const optionsHtml = readFileSync(resolve(projectRoot, 'options.html'), 'utf8');
      expect(optionsHtml).toContain('options.js');
    });

    it('popup.html should have valid HTML structure', () => {
      const popupHtml = readFileSync(resolve(projectRoot, 'popup.html'), 'utf8');
      expect(popupHtml).toContain('<!DOCTYPE html>');
      expect(popupHtml).toContain('<html');
      expect(popupHtml).toContain('</html>');
    });

    it('options.html should have valid HTML structure', () => {
      const optionsHtml = readFileSync(resolve(projectRoot, 'options.html'), 'utf8');
      expect(optionsHtml).toContain('<!DOCTYPE html>');
      expect(optionsHtml).toContain('<html');
      expect(optionsHtml).toContain('</html>');
    });
  });

  describe('JavaScript Files Syntax', () => {
    it('service-worker.js should be valid JavaScript', () => {
      const code = readFileSync(resolve(projectRoot, 'service-worker.js'), 'utf8');
      expect(() => {
        // Basic syntax check - proper code should not throw during parse
        new Function(code);
      }).not.toThrow();
    });

    it('service-worker.js should initialize FlashDoc class', () => {
      const code = readFileSync(resolve(projectRoot, 'service-worker.js'), 'utf8');
      expect(code).toContain('class FlashDoc');
      expect(code).toContain('new FlashDoc()');
    });

    it('content.js should initialize FlashDocContent class', () => {
      const code = readFileSync(resolve(projectRoot, 'content.js'), 'utf8');
      expect(code).toContain('class FlashDocContent');
    });

    it('popup.js should handle chrome storage', () => {
      const code = readFileSync(resolve(projectRoot, 'popup.js'), 'utf8');
      expect(code).toContain('chrome.storage');
    });

    it('options.js should handle settings save/load', () => {
      const code = readFileSync(resolve(projectRoot, 'options.js'), 'utf8');
      expect(code).toContain('chrome.storage.sync');
    });
  });

  describe('Package Configuration', () => {
    it('should have package.json', () => {
      const packagePath = resolve(projectRoot, 'package.json');
      expect(existsSync(packagePath)).toBe(true);
    });

    it('should have valid package.json', () => {
      const packagePath = resolve(projectRoot, 'package.json');
      const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

      expect(pkg.name).toBeTruthy();
      expect(pkg.version).toBeTruthy();
    });

    it('should have test script', () => {
      const packagePath = resolve(projectRoot, 'package.json');
      const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

      expect(pkg.scripts).toBeTruthy();
      expect(pkg.scripts.test).toBeTruthy();
    });

    it('should have vitest as dev dependency', () => {
      const packagePath = resolve(projectRoot, 'package.json');
      const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

      expect(pkg.devDependencies).toBeTruthy();
      expect(pkg.devDependencies.vitest).toBeTruthy();
    });
  });
});
