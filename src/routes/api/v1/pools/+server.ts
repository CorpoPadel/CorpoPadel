import { poolService } from '$lib/server/services/pool.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';
import { createPoolSchema } from '$lib/validations/pool';

/**
 * @openapi
 * /api/v1/pools:
 *   get:
 *     summary: Récupérer la liste des poules
 *     tags: [Pools]
 *     responses:
 *       200:
 *         description: Liste des poules
 *   post:
 *     summary: Créer une poule
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               team_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Poule créée
 *       409:
 *         description: Une poule avec ce nom existe déjà
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async () => {
	return apiHandler(async () => {
		const pools = await poolService.getAll();
		return { pools };
	});
};

/**
 * Creates a new tournament pool and optionally assigns teams to it.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		// Authorization
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_POOLS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const body = await request.json();
		const validated = createPoolSchema.parse(body);

		// Logical uniqueness check
		const existing = await poolService.getByName(validated.name);
		if (existing) throw AppError.conflict('Une poule avec ce nom existe déjà');

		await poolService.createWithTeams(validated.name, validated.team_ids);

		return null;
	});
};
