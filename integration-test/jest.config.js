/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  roots: ['.'],
  testEnvironment: 'node',
  coverageReporters: ['lcov', 'html'],
};
