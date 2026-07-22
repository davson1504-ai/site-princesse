import { defineConfig, devices } from "@playwright/test";

const testEnv = { ...process.env, LOCAL_JSON_STORAGE: "true", E2E_DATA_DIR: ".e2e-data" };

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: false, timeout: 120000, env: testEnv },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
