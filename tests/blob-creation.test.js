// Blob Creation and File Handling Tests
// Tests for createBlob, MIME type mapping, and filename generation

describe('Blob Creation Tests', () => {
  let flashDoc;

  beforeEach(() => {
    flashDoc = {
      createBlob: function(content, extension) {
        if (extension === 'pdf' || extension === 'label') {
          // Mock PDF creation
          return {
            blob: new Blob(['PDF_MOCK'], { type: 'application/pdf' }),
            mimeType: 'application/pdf'
          };
        }

        if (extension === 'docx') {
          return {
            blob: new Blob(['DOCX_MOCK'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          };
        }

        const mimeTypes = {
          'txt': 'text/plain;charset=utf-8',
          'md': 'text/markdown;charset=utf-8',
          'yaml': 'text/yaml;charset=utf-8',
          'py': 'text/x-python;charset=utf-8',
          'js': 'text/javascript;charset=utf-8',
          'ts': 'text/typescript;charset=utf-8',
          'tsx': 'text/typescript;charset=utf-8',
          'json': 'application/json;charset=utf-8',
          'html': 'text/html;charset=utf-8',
          'css': 'text/css;charset=utf-8',
          'xml': 'application/xml;charset=utf-8',
          'svg': 'image/svg+xml;charset=utf-8',
          'sql': 'application/sql;charset=utf-8',
          'sh': 'application/x-sh;charset=utf-8',
          'bash': 'application/x-sh;charset=utf-8',
          'csv': 'text/csv;charset=utf-8'
        };

        const mimeType = mimeTypes[extension] || 'text/plain;charset=utf-8';
        return { blob: new Blob([content], { type: mimeType }), mimeType };
      },

      generateFilename: function(content, extension, tab) {
        const fileExtension = extension === 'label' ? 'pdf' : extension;
        const timestamp = new Date().toISOString()
          .replace(/[:.]/g, '-')
          .replace('T', '_')
          .slice(0, -5);

        const namingPattern = this.namingPattern || 'timestamp';

        switch (namingPattern) {
          case 'firstline': {
            const firstLine = content.split('\n')[0]
              .substring(0, 50)
              .replace(/[^a-z0-9]/gi, '_')
              .replace(/_+/g, '_')
              .toLowerCase()
              .trim();

            return firstLine && firstLine.length > 3
              ? `${firstLine}.${fileExtension}`
              : `flashdoc_${timestamp}.${fileExtension}`;
          }

          case 'custom': {
            const pattern = this.customPattern || 'file_{date}';
            return pattern
              .replace('{date}', timestamp.split('_')[0])
              .replace('{time}', timestamp.split('_')[1])
              .replace('{type}', extension) + `.${fileExtension}`;
          }

          case 'timestamp':
          default:
            return `flashdoc_${timestamp}.${fileExtension}`;
        }
      }
    };
  });

  describe('MIME Type Mapping', () => {
    test('should map TypeScript to correct MIME type', () => {
      const result = flashDoc.createBlob('const x: string = "test"', 'ts');
      expect(result.mimeType).toBe('text/typescript;charset=utf-8');
    });

    test('should map XML to correct MIME type', () => {
      const result = flashDoc.createBlob('<?xml version="1.0"?>', 'xml');
      expect(result.mimeType).toBe('application/xml;charset=utf-8');
    });

    test('should map SQL to correct MIME type', () => {
      const result = flashDoc.createBlob('SELECT * FROM users', 'sql');
      expect(result.mimeType).toBe('application/sql;charset=utf-8');
    });

    test('should map Shell script to correct MIME type', () => {
      const result = flashDoc.createBlob('#!/bin/bash', 'sh');
      expect(result.mimeType).toBe('application/x-sh;charset=utf-8');
    });

    test('should map CSS to correct MIME type', () => {
      const result = flashDoc.createBlob('.class { color: red; }', 'css');
      expect(result.mimeType).toBe('text/css;charset=utf-8');
    });

    test('should map DOCX to correct MIME type', () => {
      const result = flashDoc.createBlob('Document body', 'docx');
      expect(result.mimeType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    test('should map JSON to correct MIME type', () => {
      const result = flashDoc.createBlob('{"key": "value"}', 'json');
      expect(result.mimeType).toBe('application/json;charset=utf-8');
    });

    test('should handle unknown extensions with default MIME type', () => {
      const result = flashDoc.createBlob('content', 'unknown');
      expect(result.mimeType).toBe('text/plain;charset=utf-8');
    });
  });

  describe('Blob Content Creation', () => {
    test('should create blob with correct content', () => {
      const content = 'Test content';
      const result = flashDoc.createBlob(content, 'txt');
      expect(result.blob).toBeDefined();
      expect(result.blob.type).toBe('text/plain;charset=utf-8');
    });

    test('should create blob for TypeScript', () => {
      const content = 'const x: number = 5;';
      const result = flashDoc.createBlob(content, 'ts');
      expect(result.blob).toBeDefined();
      expect(result.mimeType).toBe('text/typescript;charset=utf-8');
    });

    test('should handle empty content', () => {
      const result = flashDoc.createBlob('', 'txt');
      expect(result.blob).toBeDefined();
    });

    test('should handle special characters', () => {
      const content = 'Special chars: €£¥©®™';
      const result = flashDoc.createBlob(content, 'txt');
      expect(result.blob).toBeDefined();
    });
  });

  describe('PDF Creation', () => {
    test('should create PDF blob for pdf extension', () => {
      const result = flashDoc.createBlob('Test content', 'pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.blob.type).toBe('application/pdf');
    });

    test('should create label PDF for label extension', () => {
      const result = flashDoc.createBlob('Label text', 'label');
      expect(result.mimeType).toBe('application/pdf');
    });
  });

  describe('Filename Generation - Timestamp', () => {
    beforeEach(() => {
      flashDoc.namingPattern = 'timestamp';
    });

    test('should generate filename with timestamp', () => {
      const filename = flashDoc.generateFilename('content', 'txt', null);
      expect(filename).toMatch(/^flashdoc_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.txt$/);
    });

    test('should use correct extension for label PDFs', () => {
      const filename = flashDoc.generateFilename('content', 'label', null);
      expect(filename).toMatch(/\.pdf$/);
    });

    test('should generate different filenames for different extensions', () => {
      const txtFile = flashDoc.generateFilename('content', 'txt', null);
      const tsFile = flashDoc.generateFilename('content', 'ts', null);
      expect(txtFile).toMatch(/\.txt$/);
      expect(tsFile).toMatch(/\.ts$/);
    });
  });

  describe('Filename Generation - First Line', () => {
    beforeEach(() => {
      flashDoc.namingPattern = 'firstline';
    });

    test('should use first line as filename', () => {
      const content = 'My Important Document\nRest of content';
      const filename = flashDoc.generateFilename(content, 'txt', null);
      expect(filename).toBe('my_important_document.txt');
    });

    test('should sanitize special characters', () => {
      const content = 'File@Name#With$Special%Chars!\nContent';
      const filename = flashDoc.generateFilename(content, 'txt', null);
      expect(filename).toMatch(/^file_name_with_special_chars\.txt$/);
    });

    test('should handle empty first line', () => {
      const content = '\nSecond line';
      const filename = flashDoc.generateFilename(content, 'txt', null);
      expect(filename).toMatch(/^flashdoc_\d{4}/);
    });

    test('should handle very long first lines', () => {
      const content = 'A'.repeat(100) + '\nContent';
      const filename = flashDoc.generateFilename(content, 'txt', null);
      expect(filename.length).toBeLessThanOrEqual(54); // 50 chars + .txt
    });

    test('should fall back to timestamp for short names', () => {
      const content = 'ab\nContent';
      const filename = flashDoc.generateFilename(content, 'txt', null);
      expect(filename).toMatch(/^flashdoc_\d{4}/);
    });
  });

  describe('Filename Generation - Custom Pattern', () => {
    beforeEach(() => {
      flashDoc.namingPattern = 'custom';
    });

    test('should use custom pattern with date', () => {
      flashDoc.customPattern = 'file_{date}';
      const filename = flashDoc.generateFilename('content', 'txt', null);
      expect(filename).toMatch(/^file_\d{4}-\d{2}-\d{2}\.txt$/);
    });

    test('should use custom pattern with type', () => {
      flashDoc.customPattern = 'doc_{type}';
      const filename = flashDoc.generateFilename('content', 'ts', null);
      expect(filename).toMatch(/^doc_ts\.ts$/);
    });

    test('should use custom pattern with date and time', () => {
      flashDoc.customPattern = 'backup_{date}_{time}';
      const filename = flashDoc.generateFilename('content', 'json', null);
      expect(filename).toMatch(/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
    });

    test('should handle custom pattern without placeholders', () => {
      flashDoc.customPattern = 'myfile';
      const filename = flashDoc.generateFilename('content', 'txt', null);
      expect(filename).toBe('myfile.txt');
    });
  });
});

// Test runner helper
function describe(name, fn) {
  console.log(`\n📦 ${name}`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toMatch(regex) {
      if (!regex.test(actual)) {
        throw new Error(`Expected "${actual}" to match ${regex}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeLessThanOrEqual(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    }
  };
}
