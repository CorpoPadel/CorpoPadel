import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleGuard } from './roleGuard';
import { getRequestEvent } from '$app/server';
import { hasRole } from '../services/permission.service';
import { redirect } from '@sveltejs/kit';

vi.mock('../services/permission.service', () => ({
	hasRole: vi.fn(),
	hasPrivilege: vi.fn()
}));

describe('server/guards/roleGuard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return true if user has role', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({
			locals: { user: { id: 'u1' } }
		} as any);
		vi.mocked(hasRole).mockResolvedValue(true);

		const result = await roleGuard('ADMIN');
		expect(result).toBe(true);
		expect(hasRole).toHaveBeenCalledWith('u1', 'ADMIN');
	});

	it('should redirect if user does not have role', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({
			locals: { user: { id: 'u1' } }
		} as any);
		vi.mocked(hasRole).mockResolvedValue(false);

		await expect(roleGuard('ADMIN')).rejects.toBeUndefined(); // redirect throws
		expect(redirect).toHaveBeenCalled();
	});
});
