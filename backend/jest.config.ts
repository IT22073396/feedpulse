import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  forceExit: true,
  clearMocks: true,
};

export default config;
