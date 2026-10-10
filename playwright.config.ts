import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

export default defineConfig({
	testDir:       './e2e',
	snapshotDir:   './e2e/snapshots',
	fullyParallel: true,
	forbidOnly:    !!process.env.CI,
	retries:       process.env.CI ? 1 : 0,
	updateSnapshots: process.env.CI ? 'none' : 'missing',
	reporter:      process.env.CI ? [['html', { open: 'never' }], ['json', { outputFile: 'playwright-results.json' }], ['list']] : 'list',
	expect:        { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
	use:           { baseURL: `http://localhost:${PORT}`, contextOptions: { reducedMotion: 'reduce' } },
	projects:      [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } }],
	webServer:     {
		command:             `npm run build && npx next start -p ${PORT}`,
		url:                 `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout:             240_000,
	},
});
