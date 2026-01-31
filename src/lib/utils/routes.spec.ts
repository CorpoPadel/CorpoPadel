import { describe, it, expect, vi } from 'vitest';
import { route } from './routes';
import { resolve } from '$app/paths';

describe('utils/routes', () => {
	it('should resolve parameterless route', () => {
		route('/');
		expect(resolve).toHaveBeenCalledWith('/');
	});

	it('should resolve parameterized route', () => {
		route('/api/v1/admin/accounts/[id]', { params: { id: '123' } });
		expect(resolve).toHaveBeenCalledWith('/api/v1/admin/accounts/[id]', { id: '123' });
	});

	it('should append state parameter when options provided', () => {
		route('/auth/sign-in', { redirectTo: '/dashboard' });
		// We expect resolve to be called with modified string
		// The exact string depends on base64 encoding of { redirectTo: '/dashboard' }
		const args = vi.mocked(resolve).mock.calls[vi.mocked(resolve).mock.calls.length - 1];
		expect(args[0]).toContain('?state=');
	});

	it('should handle toast in state', () => {
		route('/', { toast: { type: 'success', message: 'Hi' } });
		const args = vi.mocked(resolve).mock.calls[vi.mocked(resolve).mock.calls.length - 1];
		expect(args[0]).toContain('?state=');
	});

	it('should not append state if options are empty or not provided', () => {
		route('/', {});
		const args = vi.mocked(resolve).mock.calls[vi.mocked(resolve).mock.calls.length - 1];
		expect(args[0]).not.toContain('?state=');
	});
});
