import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationContext } from './applicationContext.svelte';
import { page } from '$app/state';
import { displayToast } from '$lib/utils/toast';
import { decodeState } from '$lib/utils/routes';

// Mock dependencies
vi.mock('$app/state', () => ({
	page: {
		url: {
			searchParams: {
				get: vi.fn(),
				delete: vi.fn()
			},
			pathname: '/',
			search: ''
		}
	}
}));

vi.mock('$lib/utils/routes', () => ({
	decodeState: vi.fn()
}));

vi.mock('$lib/utils/toast', () => ({
	displayToast: vi.fn()
}));

vi.mock('runed', () => ({
	watch: vi.fn((dep, effect) => {
		// Automatically run effect if dependency is a function
		if (typeof dep === 'function') {
			const val = dep();
			if (val) effect(val);
		}
	})
}));

// Mock Svelte runes and context
vi.mock('svelte', () => ({
	getContext: vi.fn(),
	setContext: vi.fn()
}));

describe('contexts/applicationContext', () => {
	let mockData: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockData = { user: { id: 'u1' }, permissions: { roles: [], privileges: [] }, player: null };

		// Mock window for history manipulation
		vi.stubGlobal('window', {
			location: { href: 'http://localhost/?state=xyz' },
			history: { replaceState: vi.fn(), state: {} }
		});
		vi.stubGlobal('document', { title: 'Test' });
		vi.stubGlobal('URL', class extends URL {});
	});

	it('should initialize with data', () => {
		const ctx = new ApplicationContext(mockData);
		expect(ctx.data).toEqual(mockData);
	});

	it('should update data', () => {
		const ctx = new ApplicationContext(mockData);
		const newData = { ...mockData, user: { id: 'u2' } };
		ctx.update(newData);
		expect(ctx.data).toEqual(newData);
	});

	it('should handle state from URL', () => {
		vi.mocked(page.url.searchParams.get).mockReturnValue('encoded_state');
		vi.mocked(decodeState).mockReturnValue({ toast: { content: 'Hi' } });

		const ctx = new ApplicationContext(mockData);

		expect(decodeState).toHaveBeenCalledWith('encoded_state');
		expect(displayToast).toHaveBeenCalledWith({ content: 'Hi' });
		// Should clear state from history by default
		expect(window.history.replaceState).toHaveBeenCalled();
	});

	it('should keep state in URL if requested', () => {
		vi.mocked(page.url.searchParams.get).mockReturnValue('encoded_state');
		vi.mocked(decodeState).mockReturnValue({ keepState: true, toast: { content: 'Hi' } });

		new ApplicationContext(mockData);

		expect(displayToast).toHaveBeenCalled();
		expect(window.history.replaceState).not.toHaveBeenCalled();
	});

	it('should ignore empty state param', () => {
		vi.mocked(page.url.searchParams.get).mockReturnValue(null);
		new ApplicationContext(mockData);
		expect(decodeState).not.toHaveBeenCalled();
	});
});
