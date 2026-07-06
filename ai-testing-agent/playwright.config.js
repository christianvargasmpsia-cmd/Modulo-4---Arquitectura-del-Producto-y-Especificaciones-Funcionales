import { defineConfig } from "@playwright/test";

export default defineConfig({

    testDir: "./generated-tests",

    testMatch: "**/*.spec.js",

    timeout: 30000,

    use: {
        headless: true
    },

    reporter: [
        ["json", { outputFile: "reports/playwright-results.json" }]
    ]

});