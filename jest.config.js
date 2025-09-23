module.exports = {
  rootDir: '.',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  testEnvironment: 'node',
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  coverageReporters: ['lcovonly', 'text', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
