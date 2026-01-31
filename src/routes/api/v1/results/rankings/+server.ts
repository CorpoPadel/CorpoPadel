import { statService } from '$lib/server/services/stat.service';
import { apiHandler } from '$lib/server/utils/response';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/results/rankings:
 *   get:
 *     summary: Récupérer le classement global
 *     tags: [Results]
 *     responses:
 *       200:
 *         description: Classement des joueurs
 */
export const GET: RequestHandler = async () => {
	return apiHandler(async () => {
		// Calculate and return current tournament standings
		const result = await statService.getRanking();
		return result;
	});
};
