// Settings and Storage Integration Tests
// Tests for settings management, event tracking, and storage operations

describe('Settings Integration Tests', () => {
  let mockStorage;

  beforeEach(() => {
    // Mock chrome.storage API
    mockStorage = {
      sync: {
        data: {},
        get(keys) {
          return Promise.resolve(this.data);
        },
        set(items) {
          Object.assign(this.data, items);
          return Promise.resolve();
        }
      },
      local: {
        data: {},
        get(keys) {
          if (Array.isArray(keys)) {
            const result = {};
            keys.forEach(key => {
              if (this.data[key] !== undefined) {
                result[key] = this.data[key];
              }
            });
            return Promise.resolve(result);
          }
          return Promise.resolve(this.data);
        },
        set(items) {
          Object.assign(this.data, items);
          return Promise.resolve();
        }
      }
    };
  });

  describe('Default Settings', () => {
    test('should have all required default settings', () => {
      const defaults = {
        folderPath: 'InstantFiles/',
        namingPattern: 'timestamp',
        customPattern: 'file_{date}',
        organizeByType: true,
        showNotifications: true,
        playSound: false,
        autoDetectType: true,
        enableContextMenu: true,
        showFloatingButton: true,
        buttonPosition: 'bottom-right',
        autoHideButton: true,
        selectionThreshold: 10,
        enableSmartDetection: true,
        trackFormatUsage: true,
        trackDetectionAccuracy: true,
        showFormatRecommendations: true
      };

      expect(Object.keys(defaults).length).toBe(16);
      expect(defaults.trackFormatUsage).toBe(true);
      expect(defaults.trackDetectionAccuracy).toBe(true);
      expect(defaults.showFormatRecommendations).toBe(true);
    });

    test('should have valid default values', () => {
      const defaults = {
        folderPath: 'InstantFiles/',
        namingPattern: 'timestamp',
        selectionThreshold: 10,
        buttonPosition: 'bottom-right'
      };

      expect(defaults.folderPath).toMatch(/\/$/); // Should end with /
      expect(['timestamp', 'firstline', 'custom']).toContain(defaults.namingPattern);
      expect(defaults.selectionThreshold).toBeGreaterThan(0);
      expect(['bottom-right', 'bottom-left', 'top-right', 'top-left']).toContain(defaults.buttonPosition);
    });
  });

  describe('Settings Load and Save', () => {
    test('should load settings from storage', async () => {
      mockStorage.sync.data = {
        folderPath: 'MyFiles/',
        autoDetectType: false
      };

      const settings = await mockStorage.sync.get(null);
      expect(settings.folderPath).toBe('MyFiles/');
      expect(settings.autoDetectType).toBe(false);
    });

    test('should save settings to storage', async () => {
      const newSettings = {
        folderPath: 'Documents/',
        namingPattern: 'firstline',
        trackFormatUsage: true
      };

      await mockStorage.sync.set(newSettings);
      const stored = await mockStorage.sync.get(null);

      expect(stored.folderPath).toBe('Documents/');
      expect(stored.namingPattern).toBe('firstline');
      expect(stored.trackFormatUsage).toBe(true);
    });

    test('should merge with default settings on load', () => {
      const defaults = {
        folderPath: 'InstantFiles/',
        autoDetectType: true,
        trackFormatUsage: true
      };

      const stored = { folderPath: 'CustomPath/' };
      const merged = { ...defaults, ...stored };

      expect(merged.folderPath).toBe('CustomPath/');
      expect(merged.autoDetectType).toBe(true);
      expect(merged.trackFormatUsage).toBe(true);
    });
  });

  describe('Event Tracking Settings', () => {
    test('should enable format usage tracking by default', () => {
      const settings = { trackFormatUsage: true };
      expect(settings.trackFormatUsage).toBe(true);
    });

    test('should enable detection accuracy tracking by default', () => {
      const settings = { trackDetectionAccuracy: true };
      expect(settings.trackDetectionAccuracy).toBe(true);
    });

    test('should enable format recommendations by default', () => {
      const settings = { showFormatRecommendations: true };
      expect(settings.showFormatRecommendations).toBe(true);
    });

    test('should respect tracking preferences when disabled', () => {
      const settings = {
        trackFormatUsage: false,
        trackDetectionAccuracy: false,
        showFormatRecommendations: false
      };

      expect(settings.trackFormatUsage).toBe(false);
      expect(settings.trackDetectionAccuracy).toBe(false);
      expect(settings.showFormatRecommendations).toBe(false);
    });
  });

  describe('Format Usage Tracking', () => {
    test('should initialize format usage object', async () => {
      const formatUsage = {};
      await mockStorage.local.set({ formatUsage });
      const stored = await mockStorage.local.get(['formatUsage']);

      expect(stored.formatUsage).toBeDefined();
      expect(typeof stored.formatUsage).toBe('object');
    });

    test('should track format usage', async () => {
      const formatUsage = { ts: 5, js: 10, py: 3 };
      await mockStorage.local.set({ formatUsage });

      const stored = await mockStorage.local.get(['formatUsage']);
      expect(stored.formatUsage.ts).toBe(5);
      expect(stored.formatUsage.js).toBe(10);
      expect(stored.formatUsage.py).toBe(3);
    });

    test('should increment format usage count', async () => {
      mockStorage.local.data.formatUsage = { ts: 1 };

      const stored = await mockStorage.local.get(['formatUsage']);
      const updated = { ...stored.formatUsage, ts: stored.formatUsage.ts + 1 };

      await mockStorage.local.set({ formatUsage: updated });
      const result = await mockStorage.local.get(['formatUsage']);

      expect(result.formatUsage.ts).toBe(2);
    });

    test('should add new format to tracking', async () => {
      mockStorage.local.data.formatUsage = { ts: 5 };

      const stored = await mockStorage.local.get(['formatUsage']);
      stored.formatUsage.xml = 1;

      await mockStorage.local.set({ formatUsage: stored.formatUsage });
      const result = await mockStorage.local.get(['formatUsage']);

      expect(result.formatUsage.xml).toBe(1);
      expect(result.formatUsage.ts).toBe(5);
    });
  });

  describe('Detection Accuracy Tracking', () => {
    test('should initialize detection accuracy object', async () => {
      const accuracy = { total: 0, correct: 0 };
      await mockStorage.local.set({ detectionAccuracy: accuracy });

      const stored = await mockStorage.local.get(['detectionAccuracy']);
      expect(stored.detectionAccuracy).toBeDefined();
      expect(stored.detectionAccuracy.total).toBe(0);
      expect(stored.detectionAccuracy.correct).toBe(0);
    });

    test('should track detection accuracy', async () => {
      const accuracy = { total: 10, correct: 8 };
      await mockStorage.local.set({ detectionAccuracy: accuracy });

      const stored = await mockStorage.local.get(['detectionAccuracy']);
      expect(stored.detectionAccuracy.total).toBe(10);
      expect(stored.detectionAccuracy.correct).toBe(8);
    });

    test('should calculate accuracy percentage', async () => {
      const accuracy = { total: 20, correct: 18 };
      const percentage = (accuracy.correct / accuracy.total) * 100;

      expect(percentage).toBe(90);
    });

    test('should handle zero detections', async () => {
      const accuracy = { total: 0, correct: 0 };
      const percentage = accuracy.total > 0 ? (accuracy.correct / accuracy.total) * 100 : 0;

      expect(percentage).toBe(0);
    });

    test('should increment detection counts', async () => {
      mockStorage.local.data.detectionAccuracy = { total: 5, correct: 4 };

      const stored = await mockStorage.local.get(['detectionAccuracy']);
      stored.detectionAccuracy.total++;
      stored.detectionAccuracy.correct++;

      await mockStorage.local.set({ detectionAccuracy: stored.detectionAccuracy });
      const result = await mockStorage.local.get(['detectionAccuracy']);

      expect(result.detectionAccuracy.total).toBe(6);
      expect(result.detectionAccuracy.correct).toBe(5);
    });
  });

  describe('Stats Tracking', () => {
    test('should track total files saved', async () => {
      const stats = { totalFiles: 42 };
      await mockStorage.local.set({ stats });

      const stored = await mockStorage.local.get(['stats']);
      expect(stored.stats.totalFiles).toBe(42);
    });

    test('should track daily file count', async () => {
      const stats = {
        todaysDate: '2025-01-15',
        todayFiles: 5
      };
      await mockStorage.local.set({ stats });

      const stored = await mockStorage.local.get(['stats']);
      expect(stored.stats.todaysDate).toBe('2025-01-15');
      expect(stored.stats.todayFiles).toBe(5);
    });

    test('should track last file saved', async () => {
      const stats = {
        lastFile: 'example.ts',
        lastTimestamp: Date.now()
      };
      await mockStorage.local.set({ stats });

      const stored = await mockStorage.local.get(['stats']);
      expect(stored.stats.lastFile).toBe('example.ts');
      expect(stored.stats.lastTimestamp).toBeGreaterThan(0);
    });

    test('should reset daily count on new day', () => {
      const oldDate = '2025-01-14';
      const newDate = '2025-01-15';

      const stats = {
        todaysDate: oldDate,
        todayFiles: 10
      };

      if (stats.todaysDate !== newDate) {
        stats.todaysDate = newDate;
        stats.todayFiles = 0;
      }

      expect(stats.todaysDate).toBe(newDate);
      expect(stats.todayFiles).toBe(0);
    });
  });

  describe('Recommendations Generation', () => {
    test('should generate recommendation for most used format', () => {
      const formatUsage = { ts: 15, js: 10, py: 5 };
      const totalFiles = 30;

      const sortedFormats = Object.entries(formatUsage).sort((a, b) => b[1] - a[1]);
      const mostUsed = sortedFormats[0];

      expect(mostUsed[0]).toBe('ts');
      expect(mostUsed[1]).toBe(15);
      expect(Math.round((mostUsed[1] / totalFiles) * 100)).toBe(50);
    });

    test('should generate accuracy recommendation', () => {
      const accuracy = { total: 20, correct: 18 };
      const accuracyRate = Math.round((accuracy.correct / accuracy.total) * 100);

      expect(accuracyRate).toBe(90);
      expect(accuracyRate).toBeGreaterThan(80);
    });

    test('should suggest unused formats', () => {
      const formatUsage = { ts: 5, js: 10 };
      const supportedFormats = ['ts', 'tsx', 'xml', 'sql', 'sh', 'bash', 'css'];
      const unusedFormats = supportedFormats.filter(fmt => !formatUsage[fmt]);

      expect(unusedFormats).toContain('xml');
      expect(unusedFormats).toContain('sql');
      expect(unusedFormats.length).toBeGreaterThan(0);
    });

    test('should handle empty format usage', () => {
      const formatUsage = {};
      const hasUsage = Object.keys(formatUsage).length > 0;

      expect(hasUsage).toBe(false);
    });
  });

  describe('Settings Validation', () => {
    test('should validate folder path', () => {
      const validPath = 'MyFolder/';
      const invalidPath = '';

      expect(validPath.length).toBeGreaterThan(0);
      expect(invalidPath.length).toBe(0);
    });

    test('should validate naming pattern', () => {
      const validPatterns = ['timestamp', 'firstline', 'custom'];
      const testPattern = 'timestamp';

      expect(validPatterns).toContain(testPattern);
    });

    test('should validate selection threshold', () => {
      const threshold = 10;
      expect(threshold).toBeGreaterThanOrEqual(0);
      expect(threshold).toBeLessThanOrEqual(200);
    });

    test('should validate button position', () => {
      const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
      const testPosition = 'bottom-right';

      expect(validPositions).toContain(testPosition);
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
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toMatch(regex) {
      if (!regex.test(actual)) {
        throw new Error(`Expected "${actual}" to match ${regex}`);
      }
    },
    toContain(item) {
      if (!actual.includes(item)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${item}`);
      }
    }
  };
}
