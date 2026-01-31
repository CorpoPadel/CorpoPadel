import { teamService } from '$lib/server/services/team.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { createTeamSchema } from '$lib/validations/team';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/teams:
 *   get:
 *     summary: Récupérer la liste des équipes
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: pool_id
 *         schema:
 *           type: integer
 *         description: Filtrer par poule
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filtrer par entreprise
 *     responses:
 *       200:
 *         description: Liste des équipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *                 total:
 *                   type: integer
 *   post:
 *     summary: Créer une équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, player1Id, player2Id]
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
 *         description: Équipe créée
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async ({ url }) => {
	return apiHandler(async () => {
		// Parsing search filters from query string
		const poolIdParam = url.searchParams.get('pool_id');
		const poolId = poolIdParam ? parseInt(poolIdParam) : undefined;
		const company = url.searchParams.get('company') || undefined;

		const teams = await teamService.getFiltered({ poolId, company });
		const total = await teamService.count({ poolId, company });

		return {
			teams,
			total
		};
	});
};

/**
 * Handles creation of a new team duo.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		// Guard privilege
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_TEAMS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const body = await request.json();
		const validated = createTeamSchema.parse(body);

		await teamService.create({
			company: validated.company,
			player1Id: validated.player1Id,
			player2Id: validated.player2Id,
			poolId: validated.poolId
		});

		return null;
	});
};
