/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  roots: ['src'],
  testEnvironment: 'node',
  coverageReporters: ['lcov', 'html'],
};
