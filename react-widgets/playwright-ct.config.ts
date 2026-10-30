import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.story.tsx',
  snapshotDir: './__snapshots__',
  timeout: 10 * 1000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
