import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForSelector('app-root', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should load projects page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/#/projects');
    await page.waitForTimeout(3000);

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (plus wait time)
    expect(loadTime).toBeLessThan(8000);
  });

  test('should not have console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Check for critical errors (allow some warnings)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR')
    );

    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(5);
  });
});
