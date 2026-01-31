import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
	features: 'e2e/features/connexion.feature',
	steps: 'e2e/steps/connexion.ts'
});

export default defineConfig({
	testDir,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:5173',
		headless: true
	},
	webServer: {
		command: 'bun run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
