import { accountService } from '$lib/server/services/account.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import { createAccountSchema } from '$lib/validations/account';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/admin/accounts/create:
 *   post:
 *     summary: Créer un compte pour un joueur existant
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [playerId, email]
 *             properties:
 *               playerId:
 *                 type: integer
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Compte créé, retourne le mot de passe temporaire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tempPassword:
 *                   type: string
 *                 user:
 *                   type: object
 *       403:
 *         description: Accès refusé
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		// Verify administrator status
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_ACCOUNTS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const body = await request.json();
		const validated = createAccountSchema.parse(body);

		// Execute account provisioning flow
		const result = await accountService.createAccountForPlayer(validated.playerId);

		return {
			tempPassword: result.tempPassword,
			user: result.user
		};
	});
};
