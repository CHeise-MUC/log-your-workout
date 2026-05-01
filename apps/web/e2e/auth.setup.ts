import { test as setup, expect } from '@playwright/test';
import { SESSION_FILE } from './constants';

const EMAIL = process.env.TEST_USER_EMAIL!;
const PASSWORD = process.env.TEST_USER_PASSWORD!;

// This setup runs ONCE before all tests that depend on it.
// It logs in, then saves the browser state to SESSION_FILE.
// All subsequent tests load SESSION_FILE instead of logging in again.
setup('authenticate', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: 'Einloggen' })).toBeVisible();

  await page.getByPlaceholder('deine@email.de').fill(EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Einloggen' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  // Save the authenticated browser state (cookies, localStorage with Supabase token)
  await page.context().storageState({ path: SESSION_FILE });
});
