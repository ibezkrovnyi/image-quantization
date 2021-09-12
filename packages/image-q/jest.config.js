module.exports = {
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.jest.json',
    },
  },
  testRegex: '(test|spec)\\.(jsx?|tsx?)$',
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'node',
    'ts',
    'tsx',
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/reports/jest',
  coverageReporters: [
    'lcov',
    'text-summary',
    'html',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
  ],
  cacheDirectory: '<rootDir>/node_modules/.cache/jest'
}