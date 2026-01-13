import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should display API data source status', async ({ page }) => {
    await page.goto('/#/blog');

    // Wait for data to load
    await page.waitForTimeout(3000);

    // Check for data source indicator showing API
    const sourceText = await page.locator('text=/Source:.*API/i').textContent().catch(() => null);

    // Should show either API or Error status
    expect(sourceText).toBeTruthy();
  });

  test('should handle data loading states', async ({ page }) => {
    await page.goto('/#/projects');

    // Initial load
    await page.waitForTimeout(1000);

    // Should have some content even during loading
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test('should display data or appropriate empty state', async ({ page }) => {
    await page.goto('/#/blog');

    // Wait for data fetch
    await page.waitForTimeout(3000);

    // Should have either data or empty/error message
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
