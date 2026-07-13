import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4180/three-pixel-font-visual/'

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: 'line',
  testDir: './test/browser',
  timeout: 30_000,
  use: {
    baseURL,
    channel: 'chromium',
    launchOptions: {
      args: ['--enable-unsafe-webgpu'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview:visual:production',
    reuseExistingServer: false,
    stderr: 'pipe',
    stdout: 'pipe',
    timeout: 30_000,
    url: baseURL,
  },
  workers: 1,
})
