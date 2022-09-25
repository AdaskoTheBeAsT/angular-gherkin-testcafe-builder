/* eslint-disable */
export default {
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/packages/angular-gherkin-testcafe-builder',
  displayName: 'angular-gherkin-testcafe-builder',
  testEnvironment: 'node',
  preset: '../../jest.preset.js',
};
