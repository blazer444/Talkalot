export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '\!src/server.js',
    '\!src/**/*.test.js',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
};