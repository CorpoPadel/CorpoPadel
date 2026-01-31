import { vi } from 'vitest';

vi.mock('svelte', () => ({
	setContext: vi.fn(),
	getContext: vi.fn()
}));

vi.mock('$app/server', () => ({
	getRequestEvent: vi.fn()
}));

vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn(),
	error: vi.fn(),
	json: vi.fn((data, init) => ({
		json: () => Promise.resolve(data),
		status: init?.status || 200
	}))
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn(),
		set: vi.fn()
	},
	navigating: {
		subscribe: vi.fn(),
		set: vi.fn()
	},
	updated: {
		subscribe: vi.fn(),
		set: vi.fn()
	}
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn()
}));

vi.mock('$app/forms', () => ({
	enhance: vi.fn()
}));

vi.mock('$app/paths', () => ({
	resolve: vi.fn((route: string, params?: any) => {
		if (!params) return route;
		let result = route;
		for (const [key, value] of Object.entries(params)) {
			result = result.replace(`[${key}]`, String(value));
		}
		return result;
	})
}));

vi.mock('$app/state', () => ({
	page: {
		url: {
			searchParams: {
				get: vi.fn()
			}
		}
	}
}));

vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false,
	version: 'test'
}));

// Global mocks for third-party libraries

import './mocks/svelte-sonner';

import './mocks/svelte-runes';
