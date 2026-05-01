import { test, expect } from '@playwright/test';

// Credentials are loaded from .env.test – never hardcoded here.
const EMAIL = process.env.TEST_USER_EMAIL!;
const PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe('Authentication', () => {
  test('Login mit gültigen Zugangsdaten leitet auf Dashboard weiter', async ({ page }) => {
    // 1. Login-Seite öffnen
    await page.goto('/auth/login');

    // 2. Prüfen ob die Seite geladen ist
    await expect(page.getByRole('heading', { name: 'Einloggen' })).toBeVisible();

    // 3. E-Mail und Passwort eingeben
    await page.getByPlaceholder('deine@email.de').fill(EMAIL);
    await page.getByPlaceholder('••••••••').fill(PASSWORD);

    // 4. Login-Button klicken
    await page.getByRole('button', { name: 'Einloggen' }).click();

    // 5. Nach dem Login muss die URL /dashboard sein
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Login mit falschem Passwort zeigt Fehlermeldung', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByPlaceholder('deine@email.de').fill(EMAIL);
    await page.getByPlaceholder('••••••••').fill('falsches-passwort-123');

    await page.getByRole('button', { name: 'Einloggen' }).click();

    // Supabase gibt eine Fehlermeldung zurück – wir prüfen ob sie angezeigt wird
    await expect(page.locator('p').filter({ hasText: /invalid|incorrect|wrong|ungültig/i })).toBeVisible();
  });

  test('Nicht eingeloggte Nutzer werden von /dashboard auf Login umgeleitet', async ({ page }) => {
    await page.goto('/dashboard');

    // Middleware soll auf /auth/login umleiten
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
