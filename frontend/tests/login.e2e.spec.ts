import { test, expect } from '@playwright/test';

test('user can login with invalid credentials and see error', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'invalid@example.com');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  // Expect to stay on login page and see error message
  await expect(page).toHaveURL(/login/);
  await expect(page.locator('body')).toContainText(/User not found/i);
});
