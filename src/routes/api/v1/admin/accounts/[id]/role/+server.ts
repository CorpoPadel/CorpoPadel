import { accountService } from '$lib/server/services/account.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import { updateRoleSchema } from '$lib/validations/account';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/admin/accounts/{id}/role:
 *   put:
 *     summary: Modifier le rôle d'un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMINISTRATEUR, JOUEUR]
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       403:
 *         description: Accès refusé
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	return apiHandler(async () => {
		// Secure access check
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_ACCOUNTS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = params.id;
		if (!id) throw AppError.badRequest('ID utilisateur manquant');

		const body = await request.json();
		const validated = updateRoleSchema.parse(body);

		// Apply role change via account service
		await accountService.changeUserRole(id, validated.role, locals.user?.id as string);

		return { message: 'Rôle mis à jour avec succès' };
	});
};
