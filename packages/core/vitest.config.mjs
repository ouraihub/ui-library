export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['../../test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/dist/**',
        '**/node_modules/**',
        '**/test/**',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    globals: true,
    testTimeout: 10000,
    threads: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
};
