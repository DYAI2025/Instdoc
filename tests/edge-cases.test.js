import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const createChromeStub = () => {
  const onInstalled = {
    addListener: vi.fn(),
  };
  const onMessage = {
    handlers: [],
    addListener: vi.fn((handler) => {
      onMessage.handlers.push(handler);
    }),
    getHandlers: function() {
      return this.handlers;
    },
  };
  const onClicked = {
    addListener: vi.fn(),
  };
  const onCommand = {
    addListener: vi.fn(),
  };

  return {
    storage: {
      sync: {
        get: vi.fn(() => Promise.resolve({})),
      },
      local: {
        get: vi.fn(() => Promise.resolve({ stats: { totalFiles: 0 } })),
        set: vi.fn(() => Promise.resolve()),
      },
    },
    contextMenus: {
      removeAll: vi.fn((callback) => callback?.()),
      create: vi.fn(),
      onClicked,
    },
    commands: {
      onCommand,
    },
    runtime: {
      id: 'test-extension',
      onInstalled,
      onMessage,
      lastError: null,
    },
    tabs: {
      create: vi.fn(),
      query: vi.fn(() => Promise.resolve([])),
    },
    scripting: {
      executeScript: vi.fn(() => Promise.resolve([{ result: '' }])),
    },
    downloads: {
      download: vi.fn(() => Promise.resolve(1)),
    },
    notifications: {
      create: vi.fn(),
    },
  };
};

