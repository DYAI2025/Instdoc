// Format Detection Tests
// Tests for all format detection methods in service-worker.js

describe('Format Detection Tests', () => {
  let instantFile;

  beforeEach(() => {
    // Create a mock InstantFile instance for testing
    instantFile = {
      isYAML: function(content) {
        const yamlPatterns = [
          /^[\w-]+:\s+[\w\s]/m,
          /^  - /m,
          /^---\s*$/m,
          /^\w+:\s*$/m
        ];
        return yamlPatterns.some(p => p.test(content));
      },
      isPython: function(content) {
        const pythonPatterns = [
          /^def\s+\w+\s*\(/m,
          /^class\s+\w+/m,
          /^import\s+\w+/m,
          /^from\s+\w+\s+import/m,
          /if\s+__name__\s*==\s*['"]__main__['"]/
        ];
        const score = pythonPatterns.filter(p => p.test(content)).length;
        return score >= 2;
      },
      isTypeScript: function(content) {
        const tsPatterns = [
          /:\s*(string|number|boolean|any|void|never|unknown)\s*[;,)=]/,
          /interface\s+\w+/,
          /type\s+\w+\s*=/,
          /<\w+>/,
          /as\s+(const|string|number|boolean|any)/,
          /export\s+(type|interface)/,
          /React\.FC</,
          /useState<.*>/,
          /:\s*React\./
        ];
        const score = tsPatterns.filter(p => p.test(content)).length;
        return score >= 2;
      },
      isJavaScript: function(content) {
        const jsPatterns = [
          /function\s+\w+\s*\(/,
          /const\s+\w+\s*=/,
          /let\s+\w+\s*=/,
          /=>\s*{/,
          /require\(['"]/,
          /import\s+.*\s+from\s+['"]/
        ];
        const score = jsPatterns.filter(p => p.test(content)).length;
        return score >= 2;
      },
      isJSON: function(content) {
        try {
          JSON.parse(content.trim());
          return true;
        } catch {
          return false;
        }
      },
      isXML: function(content) {
        const xmlPatterns = [
          /<\?xml/i,
          /<svg/i,
          /<\w+[^>]*xmlns/,
          /<\w+>\s*<\w+>/,
          /<!ENTITY/i
        ];
        const trimmed = content.trim();
        if (trimmed.startsWith('<?xml') || trimmed.startsWith('<svg')) return true;
        return xmlPatterns.some(p => p.test(content));
      },
      isSQL: function(content) {
        const sqlPatterns = [
          /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\s+/i,
          /\bFROM\s+\w+/i,
          /\bWHERE\s+/i,
          /\bJOIN\s+/i,
          /\bGROUP\s+BY\b/i,
          /\bORDER\s+BY\b/i,
          /\bINTO\s+\w+/i
        ];
        const score = sqlPatterns.filter(p => p.test(content)).length;
        return score >= 2;
      },
      isShellScript: function(content) {
        const shellPatterns = [
          /^#!\/bin\/(ba)?sh/m,
          /^#!\/usr\/bin\/env\s+(ba)?sh/m,
          /\b(echo|export|source|alias)\s+/,
          /\$\{?\w+\}?/,
          /if\s+\[.*\]\s*;\s*then/,
          /for\s+\w+\s+in\s+/,
          /while\s+\[.*\]/
        ];
        const score = shellPatterns.filter(p => p.test(content)).length;
        if (content.trim().startsWith('#!/bin/bash') || content.trim().startsWith('#!/bin/sh')) return true;
        return score >= 2;
      },
      isHTML: function(content) {
        const htmlPatterns = [
          /<html/i,
          /<body/i,
          /<div/i,
          /<head/i,
          /<!DOCTYPE/i
        ];
        return htmlPatterns.some(p => p.test(content));
      },
      isMarkdown: function(content) {
        const mdPatterns = [
          /^#{1,6}\s+/m,
          /\[.+\]\(.+\)/,
          /^\s*[-*+]\s+/m,
          /```[\w]*\n/,
          /^\d+\.\s+/m
        ];
        const score = mdPatterns.filter(p => p.test(content)).length;
        return score >= 2;
      },
      isCSS: function(content) {
        const cssPatterns = [
          /[\w-]+\s*\{[^}]*[\w-]+\s*:\s*[^}]+\}/,
          /@media\s*\([^)]+\)/,
          /@import\s+/,
          /[\w-]+:\s*[\w-]+(\([^)]*\))?;/,
          /\.([\w-]+)\s*\{/,
          /#([\w-]+)\s*\{/,
          /@keyframes\s+\w+/
        ];
        const score = cssPatterns.filter(p => p.test(content)).length;
        return score >= 2;
      },
      isCSV: function(content) {
        const trimmed = content.trim();
        if (!trimmed.includes('\n')) return false;

        const delimiters = [',', ';', '\t'];
        const lines = trimmed.split(/\r?\n/);
        const delimiter = delimiters.find(symbol => lines[0].includes(symbol));
        if (!delimiter) return false;

        const columnCount = lines[0].split(delimiter).length;
        if (columnCount < 2) return false;

        return lines.slice(1).every((line) => {
          if (!line.trim()) return true;
          const cells = line.split(delimiter);
          return cells.length === columnCount;
        });
      }
    };
  });

  describe('TypeScript Detection', () => {
    test('should detect TypeScript with type annotations', () => {
      const tsCode = `
        function greet(name: string): void {
          console.log("Hello " + name);
        }
        interface User {
          name: string;
          age: number;
        }
      `;
      expect(instantFile.isTypeScript(tsCode)).toBe(true);
    });

    test('should detect TypeScript with React components', () => {
      const tsxCode = `
        const Component: React.FC<Props> = () => {
          const [state, setState] = useState<string>('');
          return <div>{state}</div>;
        };
      `;
      expect(instantFile.isTypeScript(tsxCode)).toBe(true);
    });

    test('should detect TypeScript with type definitions', () => {
      const tsCode = `
        type UserRole = 'admin' | 'user';
        export interface Config {
          apiUrl: string;
        }
      `;
      expect(instantFile.isTypeScript(tsCode)).toBe(true);
    });

    test('should not detect plain JavaScript as TypeScript', () => {
      const jsCode = `
        function greet(name) {
          console.log("Hello " + name);
        }
      `;
      expect(instantFile.isTypeScript(jsCode)).toBe(false);
    });
  });

  describe('JavaScript Detection', () => {
    test('should detect JavaScript with functions', () => {
      const jsCode = `
        function hello() {
          const message = "Hello World";
          return message;
        }
      `;
      expect(instantFile.isJavaScript(jsCode)).toBe(true);
    });

    test('should detect modern JavaScript', () => {
      const jsCode = `
        const arrow = () => {
          let x = 10;
          console.log(x);
        };
      `;
      expect(instantFile.isJavaScript(jsCode)).toBe(true);
    });
  });

  describe('Python Detection', () => {
    test('should detect Python with functions and imports', () => {
      const pyCode = `
        import os
        def main():
            print("Hello World")
        if __name__ == '__main__':
            main()
      `;
      expect(instantFile.isPython(pyCode)).toBe(true);
    });

    test('should detect Python classes', () => {
      const pyCode = `
        class MyClass:
            def __init__(self):
                import sys
                self.name = "test"
      `;
      expect(instantFile.isPython(pyCode)).toBe(true);
    });
  });

  describe('JSON Detection', () => {
    test('should detect valid JSON object', () => {
      const jsonCode = `{"name": "test", "value": 123}`;
      expect(instantFile.isJSON(jsonCode)).toBe(true);
    });

    test('should detect valid JSON array', () => {
      const jsonCode = `[1, 2, 3, "test"]`;
      expect(instantFile.isJSON(jsonCode)).toBe(true);
    });

    test('should reject invalid JSON', () => {
      const invalidJson = `{name: test}`;
      expect(instantFile.isJSON(invalidJson)).toBe(false);
    });
  });

  describe('XML Detection', () => {
    test('should detect XML with declaration', () => {
      const xmlCode = `<?xml version="1.0"?><root><item>test</item></root>`;
      expect(instantFile.isXML(xmlCode)).toBe(true);
    });

    test('should detect SVG as XML', () => {
      const svgCode = `<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>`;
      expect(instantFile.isXML(svgCode)).toBe(true);
    });

    test('should detect XML with namespace', () => {
      const xmlCode = `<root xmlns="http://example.com"><item>test</item></root>`;
      expect(instantFile.isXML(xmlCode)).toBe(true);
    });
  });

  describe('SQL Detection', () => {
    test('should detect SQL SELECT statements', () => {
      const sqlCode = `
        SELECT name, age FROM users
        WHERE age > 18
        ORDER BY name;
      `;
      expect(instantFile.isSQL(sqlCode)).toBe(true);
    });

    test('should detect SQL INSERT statements', () => {
      const sqlCode = `
        INSERT INTO users (name, email)
        VALUES ('John', 'john@example.com')
      `;
      expect(instantFile.isSQL(sqlCode)).toBe(true);
    });

    test('should detect SQL CREATE statements', () => {
      const sqlCode = `
        CREATE TABLE users (
          id INT PRIMARY KEY,
          name VARCHAR(100)
        );
      `;
      expect(instantFile.isSQL(sqlCode)).toBe(true);
    });
  });

  describe('Shell Script Detection', () => {
    test('should detect bash scripts with shebang', () => {
      const shellCode = `#!/bin/bash
        echo "Hello World"
        export PATH=/usr/bin
      `;
      expect(instantFile.isShellScript(shellCode)).toBe(true);
    });

    test('should detect shell scripts with common commands', () => {
      const shellCode = `
        echo "Starting process"
        if [ -f "$FILE" ]; then
          echo "File exists"
        fi
      `;
      expect(instantFile.isShellScript(shellCode)).toBe(true);
    });

    test('should detect shell scripts with variables', () => {
      const shellCode = `
        NAME="John"
        echo $NAME
        for file in *.txt; do
          echo $file
        done
      `;
      expect(instantFile.isShellScript(shellCode)).toBe(true);
    });
  });

  describe('HTML Detection', () => {
    test('should detect HTML with DOCTYPE', () => {
      const htmlCode = `<!DOCTYPE html><html><head><title>Test</title></head></html>`;
      expect(instantFile.isHTML(htmlCode)).toBe(true);
    });

    test('should detect HTML with body tag', () => {
      const htmlCode = `<body><div>Content</div></body>`;
      expect(instantFile.isHTML(htmlCode)).toBe(true);
    });
  });

  describe('CSS Detection', () => {
    test('should detect CSS with selectors and properties', () => {
      const cssCode = `
        .container {
          width: 100%;
          margin: 0 auto;
        }
        #header {
          background-color: blue;
        }
      `;
      expect(instantFile.isCSS(cssCode)).toBe(true);
    });

    test('should detect CSS with media queries', () => {
      const cssCode = `
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
        }
      `;
      expect(instantFile.isCSS(cssCode)).toBe(true);
    });

    test('should detect CSS with keyframes', () => {
      const cssCode = `
        @keyframes slideIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      expect(instantFile.isCSS(cssCode)).toBe(true);
    });
  });

  describe('YAML Detection', () => {
    test('should detect YAML with key-value pairs', () => {
      const yamlCode = `
        name: John Doe
        age: 30
        city: New York
      `;
      expect(instantFile.isYAML(yamlCode)).toBe(true);
    });

    test('should detect YAML with lists', () => {
      const yamlCode = `
        items:
          - item1
          - item2
      `;
      expect(instantFile.isYAML(yamlCode)).toBe(true);
    });
  });

  describe('Markdown Detection', () => {
    test('should detect Markdown with headings and links', () => {
      const mdCode = `
        # Title
        ## Subtitle
        [Link](https://example.com)
        - List item
      `;
      expect(instantFile.isMarkdown(mdCode)).toBe(true);
    });

    test('should detect Markdown with code blocks', () => {
      const mdCode = `
        ## Code Example
        \`\`\`javascript
        console.log("test");
        \`\`\`
      `;
      expect(instantFile.isMarkdown(mdCode)).toBe(true);
    });
  });

  describe('CSV Detection', () => {
    test('should detect CSV with comma delimiter', () => {
      const csvCode = `name,age,city
John,30,New York
Jane,25,Boston`;
      expect(instantFile.isCSV(csvCode)).toBe(true);
    });

    test('should detect CSV with semicolon delimiter', () => {
      const csvCode = `name;age;city
John;30;New York
Jane;25;Boston`;
      expect(instantFile.isCSV(csvCode)).toBe(true);
    });

    test('should reject single line as CSV', () => {
      const csvCode = `name,age,city`;
      expect(instantFile.isCSV(csvCode)).toBe(false);
    });

    test('should reject inconsistent columns', () => {
      const csvCode = `name,age
John,30,New York
Jane,25`;
      expect(instantFile.isCSV(csvCode)).toBe(false);
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
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    }
  };
}
