// @ts-nocheck — 本文件由 Playwright 加载；根项目未包含 Node 类型时避免 IDE 误报
import path from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * 请在仓库根目录执行 Playwright，例如：
 * npx playwright test --config .cursor/qa_tests/playwright.config.ts
 * 此时 process.cwd() 为仓库根，与本配置中的路径拼接一致。
 */
const repoRoot = process.cwd();
const qaRoot = path.join(repoRoot, '.cursor', 'qa_tests');

export default defineConfig({
  testDir: path.join(qaRoot, 'e2e'),
  outputDir: path.join(qaRoot, 'results', 'test-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: path.join(qaRoot, 'results', 'playwright-report'),
        open: 'never',
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: true,
    cwd: repoRoot,
  },
});
