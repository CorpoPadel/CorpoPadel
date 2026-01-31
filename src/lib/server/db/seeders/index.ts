import { reset } from 'drizzle-seed';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import * as appSchema from '$lib/server/db/app-schema';

import { seedAuth } from './authSeeder';
import { seedRolesAndPrivileges } from './rolesSeeder';
import { seedTournamentData } from './tournamentSeeder';

/**
 * Main seeding function to initialize the database with a clean state and sample data.
 */
const main = async () => {
	console.log('🌱 Starting Database Seeding...');

	console.log('🧹 Cleaning up database...');

	await db.run(`PRAGMA foreign_keys = OFF`);
	// @ts-ignore - Drizzle reset types are sometimes incompatible with LibSQL
	await reset(db, { ...schema, ...appSchema });
	await db.run(`PRAGMA foreign_keys = ON`);

	// 1. Seed global permissions system
	const { adminRole, playerRole } = await seedRolesAndPrivileges();

	// 2. Seed domain-specific data (players, teams, pools, events)
	const tournamentData = await seedTournamentData();

	// 3. Seed user accounts and link them to players
	await seedAuth(adminRole.id, playerRole.id, tournamentData.players);

	console.log('✅ Seeding completed successfully!');
	console.log('--------------------------------');
	console.log('👉 Admin: admin@corpopadel.com / Admin@123456789');
	console.log('👉 User: user@corpopadel.com / User@123456789');
	console.log('--------------------------------');
};

main().catch((err) => {
	console.error('❌ Critical error during seeding:', err);
	process.exit(1);
});
