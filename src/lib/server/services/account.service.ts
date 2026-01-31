import { db } from '$lib/server/db';
import { players, userRoles, roles } from '$lib/server/db/app-schema';
import { user, account } from '$lib/server/db/schema';
import { count, eq, and } from 'drizzle-orm';
import auth from '$lib/server/auth';
import { hashPassword } from 'better-auth/crypto';
import { AppError } from '$lib/server/utils/error';

/**
 * Service responsible for managing user accounts, authentication data, and linking users to players.
 */
export class AccountService {
	/**
	 * Creates a new authentication account for an existing player record.
	 * Generates a temporary password and assigns the default 'JOUEUR' role.
	 */
	async createAccountForPlayer(playerId: number): Promise<{ tempPassword: string; user: any }> {
		const player = await db.query.players.findFirst({
			where: eq(players.id, playerId)
		});

		if (!player) throw AppError.notFound('Joueur introuvable');
		if (player.userId) throw AppError.conflict('Ce joueur a déjà un compte');

		const email = player.email;
		if (!email) throw AppError.badRequest("Le joueur n'a pas d'adresse email définie.");

		// Ensure email is unique across the system
		const existingUser = await db.select().from(user).where(eq(user.email, email)).get();
		if (existingUser) {
			throw AppError.conflict('Un compte utilisateur existe déjà avec cet email.');
		}

		const tempPassword = this.generatePassword();

		// Create user in authentication system
		const newUser = await auth.api.signUpEmail({
			body: {
				email: email,
				password: tempPassword,
				name: `${player.firstName} ${player.lastName}`
			},
			asResponse: false
		});

		if (!newUser) {
			throw new AppError("Erreur lors de la création de l'utilisateur Auth", 500);
		}

		// Assign default player role
		const playerRole = await db.select().from(roles).where(eq(roles.label, 'JOUEUR')).get();
		if (playerRole) {
			await db.insert(userRoles).values({
				userId: newUser.user.id,
				roleId: playerRole.id
			});
		}

		// Link player profile to the new user account
		await db.update(players).set({ userId: newUser.user.id }).where(eq(players.id, playerId));

		// Flag the user to change their temporary password on next login
		await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, newUser.user.id));

		return { tempPassword, user: newUser.user };
	}

	/**
	 * Resets a user's password to a newly generated temporary one.
	 */
	async resetPassword(userId: string): Promise<{ tempPassword: string }> {
		const userFound = await db.select().from(user).where(eq(user.id, userId)).get();
		if (!userFound) throw AppError.notFound('Utilisateur introuvable');

		const tempPassword = this.generatePassword();
		const hashedPassword = await hashPassword(tempPassword);

		// Update the credential provider record
		await db
			.update(account)
			.set({ password: hashedPassword })
			.where(and(eq(account.userId, userId), eq(account.providerId, 'credential')));

		// Force password change on next sign-in
		await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, userId));

		return { tempPassword };
	}

	/**
	 * Updates the primary email of a user and resets their verification status.
	 */
	async updateUserEmail(userId: string, newEmail: string): Promise<void> {
		await db.update(user).set({ email: newEmail, emailVerified: false }).where(eq(user.id, userId));
	}

	/**
	 * Returns the total number of user accounts in the system.
	 */
	async countAccounts(): Promise<number> {
		const [result] = await db.select({ count: count() }).from(user);
		return result.count;
	}

	/**
	 * Generates a random secure temporary password of 12 characters.
	 * Ensures presence of lowercase, uppercase, digits and special characters.
	 */
	generatePassword(): string {
		const lower = 'abcdefghijklmnopqrstuvwxyz';
		const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const numbers = '0123456789';
		const special = '!@#$%^&*()_+';
		const all = lower + upper + numbers + special;

		let password = '';

		// Guarantee required characters
		password += lower[Math.floor(Math.random() * lower.length)];
		password += upper[Math.floor(Math.random() * upper.length)];
		password += numbers[Math.floor(Math.random() * numbers.length)];
		password += special[Math.floor(Math.random() * special.length)];

		// Fill the rest
		for (let i = 4; i < 12; i++) {
			password += all[Math.floor(Math.random() * all.length)];
		}

		// Shuffle the characters
		return password
			.split('')
			.sort(() => 0.5 - Math.random())
			.join('');
	}

	/**
	 * Changes a user's role. Prevents administrators from changing their own role.
	 */
	async changeUserRole(userId: string, newRoleLabel: string, currentUserId: string): Promise<void> {
		if (userId === currentUserId) {
			throw AppError.forbidden('Vous ne pouvez pas modifier votre propre rôle.');
		}

		const role = await db.select().from(roles).where(eq(roles.label, newRoleLabel)).get();
		if (!role) throw AppError.notFound(`Rôle ${newRoleLabel} introuvable`);

		// We assume one role per user for simplicity in this implementation
		await db.delete(userRoles).where(eq(userRoles.userId, userId));
		await db.insert(userRoles).values({
			userId: userId,
			roleId: role.id
		});
	}

	/**
	 * Deletes a user account. Prevents users from deleting themselves.
	 */
	async deleteAccount(userId: string, currentUserId: string): Promise<void> {
		if (userId === currentUserId) {
			throw AppError.forbidden('Vous ne pouvez pas supprimer votre propre compte.');
		}

		const userFound = await db.select().from(user).where(eq(user.id, userId)).get();
		if (!userFound) throw AppError.notFound('Utilisateur introuvable');

		await db.delete(user).where(eq(user.id, userId));
	}

	/**
	 * Securely changes a user's password and removes the 'mustChangePassword' requirement.
	 */
	async changePassword(userId: string, newPassword: string): Promise<void> {
		const hashedPassword = await hashPassword(newPassword);

		await db
			.update(account)
			.set({ password: hashedPassword })
			.where(and(eq(account.userId, userId), eq(account.providerId, 'credential')));

		await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, userId));
	}
}

export const accountService = new AccountService();
