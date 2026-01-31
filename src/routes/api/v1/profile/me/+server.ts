import { playerService } from '$lib/server/services/player.service';
import { accountService } from '$lib/server/services/account.service';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import { updateProfileSchema } from '$lib/validations/profile';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/profile/me:
 *   get:
 *     summary: Récupérer le profil utilisateur connecté
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur et joueur associé
 *       401:
 *         description: Non authentifié
 *   put:
 *     summary: Mettre à jour le profil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       409:
 *         description: Email déjà utilisé
 *       401:
 *         description: Non authentifié
 */
export const GET: RequestHandler = async ({ locals }) => {
	return apiHandler(async () => {
		if (!locals.user) throw AppError.unauthorized();

		const userId = locals.user.id;
		const player = await playerService.getByUserId(userId);

		// Determine display role label
		const role = locals.permissions?.roles.includes('ADMINISTRATEUR') ? 'ADMINISTRATEUR' : 'JOUEUR';

		return {
			user: {
				id: locals.user.id,
				email: locals.user.email,
				role: role
			},
			player: player
				? {
						id: player.id,
						firstName: player.firstName,
						lastName: player.lastName,
						company: player.company,
						licenseNumber: player.licenseNumber,
						birthDate: player.birthDate
							? new Date(player.birthDate).toISOString().split('T')[0]
							: null,
						photoUrl: player.photoUrl
					}
				: null
		};
	});
};

/**
 * Updates the authenticated user's profile and linked player data.
 * Handles email changes with uniqueness check.
 */
export const PUT: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		const body = await request.json();
		const validated = updateProfileSchema.parse(body);
		const userId = locals.user?.id;

		if (!userId) throw AppError.unauthorized();

		// 1. Handle potential email update
		if (validated.email && validated.email !== locals.user?.email) {
			const existing = await db.select().from(user).where(eq(user.email, validated.email)).get();
			if (existing) throw AppError.conflict('Cet email est déjà utilisé');

			await accountService.updateUserEmail(userId, validated.email);
		}

		// 2. Update linked player record
		const player = await playerService.getByUserId(userId);
		if (player) {
			const { photo, ...playerData } = validated;
			await playerService.update(player.id, {
				...playerData,
				birthDate: playerData.birthDate ? new Date(playerData.birthDate) : null
			});
		}

		return null;
	});
};
