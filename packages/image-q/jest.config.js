module.exports = {
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests',
  ],
  globals: {
    'ts-jest': {
      tsconfig: './tests/tsconfig.json',
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
  coverageReporters: [
    'lcov',
    'text-summary',
    'html',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
  ],
  preset: 'ts-jest',
}