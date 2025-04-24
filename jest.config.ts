// jest.config.ts

import type { Config } from "jest";

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jest-fixed-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
};

export default config;
