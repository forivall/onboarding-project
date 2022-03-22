/** @type {import('ts-jest').TsJestGlobalOptions} */
const tsJestConfig = {
  diagnostics: false,
};

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.d\\.ts$'],
  globals: {
    'ts-jest': tsJestConfig,
  },
};
module.exports = config;
