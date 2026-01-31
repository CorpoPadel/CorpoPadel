import { accountService } from '$lib/server/services/account.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/admin/accounts/{user_id}/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe d'un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé, retourne le nouveau mot de passe temporaire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tempPassword:
 *                   type: string
 *       403:
 *         description: Accès refusé
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_ACCOUNTS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const userId = params.user_id;
		if (!userId) throw AppError.badRequest('ID utilisateur manquant');

		// Perform password reset and generate new temporary credentials
		const result = await accountService.resetPassword(userId);

		return {
			tempPassword: result.tempPassword
		};
	});
};
