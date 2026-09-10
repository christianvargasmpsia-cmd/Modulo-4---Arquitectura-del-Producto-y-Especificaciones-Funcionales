import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: __dirname,
  testMatch: 'compra-poc.spec.ts',
  retries: 0,
  workers: 1,
  outputDir: '../../docs/evidencias/modulo-7/resultados',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../docs/evidencias/modulo-7/reporte', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    channel: 'msedge',
    trace: 'on',
  },
  globalSetup: './poc-server.cjs',
});
