import { db } from '$lib/server/db';
import { roles, privileges, rolePrivileges } from '$lib/server/db/app-schema';

/** Initial list of privileges required for the system */
export const privilegesData = [
	{ label: 'MANAGE_PLAYERS' },
	{ label: 'MANAGE_TEAMS' },
	{ label: 'MANAGE_MATCHES' },
	{ label: 'MANAGE_EVENTS' },
	{ label: 'MANAGE_POOLS' },
	{ label: 'MANAGE_USERS' },
	{ label: 'MANAGE_ACCOUNTS' },
	{ label: 'VIEW_STATISTICS' },
	{ label: 'EDIT_SCORES' }
];

/**
 * Seeds roles and privileges and creates the mapping between them.
 */
export const seedRolesAndPrivileges = async () => {
	console.log('📋 Seeding Roles and Privileges...');

	// 1. Insert all privileges
	const insertedPrivileges = await db.insert(privileges).values(privilegesData).returning();
	console.log(`   ✓ ${insertedPrivileges.length} privileges created`);

	// 2. Insert main roles
	const rolesData = [{ label: 'ADMINISTRATEUR' }, { label: 'JOUEUR' }];
	const insertedRoles = await db.insert(roles).values(rolesData).returning();
	console.log(`   ✓ ${insertedRoles.length} roles created`);

	const adminRole = insertedRoles.find((r) => r.label === 'ADMINISTRATEUR');
	const playerRole = insertedRoles.find((r) => r.label === 'JOUEUR');

	if (!adminRole || !playerRole) {
		throw new Error(
			"Erreur critique: Les rôles 'ADMINISTRATEUR' ou 'JOUEUR' n'ont pas pu être créés."
		);
	}

	// 3. Map all privileges to the ADMINISTRATEUR role
	const adminPrivileges = insertedPrivileges.map((p) => ({
		roleId: adminRole.id,
		privilegeId: p.id
	}));
	await db.insert(rolePrivileges).values(adminPrivileges);

	// 4. Map a subset of privileges to the JOUEUR role
	const playerPrivs = insertedPrivileges
		.filter((p) => p.label === 'VIEW_STATISTICS')
		.map((p) => ({
			roleId: playerRole.id,
			privilegeId: p.id
		}));
	await db.insert(rolePrivileges).values(playerPrivs);

	console.log('   ✓ Privileges assigned to roles');

	return { adminRole, playerRole };
};
