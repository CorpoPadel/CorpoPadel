import { teamService } from '$lib/server/services/team.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';
import { updateTeamSchema } from '$lib/validations/team';

/**
 * @openapi
 * /api/v1/teams/{id}:
 *   put:
 *     summary: Mettre à jour une équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               player1Id:
 *                 type: integer
 *               player2Id:
 *                 type: integer
 *               poolId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Équipe mise à jour
 *       403:
 *         description: Accès refusé
 *   delete:
 *     summary: Supprimer une équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Équipe supprimée
 *       403:
 *         description: Accès refusé
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_TEAMS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		await teamService.delete(id);

		return null;
	});
};

/**
 * Updates a team duo attributes.
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_TEAMS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		const body = await request.json();
		const validated = updateTeamSchema.parse(body);

		await teamService.update(id, validated);

		return null;
	});
};
