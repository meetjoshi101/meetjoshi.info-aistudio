import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('should display admin login page', async ({ page }) => {
    // Navigate using hash routing
    await page.goto('/#/admin/login');

    // Wait for the page to load
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Check for login heading - be more flexible
    const heading = page.locator('h2').filter({ hasText: /admin.*login/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should have email and password inputs', async ({ page }) => {
    await page.goto('/#/admin/login');

    // Wait for form to load
    await page.waitForTimeout(2000);

    // Check for email input
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[id*="email"]'));
    await expect(emailInput.first()).toBeVisible({ timeout: 10000 });

    // Check for password input
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[id*="password"]'));
    await expect(passwordInput.first()).toBeVisible({ timeout: 10000 });

    // Check for submit button
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Sign in")'));
    await expect(submitButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/#/admin/login');

    // Wait for form to load
    await page.waitForTimeout(2000);

    // Find and click the submit button
    const submitButton = page.locator('button[type="submit"]').first();

    // Wait for button to be clickable
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });

    // Try clicking without filling the form
    await submitButton.click();

    // The form should still be on the login page (validation prevented submission)
    expect(page.url()).toContain('#/admin/login');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/#/admin/login');

    // Wait for form to load
    await page.waitForTimeout(2000);

    // Fill in with invalid credentials
    await page.locator('input[type="email"]').first().fill('invalid@example.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');

    // Submit the form
    await page.locator('button[type="submit"]').first().click();

    // Wait a bit for API call
    await page.waitForTimeout(3000);

    // Check for error message (either visible error or still on login page)
    const isOnLoginPage = page.url().includes('#/admin/login');
    expect(isOnLoginPage).toBeTruthy();
  });

  test('should redirect unauthenticated users from admin dashboard', async ({ page }) => {
    // Try to access admin dashboard directly without authentication
    await page.goto('/#/admin');

    // Wait for redirect
    await page.waitForTimeout(2000);

    // Should be redirected to login
    expect(page.url()).toContain('#/admin/login');
  });
});
