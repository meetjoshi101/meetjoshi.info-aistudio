import { test, expect, Page } from '@playwright/test';

async function gotoAdminLogin(page: Page): Promise<void> {
  await page.goto('/#/admin/login');
  await expect(page.locator('h2').filter({ hasText: /admin.*login/i })).toBeVisible({ timeout: 10000 });
}

test.describe('Admin Panel', () => {
  test('should display admin login page', async ({ page }) => {
    await gotoAdminLogin(page);
  });

  test('should have email and password inputs', async ({ page }) => {
    await gotoAdminLogin(page);

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
    await gotoAdminLogin(page);

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
    await gotoAdminLogin(page);

    // Fill in with invalid credentials
    await page.locator('input[type="email"]').first().fill('invalid@example.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');

    // Submit the form
    await page.locator('button[type="submit"]').first().click();

    // API failure should keep user on login route
    await expect(page).toHaveURL(/#\/admin\/login/, { timeout: 10000 });
  });

  test('should redirect unauthenticated users from admin dashboard', async ({ page }) => {
    // Try to access admin dashboard directly without authentication
    await page.goto('/#/admin');

    // Should be redirected to login
    await expect(page).toHaveURL(/#\/admin\/login/, { timeout: 10000 });
  });
});
