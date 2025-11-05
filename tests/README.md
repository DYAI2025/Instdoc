# InstaFile Test Suite

Automated tests for critical handover points in the InstaFile Chrome extension.

## Test Coverage

### 1. Format Detection Tests (`format-detection.test.js`)
Tests all format detection methods for:
- **TypeScript** (.ts, .tsx) - Type annotations, interfaces, React components
- **JavaScript** (.js) - Functions, modern syntax, ES6+
- **Python** (.py) - Functions, classes, imports
- **JSON** - Valid/invalid JSON parsing
- **XML/SVG** - XML declarations, namespaces
- **SQL** - SELECT, INSERT, CREATE statements
- **Shell Scripts** (.sh, .bash) - Shebang, commands, variables
- **HTML** - DOCTYPE, tags
- **CSS** - Selectors, media queries, keyframes
- **YAML** - Key-value pairs, lists
- **Markdown** - Headings, links, code blocks
- **CSV** - Delimiters, column consistency

### 2. Blob Creation Tests (`blob-creation.test.js`)
Tests file creation and handling:
- **MIME Type Mapping** - Correct MIME types for all formats
- **Blob Content Creation** - Content encoding, special characters
- **PDF Generation** - Regular PDFs and label PDFs
- **Filename Generation** - Three naming strategies:
  - Timestamp: `instant_YYYY-MM-DD_HH-MM-SS.ext`
  - First Line: Sanitized first line of content
  - Custom Pattern: User-defined with tokens `{date}`, `{time}`, `{type}`

### 3. Settings Integration Tests (`settings-integration.test.js`)
Tests settings management and event tracking:
- **Default Settings** - All 16 settings with valid defaults
- **Settings Load/Save** - chrome.storage.sync operations
- **Event Tracking** - Three tracking features:
  1. **Format Usage Tracking** - Count saves per format
  2. **Detection Accuracy Tracking** - Track auto-detection success rate
  3. **Format Recommendations** - Generate insights from usage data
- **Stats Tracking** - Total files, daily counts, last save
- **Settings Validation** - Path, naming pattern, thresholds, positions

## Running Tests

### Option 1: Web-Based Test Runner (Recommended)
1. Open `test-runner.html` in your browser
2. Click buttons to run individual test suites or all tests
3. View results in real-time with colored output
4. See summary statistics (Total/Passed/Failed)

### Option 2: Node.js Console
```bash
# Run individual test files
node format-detection.test.js
node blob-creation.test.js
node settings-integration.test.js
```

### Option 3: Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Copy/paste test file contents
4. Press Enter to run

## Test Results Format

Tests output results in a readable format:
```
📦 Format Detection Tests
  ✅ should detect TypeScript with type annotations
  ✅ should detect TypeScript with React components
  ❌ should handle edge case (if failed)
```

## Coverage Summary

| Test Suite | Tests | Critical Areas |
|------------|-------|----------------|
| Format Detection | 40+ | All 12 format detectors |
| Blob Creation | 25+ | MIME types, filenames, PDFs |
| Settings Integration | 30+ | Event tracking, storage, validation |

## Adding New Tests

To add tests for a new format:

1. **Format Detection** - Add detection patterns to `format-detection.test.js`:
```javascript
describe('NewFormat Detection', () => {
  test('should detect new format', () => {
    const code = `// new format code`;
    expect(instantFile.isNewFormat(code)).toBe(true);
  });
});
```

2. **Blob Creation** - Add MIME type test to `blob-creation.test.js`:
```javascript
test('should map NewFormat to correct MIME type', () => {
  const result = instantFile.createBlob('content', 'newformat');
  expect(result.mimeType).toBe('text/newformat;charset=utf-8');
});
```

3. **Update Test Runner** - Tests are automatically included when you load the page

## Critical Handover Points Tested

The tests cover these critical integration points:

### 1. Content Detection → Format Selection
- User selects text
- Extension detects format type
- Returns correct format identifier

### 2. Format Selection → Blob Creation
- Format identifier received
- MIME type mapped correctly
- Blob created with proper encoding

### 3. Content + Format → Filename Generation
- Content and format provided
- Naming pattern applied
- Valid, sanitized filename returned

### 4. Settings → Storage
- User changes settings
- Settings persisted to chrome.storage.sync
- Settings loaded and merged with defaults

### 5. Save Action → Event Tracking
- File saved successfully
- Format usage incremented
- Detection accuracy tracked
- Stats updated

## Continuous Integration

These tests are designed to run in:
- Local development environment
- Chrome extension context (with chrome.* APIs mocked)
- CI/CD pipelines (with headless Chrome)

## Test Maintenance

Update tests when:
- Adding new format support
- Changing detection patterns
- Modifying MIME type mappings
- Adding new settings
- Changing filename generation logic

## License

Same as InstaFile extension - see main README.md
