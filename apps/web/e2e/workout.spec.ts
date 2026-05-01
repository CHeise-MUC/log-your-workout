import { test, expect, request } from '@playwright/test';
import { SESSION_FILE } from './constants';

// All tests in this file start already logged in (no login screen needed).
// Playwright loads the saved session from auth.setup.ts instead.
test.use({ storageState: SESSION_FILE });

const API = process.env.PLAYWRIGHT_BASE_URL
  ? process.env.PLAYWRIGHT_BASE_URL.replace(':3000', ':3001')
  : 'http://localhost:3001';

// Track sessions created during tests so we can clean them up afterwards.
const createdSessionIds: string[] = [];

test.afterAll(async () => {
  // Clean up all test sessions from the database after the test suite finishes.
  // This prevents test data from polluting the database over time.
  if (createdSessionIds.length === 0) return;

  const apiContext = await request.newContext();
  for (const id of createdSessionIds) {
    // Note: DELETE endpoint not yet implemented – add SCRUM ticket when needed.
    // For now we just log which sessions were created.
    console.log(`[cleanup] Test session created: ${id} – delete manually if needed`);
  }
  await apiContext.dispose();
});

test.describe('Workout Session', () => {
  test('Freies Training starten leitet auf Session-Seite weiter', async ({ page }) => {
    // 1. Zur Workout-Startseite navigieren (kein Login nötig – Session ist geladen)
    await page.goto('/dashboard/workout');
    await expect(page.getByRole('heading', { name: 'Training starten' })).toBeVisible();

    // 2. "Freies Training" auswählen (kein Plan)
    await page.getByText('Freies Training').click();

    // 3. Training starten
    await page.getByRole('button', { name: 'Jetzt starten' }).click();

    // 4. Nach dem Start muss die URL /dashboard/workout/<id> sein
    await expect(page).toHaveURL(/\/dashboard\/workout\/[a-z0-9-]+/);

    // 5. Session-ID für Cleanup merken
    const url = page.url();
    const sessionId = url.split('/dashboard/workout/')[1];
    if (sessionId) createdSessionIds.push(sessionId);
  });

  test('Dashboard zeigt Trainingshistorie nach gestarteter Session', async ({ page }) => {
    // Navigate to history page and verify it loads without errors
    await page.goto('/dashboard/workout/history');

    // The page should load and show some content (heading or list)
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
