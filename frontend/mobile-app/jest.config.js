module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js',
  ],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  // jest-expo transforms are heavy; give slow first-compile renders headroom.
  testTimeout: 15000,
};
