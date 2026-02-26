import { test, expect } from '@playwright/test';

test('user can start booking flow or see empty state', async ({ page }) => {
  await page.goto('/accommodations');
  const cards = page.locator('.accommodation-card');
  if (await cards.count() > 0) {
    await cards.first().click();
    await expect(page).toHaveURL(/accommodations\//);
    // Try to click Book button if present
    const bookBtn = page.locator('button:has-text("Book")');
    if (await bookBtn.count() > 0) {
      await bookBtn.first().click();
      await expect(page).toHaveURL(/bookings\/create/);
      await expect(page.locator('form')).toBeVisible();
    }
  } else {
    await expect(page.locator('body')).toContainText(/accommodation|not found|empty/i);
  }
});
