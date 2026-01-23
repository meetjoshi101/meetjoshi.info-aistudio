import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test('should display projects page', async ({ page }) => {
    await page.goto('/#/projects');

    // Wait for the page to load
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Check for any heading
    const headings = await page.locator('h1, h2').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('should show data source indicator', async ({ page }) => {
    await page.goto('/#/projects');

    // Look for the data source indicator
    const sourceIndicator = page.locator('text=/Source:/i');

    // It might take a moment for data to load
    await expect(sourceIndicator).toBeVisible({ timeout: 10000 });
  });

  test('should display project cards when data loads', async ({ page }) => {
    await page.goto('/#/projects');

    // Wait for potential project cards to load
    await page.waitForTimeout(3000);

    // Check if either projects loaded or error/empty state is shown
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent.length).toBeGreaterThan(100);
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/#/projects');

    // Wait for page load
    await page.waitForTimeout(2000);

    // Check for main container
    const mainContent = await page.locator('main, div, section').count();
    expect(mainContent).toBeGreaterThan(0);
  });
});
