import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: 'line',
  testDir: './test/browser',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4180/',
    channel: 'chromium',
    launchOptions: {
      args: ['--enable-unsafe-webgpu'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev:visual',
    reuseExistingServer: false,
    stderr: 'pipe',
    stdout: 'pipe',
    timeout: 30_000,
    url: 'http://127.0.0.1:4180/',
  },
  workers: 1,
})
