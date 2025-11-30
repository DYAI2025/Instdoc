import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run tests that use vitest imports (exclude browser-based tests)
    include: [
      'tests/content-runtime.test.js',
      'tests/service-worker.test.js',
      'tests/installation.test.js',
      'tests/build-and-package.test.js'
    ],
    exclude: [
      'tests/format-detection.test.js',
      'tests/blob-creation.test.js',
      'tests/settings-integration.test.js',
      'tests/edge-cases.test.js' // TODO: Refactor to use same pattern as service-worker.test.js
    ],
    environment: 'node',
    globals: false,
  },
});
