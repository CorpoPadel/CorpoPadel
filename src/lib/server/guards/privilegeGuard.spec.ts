import { describe, it, expect, vi, beforeEach } from 'vitest';
import { privilegeGuard } from './privilegeGuard';
import { getRequestEvent } from '$app/server';
import { hasPrivilege } from '../services/permission.service';
import { redirect } from '@sveltejs/kit';

vi.mock('../services/permission.service', () => ({
	hasRole: vi.fn(),
	hasPrivilege: vi.fn()
}));

describe('server/guards/privilegeGuard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return true if user has privilege', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({
			locals: { user: { id: 'u1' } }
		} as any);
		vi.mocked(hasPrivilege).mockResolvedValue(true);

		const result = await privilegeGuard('EDIT');
		expect(result).toBe(true);
		expect(hasPrivilege).toHaveBeenCalledWith('u1', 'EDIT');
	});

	it('should redirect if user does not have privilege', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({
			locals: { user: { id: 'u1' } }
		} as any);
		vi.mocked(hasPrivilege).mockResolvedValue(false);

		await expect(privilegeGuard('EDIT')).rejects.toBeUndefined();
		expect(redirect).toHaveBeenCalled();
	});
});
