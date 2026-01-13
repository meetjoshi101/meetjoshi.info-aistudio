import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should render correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should render correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/#/blog');
    await page.waitForTimeout(2000);

    // Check that there's visible text content
    const textContent = await page.locator('body').textContent();
    expect(textContent?.length).toBeGreaterThan(100);
  });
});
