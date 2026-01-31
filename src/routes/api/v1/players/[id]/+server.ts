import { playerService } from '$lib/server/services/player.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { updatePlayerSchema } from '$lib/validations/player';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/players/{id}:
 *   get:
 *     summary: Récupérer un joueur
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du joueur
 *     responses:
 *       200:
 *         description: Détails du joueur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Joueur non trouvé
 *   put:
 *     summary: Mettre à jour un joueur
 *     tags: [Players]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joueur mis à jour
 *       403:
 *         description: Accès refusé
 *   delete:
 *     summary: Supprimer un joueur
 *     tags: [Players]
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
 *         description: Joueur supprimé
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async ({ params }) => {
	return apiHandler(async () => {
		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		// Retrieve player by primary ID
		const player = await playerService.getById(id);
		return player;
	});
};

/**
 * Updates player attributes. Limited to administrators.
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_PLAYERS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		const body = await request.json();
		const validated = updatePlayerSchema.parse(body);

		await playerService.update(id, validated);

		return null;
	});
};

/**
 * Deletes a player profile.
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_PLAYERS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		await playerService.delete(id);
		return null;
	});
};
