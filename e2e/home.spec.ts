import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to be ready
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Check that the page title is set
    await expect(page).toHaveTitle(/Meet Joshi/i);
  });

  test('should display the main navigation or header', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for any navigation element or header
    const hasNav = await page.locator('nav').count() > 0;
    const hasHeader = await page.locator('header').count() > 0;
    const hasLinks = await page.locator('a').count() > 0;

    // At least one navigation element should exist
    expect(hasNav || hasHeader || hasLinks).toBeTruthy();
  });

  test('should navigate to projects page via URL', async ({ page }) => {
    await page.goto('/#/projects');

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Verify we're on the projects page
    expect(page.url()).toContain('#/projects');

    // Check page loaded
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should navigate to blog page via URL', async ({ page }) => {
    await page.goto('/#/blog');

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Verify we're on the blog page
    expect(page.url()).toContain('#/blog');

    // Check page loaded
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should have clickable links on the page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Get all links
    const links = await page.locator('a').all();

    // Should have at least some links
    expect(links.length).toBeGreaterThan(0);
  });
});
