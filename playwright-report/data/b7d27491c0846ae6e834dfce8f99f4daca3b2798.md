# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.js >> Dashboard E2E >> full user journey: set alert and verify banner appears on price breach
- Location: e2e\dashboard.spec.js:13:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('[data-testid="price-value-BTC"]')
Expected: "$60,000.00"
Received: "$61,000.00"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('[data-testid="price-value-BTC"]')
    14 × locator resolved to <p data-testid="price-value-BTC" class="relative z-10 mt-6 font-mono text-3xl font-bold tabular-nums text-black">$61,000.00</p>
       - unexpected value "$61,000.00"

```

```yaml
- paragraph: $61,000.00
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe.serial('Dashboard E2E', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Clear any existing routes, cookies, and storage before each test
  6   |     // This ensures test isolation
  7   |     await page.context().clearCookies();
  8   |     await page.context().clearPermissions();
  9   |     // Unroute any existing handlers from previous tests
  10  |     await page.unroute('https://api.coingecko.com/api/v3/simple/price*');
  11  |   });
  12  | 
  13  |   test('full user journey: set alert and verify banner appears on price breach', async ({ page }) => {
  14  |     // Mock the CoinGecko API to control price updates BEFORE page.goto()
  15  |     let callCount = 0;
  16  |     await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
  17  |       callCount++;
  18  |       
  19  |       if (callCount === 1) {
  20  |         // Initial price: BTC at $60,000
  21  |         await route.fulfill({
  22  |           status: 200,
  23  |           contentType: 'application/json',
  24  |           body: JSON.stringify({
  25  |             bitcoin: { usd: 60000, usd_24h_change: 1 },
  26  |             ethereum: { usd: 3000, usd_24h_change: 1 },
  27  |             solana: { usd: 100, usd_24h_change: 1 },
  28  |           }),
  29  |         });
  30  |       } else {
  31  |         // Subsequent calls: BTC at $61,000 (crossing threshold)
  32  |         await route.fulfill({
  33  |           status: 200,
  34  |           contentType: 'application/json',
  35  |           body: JSON.stringify({
  36  |             bitcoin: { usd: 61000, usd_24h_change: 1 },
  37  |             ethereum: { usd: 3000, usd_24h_change: 1 },
  38  |             solana: { usd: 100, usd_24h_change: 1 },
  39  |           }),
  40  |         });
  41  |       }
  42  |     });
  43  | 
  44  |     await page.goto('/');
  45  | 
  46  |     // Wait for initial prices to load
  47  |     await page.waitForSelector('[data-testid="price-value-BTC"]');
  48  | 
  49  |     // Verify initial price is displayed
  50  |     const initialPrice = page.locator('[data-testid="price-value-BTC"]');
> 51  |     await expect(initialPrice).toHaveText('$60,000.00');
      |                                ^ Error: expect(locator).toHaveText(expected) failed
  52  | 
  53  |     // Interact with the form to set an alert
  54  |     await page.selectOption('[aria-label="Coin"]', 'bitcoin');
  55  |     await page.selectOption('[aria-label="Direction"]', 'above');
  56  |     await page.fill('[aria-label="Threshold"]', '60500');
  57  |     await page.click('button:has-text("Set Alert")');
  58  | 
  59  |     // Verify the alert was added to the list
  60  |     await expect(page.locator('[data-testid="alerts-list"]')).toContainText('BTC');
  61  |     await expect(page.locator('[data-testid="alerts-list"]')).toContainText('≥$60,500.00');
  62  | 
  63  |     // Wait for the next poll cycle (15 seconds) to trigger price update
  64  |     // Since we can't easily wait for the timer, we'll reload to trigger a new fetch
  65  |     await page.reload();
  66  |     await page.waitForSelector('[data-testid="price-value-BTC"]');
  67  | 
  68  |     // Verify the alert banner appears when price crosses threshold
  69  |     await expect(page.locator('[data-testid="alert-banner"]')).toBeVisible();
  70  |     await expect(page.locator('[data-testid="alert-banner"]')).toContainText('BTC');
  71  |     await expect(page.locator('[data-testid="alert-banner"]')).toContainText('crossed above $60,500.00');
  72  |     await expect(page.locator('[data-testid="alert-banner"]')).toContainText('$61,000.00');
  73  | 
  74  |     // Test dismissing the banner
  75  |     await page.click('[aria-label="Dismiss alert"]');
  76  |     await expect(page.locator('[data-testid="alert-banner"]')).not.toBeVisible();
  77  |   });
  78  | 
  79  |   test('handles form validation correctly', async ({ page }) => {
  80  |     await page.goto('/');
  81  | 
  82  |     // Try to submit without entering a threshold
  83  |     await page.click('button:has-text("Set Alert")');
  84  |     
  85  |     // Verify no alert was added (form should prevent submission)
  86  |     await expect(page.locator('[data-testid="alerts-list"]')).not.toContainText('BTC');
  87  |   });
  88  | 
  89  |   test('displays error state when API fails', async ({ page }) => {
  90  |     await page.route('https://api.coingecko.com/api/v3/simple/price*', route => {
  91  |       route.abort('failed');
  92  |     });
  93  | 
  94  |     await page.goto('/');
  95  | 
  96  |     // Should show error message
  97  |     await expect(page.locator('text=/CoinGecko error/')).toBeVisible();
  98  |   });
  99  | 
  100 |   test('handles Notification API permission and execution', async ({ page }) => {
  101 |     // Mock the CoinGecko API with call counter BEFORE page.goto()
  102 |     let callCount = 0;
  103 |     await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
  104 |       callCount++;
  105 |       
  106 |       if (callCount === 1) {
  107 |         // Initial price: BTC at $60,000
  108 |         await route.fulfill({
  109 |           status: 200,
  110 |           contentType: 'application/json',
  111 |           body: JSON.stringify({
  112 |             bitcoin: { usd: 60000, usd_24h_change: 1 },
  113 |             ethereum: { usd: 3000, usd_24h_change: 1 },
  114 |             solana: { usd: 100, usd_24h_change: 1 },
  115 |           }),
  116 |         });
  117 |       } else {
  118 |         // Subsequent calls: BTC at $61,000 (crossing threshold)
  119 |         await route.fulfill({
  120 |           status: 200,
  121 |           contentType: 'application/json',
  122 |           body: JSON.stringify({
  123 |             bitcoin: { usd: 61000, usd_24h_change: 1 },
  124 |             ethereum: { usd: 3000, usd_24h_change: 1 },
  125 |             solana: { usd: 100, usd_24h_change: 1 },
  126 |           }),
  127 |         });
  128 |       }
  129 |     });
  130 | 
  131 |     await page.goto('/');
  132 | 
  133 |     // Wait for initial prices to load
  134 |     await page.waitForSelector('[data-testid="price-value-BTC"]');
  135 | 
  136 |     // Verify Notification API permission is granted
  137 |     const notificationPermission = await page.evaluate(() => {
  138 |       return Notification.permission;
  139 |     });
  140 |     expect(notificationPermission).toBe('granted');
  141 | 
  142 |     // Create an alert that will trigger
  143 |     await page.selectOption('[aria-label="Coin"]', 'bitcoin');
  144 |     await page.selectOption('[aria-label="Direction"]', 'above');
  145 |     await page.fill('[aria-label="Threshold"]', '60500');
  146 |     await page.click('button:has-text("Set Alert")');
  147 | 
  148 |     // Verify the alert was added to the list
  149 |     await expect(page.locator('[data-testid="alerts-list"]')).toContainText('BTC');
  150 | 
  151 |     // Reload to trigger price update (mocked to cross threshold)
```