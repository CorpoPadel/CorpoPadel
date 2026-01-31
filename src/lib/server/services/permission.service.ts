import { db } from '$lib/server/db';
import { userRoles } from '$lib/server/db/app-schema';
import { eq } from 'drizzle-orm';

export interface UserPermissions {
	roles: string[];
	privileges: string[];
}

export class PermissionService {
	async getUserPermissions(userId: string): Promise<UserPermissions> {
		const userRolesData = await db.query.userRoles.findMany({
			where: eq(userRoles.userId, userId),
			with: {
				role: {
					with: {
						rolePrivileges: {
							with: {
								privilege: true
							}
						}
					}
				}
			}
		});

		const roles = userRolesData.map((ur: any) => ur.role.label);
		const privilegesSet = new Set<string>();

		for (const userRole of userRolesData) {
			for (const rolePrivilege of userRole.role.rolePrivileges) {
				privilegesSet.add(rolePrivilege.privilege.label);
			}
		}

		return {
			roles,
			privileges: Array.from(privilegesSet)
		};
	}

	async hasRole(userId: string, roleName: string): Promise<boolean> {
		const permissions = await this.getUserPermissions(userId);
		return permissions.roles.includes(roleName);
	}

	async hasPrivilege(userId: string, privilegeName: string): Promise<boolean> {
		const permissions = await this.getUserPermissions(userId);
		return permissions.privileges.includes(privilegeName);
	}

	async isAdmin(userId: string): Promise<boolean> {
		return this.hasRole(userId, 'ADMINISTRATEUR');
	}

	async hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
		const permissions = await this.getUserPermissions(userId);
		return roleNames.some((role) => permissions.roles.includes(role));
	}

	async hasAnyPrivilege(userId: string, privilegeNames: string[]): Promise<boolean> {
		const permissions = await this.getUserPermissions(userId);
		return privilegeNames.some((privilege) => permissions.privileges.includes(privilege));
	}
}

export const permissionService = new PermissionService();

export const getUserPermissions = (userId: string) => permissionService.getUserPermissions(userId);
export const hasRole = (userId: string, roleName: string) =>
	permissionService.hasRole(userId, roleName);
export const hasPrivilege = (userId: string, privilegeName: string) =>
	permissionService.hasPrivilege(userId, privilegeName);
export const isAdmin = (userId: string) => permissionService.isAdmin(userId);
export const hasAnyRole = (userId: string, roleNames: string[]) =>
	permissionService.hasAnyRole(userId, roleNames);
export const hasAnyPrivilege = (userId: string, privilegeNames: string[]) =>
	permissionService.hasAnyPrivilege(userId, privilegeNames);
