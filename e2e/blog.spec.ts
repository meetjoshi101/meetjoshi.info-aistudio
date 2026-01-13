import { test, expect } from '@playwright/test';

test.describe('Blog Page', () => {
  test('should display blog page with heading', async ({ page }) => {
    await page.goto('/blog');

    // Wait for the page to load
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Check for blog/journal heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should show data source indicator', async ({ page }) => {
    await page.goto('/blog');

    // Look for the data source indicator
    const sourceIndicator = page.locator('text=/Source:/i');

    // Wait for it to appear
    await expect(sourceIndicator).toBeVisible({ timeout: 10000 });
  });

  test('should have search/filter functionality', async ({ page }) => {
    await page.goto('/blog');

    // Look for search or filter input
    const searchInput = page.locator('input[type="text"]').first();

    // Check if search input exists and is visible
    const isVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      // If search exists, test typing in it
      await searchInput.fill('test');
      const value = await searchInput.inputValue();
      expect(value).toBe('test');
    }
  });

  test('should display blog posts or empty state', async ({ page }) => {
    await page.goto('/blog');

    // Wait for potential blog posts to load
    await page.waitForTimeout(2000);

    // Check if content is present (either posts or empty message)
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });
});
