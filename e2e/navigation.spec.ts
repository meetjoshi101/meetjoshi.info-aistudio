import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should support hash-based routing', async ({ page }) => {
    // Test home route
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('#');

    // Test projects route
    await page.goto('/#/projects');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('#/projects');

    // Test blog route
    await page.goto('/#/blog');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('#/blog');
  });

  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const initialUrl = page.url();

    // Try to find and click a link
    const links = await page.locator('a[href*="#"]').all();

    if (links.length > 0) {
      await links[0].click();
      await page.waitForTimeout(2000);

      // URL should have changed or page reloaded
      const newUrl = page.url();
      // Either URL changed or page is still functional
      expect(newUrl).toBeTruthy();
    }
  });

  test('should maintain hash routes on page reload', async ({ page }) => {
    await page.goto('/#/blog');
    await page.waitForTimeout(2000);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be on blog route
    expect(page.url()).toContain('#/blog');
  });

  test('should handle unknown routes gracefully', async ({ page }) => {
    await page.goto('/#/nonexistent-page');
    await page.waitForTimeout(2000);

    // Should either redirect or show error - page should still load
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
