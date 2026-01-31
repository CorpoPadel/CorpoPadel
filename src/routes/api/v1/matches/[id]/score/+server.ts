import { matchService } from '$lib/server/services/match.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import { patchScoreSchema } from '$lib/validations/match';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/matches/{id}/score:
 *   patch:
 *     summary: Mettre à jour le score d'un match
 *     tags: [Matches]
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
 *               scoreTeam1:
 *                 type: string
 *               scoreTeam2:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, CANCELED]
 *     responses:
 *       200:
 *         description: Score mis à jour
 *       403:
 *         description: Accès refusé
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_MATCHES'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const matchId = Number(params.id);
		if (isNaN(matchId)) throw AppError.badRequest('ID invalide');

		const body = await request.json();
		const validated = patchScoreSchema.parse(body);

		// Update specific score and status fields
		await matchService.update(matchId, {
			scoreTeam1: validated.scoreTeam1,
			scoreTeam2: validated.scoreTeam2,
			status: validated.status as any,
			updatedAt: new Date()
		});

		return null;
	});
};