describe('Edge Case Tests', () => {
  let context;
  let getInstance;

  beforeEach(async () => {
    context = {
      console: { log: () => {}, warn: () => {}, error: () => {} },
      chrome: createChromeStub(),
      URL: {
        createObjectURL: vi.fn(() => 'blob:test'),
        revokeObjectURL: vi.fn(),
      },
      Blob: global.Blob,
      TextEncoder: global.TextEncoder,
      setTimeout,
      clearTimeout,
    };
    context.globalThis = context;

    const scriptSource = readFileSync(resolve(process.cwd(), 'service-worker.js'), 'utf8');
    vm.createContext(context);
    vm.runInContext(scriptSource, context);
    await flushPromises();

    // Helper to get the instantiated object
    getInstance = () => context.flashDoc;
  });

  describe('Empty Content Handling', () => {
    it('should reject empty string', async () => {
      const instance = getInstance();
      await expect(instance.handleSave('', 'txt', {}))
        .rejects.toThrow('No content to save');
    });

    it('should reject whitespace-only content', async () => {
      const instance = getInstance();
      await expect(instance.handleSave('   \n\t  ', 'txt', {}))
        .rejects.toThrow('No content to save');
    });
  });

  describe('Format Detection Edge Cases', () => {
    it('should handle very short content', () => {
      const instance = getInstance();
      const result = instance.detectContentType('x');
      expect(result).toBe('txt'); // Should fallback to txt
    });

    it('should handle content with only special characters', () => {
      const instance = getInstance();
      const result = instance.detectContentType('!@#$%^&*()');
      expect(result).toBe('txt');
    });

    it('should handle content with mixed formats', () => {
      const instance = getInstance();
      // Content that could be both JSON and JS
      const content = '{"key": "value"}';
      const result = instance.detectContentType(content);
      // JSON should be detected before JS
      expect(result).toBe('json');
    });

    it('should handle invalid JSON gracefully', () => {
      const instance = getInstance();
      const result = instance.isJSON('{invalid json');
      expect(result).toBe(false);
    });

    it('should handle very long content', () => {
      const instance = getInstance();
      const longContent = 'a'.repeat(10000); // 10KB of text
      const result = instance.detectContentType(longContent);
      expect(result).toBe('txt');
    });

    it('should handle content with unicode characters', () => {
      const instance = getInstance();
      const content = '你好世界 مرحبا العالم 🌍';
      const result = instance.detectContentType(content);
      expect(result).toBe('txt');
    });
  });

  describe('Filename Generation Edge Cases', () => {
    it('should handle firstline naming with empty first line', () => {
      const instance = getInstance();
      instance.settings = { ...instance.settings, namingPattern: 'firstline' };

      const filename = instance.generateFilename('\n\nsecond line', 'txt', {});
      expect(filename).toMatch(/flashdoc_.*\.txt/);
    });

    it('should handle firstline with very long first line', () => {
      const instance = getInstance();
      instance.settings = { ...instance.settings, namingPattern: 'firstline' };

      const longLine = 'a'.repeat(200);
      const filename = instance.generateFilename(longLine, 'txt', {});
      expect(filename.length).toBeLessThan(60); // Should be truncated
      expect(filename).toContain('.txt');
    });

    it('should sanitize special characters in filename', () => {
      const instance = getInstance();
      instance.settings = { ...instance.settings, namingPattern: 'firstline' };

      const filename = instance.generateFilename('test/file:name*with?special<chars>|', 'txt', {});
      expect(filename).not.toMatch(/[/:*?<>|]/);
    });

    it('should handle very short first line (less than 3 chars)', () => {
      const instance = getInstance();
      instance.settings = { ...instance.settings, namingPattern: 'firstline' };

      const filename = instance.generateFilename('ab', 'txt', {});
      expect(filename).toMatch(/flashdoc_.*\.txt/);
    });

    it('should handle custom pattern with all placeholders', () => {
      const instance = getInstance();
      instance.settings = {
        ...instance.settings,
        namingPattern: 'custom',
        customPattern: 'file_{date}_{time}_{type}'
      };

      const filename = instance.generateFilename('content', 'md', {});
      expect(filename).toContain('md');
      expect(filename).toContain('file_');
      expect(filename).toContain('.md');
    });

    it('should handle label type correctly', () => {
      const instance = getInstance();
      instance.settings = { ...instance.settings, namingPattern: 'timestamp' };

      const filename = instance.generateFilename('content', 'label', {});
      expect(filename).toContain('.pdf'); // label should become pdf
      expect(filename).not.toContain('.label');
    });
  });

  describe('PDF Generation Edge Cases', () => {
    it('should handle empty content in PDF', () => {
      const instance = getInstance();
      const blob = instance.createPdfBlob('');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });

    it('should handle very long lines in PDF', () => {
      const instance = getInstance();
      const longLine = 'a'.repeat(500);
      const blob = instance.createPdfBlob(longLine);
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle special PDF characters', () => {
      const instance = getInstance();
      const content = 'Test (parentheses) \\backslash';
      const blob = instance.createPdfBlob(content);
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle label PDF with empty lines', () => {
      const instance = getInstance();
      const blob = instance.createLabelPdf('\n\n\n');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });

    it('should handle label PDF with more than 4 lines', () => {
      const instance = getInstance();
      const content = 'Line1\nLine2\nLine3\nLine4\nLine5\nLine6';
      const blob = instance.createLabelPdf(content);
      expect(blob).toBeInstanceOf(Blob);
      // Should wrap/compress to fit
    });

    it('should handle label PDF with very long single line', () => {
      const instance = getInstance();
      const longLine = 'word '.repeat(50);
      const blob = instance.createLabelPdf(longLine);
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('MIME Type Edge Cases', () => {
    it('should handle unknown extension', () => {
      const instance = getInstance();
      const { mimeType } = instance.createBlob('content', 'unknown');
      expect(mimeType).toBe('text/plain;charset=utf-8');
    });

    it('should handle all supported extensions', () => {
      const instance = getInstance();
      const extensions = ['txt', 'md', 'yaml', 'py', 'js', 'ts', 'json', 'html', 'css', 'xml', 'sql', 'sh', 'csv'];

      extensions.forEach(ext => {
        const { mimeType } = instance.createBlob('content', ext);
        expect(mimeType).toBeTruthy();
        expect(mimeType).toContain('charset=utf-8');
      });
    });

    it('should handle PDF creation', () => {
      const instance = getInstance();
      const { blob, mimeType } = instance.createBlob('content', 'pdf');
      expect(mimeType).toBe('application/pdf');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle label creation', () => {
      const instance = getInstance();
      const { blob, mimeType } = instance.createBlob('content', 'label');
      expect(mimeType).toBe('application/pdf');
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('Settings Edge Cases', () => {
    it('should use defaults when storage is empty', () => {
      const instance = getInstance();
      expect(instance.settings.folderPath).toBe('FlashDocs/');
      expect(instance.settings.namingPattern).toBe('timestamp');
      expect(instance.settings.organizeByType).toBe(true);
    });
  });

  describe('Format Detection: CSV Edge Cases', () => {
    it('should reject single line as CSV', () => {
      const instance = getInstance();
      const result = instance.isCSV('col1,col2,col3');
      expect(result).toBe(false);
    });

    it('should require at least 2 columns', () => {
      const instance = getInstance();
      const result = instance.isCSV('single\ncolumn');
      expect(result).toBe(false);
    });

    it('should handle inconsistent column counts', () => {
      const instance = getInstance();
      const result = instance.isCSV('a,b,c\nd,e');
      expect(result).toBe(false);
    });

    it('should handle empty lines in CSV', () => {
      const instance = getInstance();
      const result = instance.isCSV('a,b\n\nc,d');
      expect(result).toBe(true); // Empty lines should be allowed
    });

    it('should detect tab-delimited CSV', () => {
      const instance = getInstance();
      const result = instance.isCSV('a\tb\nc\td');
      expect(result).toBe(true);
    });

    it('should detect semicolon-delimited CSV', () => {
      const instance = getInstance();
      const result = instance.isCSV('a;b\nc;d');
      expect(result).toBe(true);
    });
  });

  describe('Format Detection: Code Languages', () => {
    it('should require multiple patterns for Python detection', () => {
      const instance = getInstance();
      // Single pattern should not be enough
      expect(instance.isPython('def test():')).toBe(false);
      // Multiple patterns should work
      expect(instance.isPython('import os\ndef test():\n  pass')).toBe(true);
    });

    it('should require multiple patterns for TypeScript detection', () => {
      const instance = getInstance();
      // Single pattern should not be enough
      expect(instance.isTypeScript('const x: string = "test"')).toBe(false);
      // Multiple patterns should work
      expect(instance.isTypeScript('interface User { name: string; age: number; }')).toBe(true);
    });

    it('should distinguish TypeScript from JavaScript', () => {
      const instance = getInstance();
      const tsCode = 'const greet = (name: string): void => { console.log(name); }';
      const jsCode = 'const greet = (name) => { console.log(name); }';

      expect(instance.isTypeScript(tsCode)).toBe(true);
      expect(instance.isTypeScript(jsCode)).toBe(false);
    });

    it('should detect shell scripts with shebang', () => {
      const instance = getInstance();
      const bashScript = '#!/bin/bash\necho "test"';
      expect(instance.isShellScript(bashScript)).toBe(true);
    });

    it('should require multiple patterns for CSS without selectors', () => {
      const instance = getInstance();
      const result = instance.isCSS('color: red;');
      expect(result).toBe(false); // Single property not enough
    });
  });
});
