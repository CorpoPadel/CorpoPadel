import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb } from '$lib/test/mocks/db';
import {
	PermissionService,
	hasRole,
	isAdmin,
	hasAnyRole,
	hasPrivilege,
	hasAnyPrivilege,
	getUserPermissions
} from './permission.service';

vi.mock('$lib/server/db/app-schema', () => ({
	userRoles: { userId: 'userId' }
}));

describe('services/permission.service', () => {
	let service: PermissionService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new PermissionService();
	});

	describe('getUserPermissions', () => {
		it('should return roles and privileges', async () => {
			const mockData = [
				{
					role: {
						label: 'ADMIN',
						rolePrivileges: [{ privilege: { label: 'MANAGE_USERS' } }]
					}
				}
			];
			mockDb.query.userRoles.findMany.mockResolvedValue(mockData);

			const perms = await service.getUserPermissions('u1');
			expect(perms.roles).toContain('ADMIN');
			expect(perms.privileges).toContain('MANAGE_USERS');
		});
	});

	describe('isAdmin', () => {
		it('should return true if has ADMINISTRATEUR role', async () => {
			const mockData = [{ role: { label: 'ADMINISTRATEUR', rolePrivileges: [] } }];
			mockDb.query.userRoles.findMany.mockResolvedValue(mockData);
			expect(await service.isAdmin('u1')).toBe(true);
		});
	});

	describe('helpers', () => {
		beforeEach(() => {
			const mockData = [
				{
					role: {
						label: 'USER',
						rolePrivileges: [{ privilege: { label: 'READ' } }]
					}
				}
			];
			mockDb.query.userRoles.findMany.mockResolvedValue(mockData);
		});

		it('hasRole should return true if exists', async () => {
			expect(await service.hasRole('u1', 'USER')).toBe(true);
			expect(await service.hasRole('u1', 'ADMIN')).toBe(false);
		});

		it('hasPrivilege should return true if exists', async () => {
			expect(await service.hasPrivilege('u1', 'READ')).toBe(true);
			expect(await service.hasPrivilege('u1', 'WRITE')).toBe(false);
		});

		it('hasAnyRole should return true if any match', async () => {
			expect(await service.hasAnyRole('u1', ['USER', 'GUEST'])).toBe(true);
			expect(await service.hasAnyRole('u1', ['GUEST'])).toBe(false);
		});

		it('hasAnyPrivilege should return true if any match', async () => {
			expect(await service.hasAnyPrivilege('u1', ['READ', 'WRITE'])).toBe(true);
			expect(await service.hasAnyPrivilege('u1', ['WRITE'])).toBe(false);
		});
	});

	describe('standalone exports', () => {
		it('should call internal service methods', async () => {
			const mockData = [{ role: { label: 'JOUEUR', rolePrivileges: [] } }];
			mockDb.query.userRoles.findMany.mockResolvedValue(mockData);

			expect(await getUserPermissions('u1')).toBeDefined();
			expect(await hasRole('u1', 'JOUEUR')).toBe(true);
			expect(await isAdmin('u1')).toBe(false);
			expect(await hasAnyRole('u1', ['JOUEUR'])).toBe(true);
			expect(await hasPrivilege('u1', 'X')).toBe(false);
			expect(await hasAnyPrivilege('u1', ['X'])).toBe(false);
		});
	});
});
