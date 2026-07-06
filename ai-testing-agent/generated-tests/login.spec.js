

import { test, expect } from '@playwright/test';

test('Generated Login Test', async ({ page }) => {

    await page.goto('https://playwright.dev');

    await expect(page).toHaveTitle(/Playwright/);

});

