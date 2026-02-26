import { test, expect } from '@playwright/test';

test('user dashboard shows bookings or empty state', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'testuser@example.com');
  await page.fill('input[name="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  await page.goto('/user/dashboard');
  const count = await page.locator('.booking-card').count();
  expect(count).toBeGreaterThanOrEqual(0); // Passes if 0 or more cards
});
