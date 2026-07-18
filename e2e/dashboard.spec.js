import { test, expect } from '@playwright/test';

test.describe.serial('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing routes, cookies, and storage before each test
    // This ensures test isolation
    await page.context().clearCookies();
    await page.context().clearPermissions();
    // Unroute any existing handlers from previous tests
    await page.unroute('https://api.coingecko.com/api/v3/simple/price*');
  });

  test('full user journey: set alert and verify banner appears on price breach', async ({ page }) => {
    // Mock the CoinGecko API to control price updates BEFORE page.goto()
    // Use a more reliable approach: always return $60,000 initially, then switch to $61,000 after reload
    let hasReloaded = false;
    await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
      if (!hasReloaded) {
        // Initial price: BTC at $60,000
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            bitcoin: { usd: 60000, usd_24h_change: 1 },
            ethereum: { usd: 3000, usd_24h_change: 1 },
            solana: { usd: 100, usd_24h_change: 1 },
          }),
        });
      } else {
        // After reload: BTC at $61,000 (crossing threshold)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            bitcoin: { usd: 61000, usd_24h_change: 1 },
            ethereum: { usd: 3000, usd_24h_change: 1 },
            solana: { usd: 100, usd_24h_change: 1 },
          }),
        });
      }
    });

    await page.goto('/');

    // Wait for initial prices to load
    await page.waitForSelector('[data-testid="price-value-BTC"]');

    // Verify initial price is displayed
    const initialPrice = page.locator('[data-testid="price-value-BTC"]');
    await expect(initialPrice).toHaveText('$60,000.00');

    // Interact with the form to set an alert
    await page.selectOption('[aria-label="Coin"]', 'bitcoin');
    await page.selectOption('[aria-label="Direction"]', 'above');
    await page.fill('[aria-label="Threshold"]', '60500');
    await page.click('button:has-text("Set Alert")');

    // Verify the alert was added to the list
    await expect(page.locator('[data-testid="alerts-list"]')).toContainText('BTC');
    await expect(page.locator('[data-testid="alerts-list"]')).toContainText('≥$60,500.00');

    // Wait for the next poll cycle (15 seconds) to trigger price update
    // Since we can't easily wait for the timer, we'll reload to trigger a new fetch
    hasReloaded = true;
    await page.reload();
    await page.waitForSelector('[data-testid="price-value-BTC"]');

    // Verify the alert banner appears when price crosses threshold
    await expect(page.locator('[data-testid="alert-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-banner"]')).toContainText('BTC');
    await expect(page.locator('[data-testid="alert-banner"]')).toContainText('crossed above $60,500.00');
    await expect(page.locator('[data-testid="alert-banner"]')).toContainText('$61,000.00');

    // Test dismissing the banner
    await page.click('[aria-label="Dismiss alert"]');
    await expect(page.locator('[data-testid="alert-banner"]')).not.toBeVisible();
  });

  test('handles form validation correctly', async ({ page }) => {
    await page.goto('/');

    // Try to submit without entering a threshold
    await page.click('button:has-text("Set Alert")');
    
    // Verify no alert was added (form should prevent submission)
    await expect(page.locator('[data-testid="alerts-list"]')).not.toContainText('BTC');
  });

  test('displays error state when API fails', async ({ page }) => {
    await page.route('https://api.coingecko.com/api/v3/simple/price*', route => {
      route.abort('failed');
    });

    await page.goto('/');

    // Should show error message
    await expect(page.locator('text=/CoinGecko error/')).toBeVisible();
  });

  test('handles Notification API permission and execution', async ({ page }) => {
    // Mock the CoinGecko API with reload flag BEFORE page.goto()
    let hasReloaded = false;
    await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
      if (!hasReloaded) {
        // Initial price: BTC at $60,000
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            bitcoin: { usd: 60000, usd_24h_change: 1 },
            ethereum: { usd: 3000, usd_24h_change: 1 },
            solana: { usd: 100, usd_24h_change: 1 },
          }),
        });
      } else {
        // After reload: BTC at $61,000 (crossing threshold)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            bitcoin: { usd: 61000, usd_24h_change: 1 },
            ethereum: { usd: 3000, usd_24h_change: 1 },
            solana: { usd: 100, usd_24h_change: 1 },
          }),
        });
      }
    });

    await page.goto('/');

    // Wait for initial prices to load
    await page.waitForSelector('[data-testid="price-value-BTC"]');

    // Verify Notification API permission is granted
    const notificationPermission = await page.evaluate(() => {
      return Notification.permission;
    });
    expect(notificationPermission).toBe('granted');

    // Create an alert that will trigger
    await page.selectOption('[aria-label="Coin"]', 'bitcoin');
    await page.selectOption('[aria-label="Direction"]', 'above');
    await page.fill('[aria-label="Threshold"]', '60500');
    await page.click('button:has-text("Set Alert")');

    // Verify the alert was added to the list
    await expect(page.locator('[data-testid="alerts-list"]')).toContainText('BTC');

    // Reload to trigger price update (mocked to cross threshold)
    hasReloaded = true;
    await page.reload();
    await page.waitForSelector('[data-testid="price-value-BTC"]');

    // Verify the alert banner appears (which triggers notification)
    await expect(page.locator('[data-testid="alert-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-banner"]')).toContainText('BTC');
  });
});
