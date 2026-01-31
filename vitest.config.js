import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: resolve('./src/lib')
		}
	},
	test: {
		environment: 'node',
		exclude: ['node_modules', 'dist', 'coverage', 'e2e', '.features-gen'],
		globals: true,
		setupFiles: ['./src/lib/test/setup.ts'],
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './coverage',
			include: ['src/**/*.{js,ts}'],
			exclude: [
				'src/**/*.spec.{js,ts}',
				'src/**/*.test.{js,ts}',
				'src/**/*.d.ts',
				'src/**/*server.ts',
				'src/lib/server/db/seeders/*.{js,ts}',
				'src/lib/components/**/*.{js,ts}',
				'src/lib/server/swagger.ts',
				'src/lib/auth/**/*.{js,ts}',
				'src/lib/hooks/**/*.{js,ts}',
				'src/lib/test/**/*.{js,ts}'
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		}
	}
});
