import { teamService } from '$lib/server/services/team.service';
import { playerService } from '$lib/server/services/player.service';
import { poolService } from '$lib/server/services/pool.service';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/admin/stats:
 *   get:
 *     summary: Récupérer les statistiques globales
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques (utilisateurs, joueurs, équipes, poules)
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async ({ locals }) => {
	return apiHandler(async () => {
		// Secure access check
		if (!(await hasPrivilege(locals.user?.id as string, 'VIEW_STATISTICS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		// Aggregate counts from all main entities
		const [playersCount, teamsCount, poolsCount, usersResult] = await Promise.all([
			playerService.count(),
			teamService.count(),
			poolService.count(),
			db.select({ count: count() }).from(user)
		]);

		return {
			users: usersResult[0]?.count || 0,
			players: playersCount,
			teams: teamsCount,
			pools: poolsCount
		};
	});
};
