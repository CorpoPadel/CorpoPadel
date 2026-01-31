import auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userRoles, players } from '$lib/server/db/app-schema';
import { eq, type InferSelectModel } from 'drizzle-orm';

type Player = InferSelectModel<typeof players>;

/**
 * Seeds initial user accounts and links them to player profiles.
 * Creates one Admin and one standard User for testing purposes.
 */
export async function seedAuth(
	adminRoleId: number | undefined,
	playerRoleId: number | undefined,
	existingPlayers: Player[] = []
) {
	console.log('👤 Creating users via Better-Auth API...');

	try {
		// 1. Create the default administrator account
		const adminResult = await auth.api.signUpEmail({
			body: {
				email: 'admin@corpopadel.com',
				password: 'Admin@123456789',
				name: 'Administrateur'
			},
			asResponse: false
		});

		if (adminResult && adminRoleId) {
			// Assign ADMINISTRATEUR role
			await db.insert(userRoles).values({
				userId: adminResult.user.id,
				roleId: adminRoleId
			});
			console.log('   ✅ Admin created: admin@corpopadel.com (Admin@123456789)');

			// Link to the first available player profile if it exists
			if (existingPlayers.length > 0) {
				await db
					.update(players)
					.set({ userId: adminResult.user.id })
					.where(eq(players.id, existingPlayers[0].id));
				console.log(
					`      🔗 Linked to player: ${existingPlayers[0].firstName} ${existingPlayers[0].lastName}`
				);
			}
		}

		// 2. Create a standard player account
		const userResult = await auth.api.signUpEmail({
			body: {
				email: 'user@corpopadel.com',
				password: 'User@123456789',
				name: 'Utilisateur Test'
			},
			asResponse: false
		});

		if (userResult && playerRoleId) {
			// Assign JOUEUR role
			await db.insert(userRoles).values({
				userId: userResult.user.id,
				roleId: playerRoleId
			});
			console.log('   ✅ User created: user@corpopadel.com (User@123456789)');

			// Link to the second available player profile
			if (existingPlayers.length > 1) {
				await db
					.update(players)
					.set({ userId: userResult.user.id })
					.where(eq(players.id, existingPlayers[1].id));
				console.log(
					`      🔗 Linked to player: ${existingPlayers[1].firstName} ${existingPlayers[1].lastName}`
				);
			}
		}
	} catch (e) {
		console.log('   ⚠️ Error while creating users:', e);
	}
}
