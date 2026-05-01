import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables from .env.test
// This file contains TEST_USER_EMAIL, TEST_USER_PASSWORD and is never committed to Git.
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Fail CI build if someone accidentally left test.only in the code
  forbidOnly: !!process.env.CI,
  // Retry failed tests on CI (flaky network, slow startup, etc.)
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // All page.goto('/login') calls resolve to http://localhost:3000/login
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    // Save a trace on the first retry so we can debug failures
    trace: 'on-first-retry',
    // Save screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    // Step 1: Log in once and save the session to e2e/.auth/session.json.
    // All tests that need authentication depend on this project.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Step 2: Run all other tests with the saved session (no login overhead).
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  // Start both servers before running tests.
  // Tests won't start until both servers respond on their ports.
  // In local dev, existing servers are reused (no restart needed).
  webServer: [
    {
      // Next.js frontend
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      // NestJS API – path is relative to this config file (apps/web)
      command: 'npm run start:dev --prefix ../api',
      url: 'http://localhost:3001/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
