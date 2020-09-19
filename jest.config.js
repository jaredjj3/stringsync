module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  resetModules: false,
  testPathIgnorePatterns: ['node_modules', 'web'],
  testEnvironment: '<rootDir>/ServerTestEnvironment.js',
  roots: ['<rootDir>/packages'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
