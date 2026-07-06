import { Logger } from "../utils/Logger.js";

class MockAIService {

    async generate(prompt) {

        Logger.info("Modo DEMO - Mock AI");

        return `

import { test, expect } from '@playwright/test';

test('Generated Login Test', async ({ page }) => {

    await page.goto('https://playwright.dev');

    await expect(page).toHaveTitle(/Playwright/);

});

`;

    }

}

export default new MockAIService();