/* eslint-disable */
export default {
  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/packages/angular-gherkin-testcafe-builder',
  displayName: 'angular-gherkin-testcafe-builder',
  testEnvironment: 'node',
  preset: '../../jest.preset.js',
};
