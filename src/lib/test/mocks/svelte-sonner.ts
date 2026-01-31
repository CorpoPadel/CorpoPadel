import { vi } from 'vitest';

vi.mock('svelte-sonner', () => ({
	toast: Object.assign(vi.fn(), {
		success: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
		error: vi.fn(),
		loading: vi.fn()
	})
}));
