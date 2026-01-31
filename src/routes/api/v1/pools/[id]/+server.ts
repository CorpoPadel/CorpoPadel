import { poolService } from '$lib/server/services/pool.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import { updatePoolSchema } from '$lib/validations/pool';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/pools/{id}:
 *   put:
 *     summary: Mettre à jour une poule
 *     tags: [Pools]
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
 *               name:
 *                 type: string
 *               team_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Poule mise à jour
 *       403:
 *         description: Accès refusé
 *   delete:
 *     summary: Supprimer une poule
 *     tags: [Pools]
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
 *         description: Poule supprimée
 *       403:
 *         description: Accès refusé
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_POOLS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		await poolService.delete(id);

		return null;
	});
};

/**
 * Updates a tournament pool's name and its teams membership.
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_POOLS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		const body = await request.json();
		const validated = updatePoolSchema.parse(body);

		await poolService.update(id, validated.name, validated.team_ids);

		return null;
	});
};
