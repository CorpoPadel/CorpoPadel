import { hasPrivilege } from '$lib/server/services/permission.service';
import { playerService } from '$lib/server/services/player.service';
import { createPlayerSchema } from '$lib/validations/player';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/players:
 *   get:
 *     summary: Récupérer la liste des joueurs
 *     description: Récupère la liste de tous les joueurs inscrits
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Liste des joueurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     players:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Player'
 *                     total:
 *                       type: integer
 */
export const GET: RequestHandler = async () => {
	return apiHandler(async () => {
		const players = await playerService.getAll();
		const total = await playerService.count();
		return { players, total };
	});
};

/**
 * @openapi
 * /api/v1/players:
 *   post:
 *     summary: Créer un nouveau joueur
 *     description: Crée un nouveau joueur (nécessite les privilèges MANAGE_PLAYERS)
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, licenseNumber, company]
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
 *         description: Joueur créé avec succès
 *       400:
 *         description: Erreur de validation
 *       409:
 *         description: Le numéro de licence existe déjà
 *       403:
 *         description: Accès refusé
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		// Secure access to administrators only
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_PLAYERS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const body = await request.json();
		const validated = createPlayerSchema.parse(body);

		// Unique constraint check for license number
		const existing = await playerService.getByLicense(validated.licenseNumber);
		if (existing) {
			throw AppError.conflict('Le numéro de licence existe déjà');
		}

		await playerService.create(validated);
		return null;
	});
};
