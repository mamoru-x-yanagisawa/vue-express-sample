import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run server',
      port: 3000,
      reuseExistingServer: true,
      timeout: 10000,
    },
    {
      command: 'npm run client',
      port: 5173,
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});
