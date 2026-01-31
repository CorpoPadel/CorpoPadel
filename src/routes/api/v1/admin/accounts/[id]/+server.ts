import { accountService } from '$lib/server/services/account.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/admin/accounts/{id}:
 *   delete:
 *     summary: Supprimer un compte utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compte supprimé
 *       403:
 *         description: Accès refusé
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_ACCOUNTS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = params.id;
		if (!id) throw AppError.badRequest('ID utilisateur manquant');

		// Service call to delete the authentication account
		await accountService.deleteAccount(id, locals.user?.id as string);

		return { message: 'Compte supprimé avec succès' };
	});
};
