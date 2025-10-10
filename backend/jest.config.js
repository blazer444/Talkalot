export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '\!src/server.js',
    '\!src/models/**',
    '\!src/routes/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};