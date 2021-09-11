module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  globals: {
    'ts-jest': {
      tsConfigFile: './tests/tsconfig.json',
      skipBabel: true,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(test|spec)\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary', 'html'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
