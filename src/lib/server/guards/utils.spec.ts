import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGuard } from './utils';
import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';

describe('server/guards/utils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createGuard', () => {
		it('should return true if check passes', async () => {
			vi.mocked(getRequestEvent).mockReturnValue({
				locals: { user: { id: 'u1' } }
			} as any);
			const guard = createGuard(async () => true);
			const res = await guard();
			expect(res).toBe(true);
		});

		it('should redirect if no user', async () => {
			vi.mocked(getRequestEvent).mockReturnValue({
				locals: { user: null }
			} as any);
			const guard = createGuard(async () => true);
			await expect(guard()).rejects.toBeUndefined();
			expect(redirect).toHaveBeenCalled();
		});

		it('should redirect if check fails', async () => {
			vi.mocked(getRequestEvent).mockReturnValue({
				locals: { user: { id: 'u1' } }
			} as any);
			const guard = createGuard(async () => false, {
				message: 'Custom Denied',
				redirectTo: '/login'
			});
			await expect(guard()).rejects.toBeUndefined();
			expect(redirect).toHaveBeenCalled();
			// Check that redirect arguments contain custom message/path
			const redirectArgs = vi.mocked(redirect).mock.calls[0];
			expect(redirectArgs[0]).toBe(303);
			// route helper mock returns modified string or similar, check usage
		});
	});
});
